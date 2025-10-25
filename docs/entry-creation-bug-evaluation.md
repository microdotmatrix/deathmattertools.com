# Entry Creation Bug Evaluation

**Date:** October 25, 2025  
**Issue:** New users unable to create entries - foreign key constraint violation

## Problem Summary

When a newly created user attempts to create their first entry, the operation fails with a foreign key constraint violation:

```
Error [NeonDbError]: insert or update on table "v1_entry" violates foreign key constraint "v1_entry_user_id_v1_user_id_fk"
Key (user_id)=(user_34ZrCceEDDXfJJgrn3kYA9j1HPx) is not present in table "v1_user".
```

**Key Finding:** The userId from Clerk (`user_34ZrCceEDDXfJJgrn3kYA9j1HPx`) does not exist in the `v1_user` table, causing the foreign key constraint to fail.

## System Architecture

### Database Schema

The application uses Drizzle ORM with a table prefix system:

```typescript
// src/lib/db/utils.ts
export const pgTable = pgTableCreator(
  (name) => `${process.env.DATABASE_PREFIX}_${name}`
);
```

With `DATABASE_PREFIX="v1"`, this creates:
- `UserTable` → `v1_user` 
- `EntryTable` → `v1_entry`

### User Table Schema

```typescript
// src/lib/db/schema/users.ts
export const UserTable = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});
```

### Entry Table Schema

```typescript
// src/lib/db/schema/entries.ts
export const EntryTable = pgTable("entry", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  organizationId: text("organization_id"),
  name: text("name").notNull(),
  dateOfBirth: timestamp("date_of_birth"),
  dateOfDeath: timestamp("date_of_death"),
  locationBorn: text("location_born"),
  locationDied: text("location_died"),
  image: text("image"),
  causeOfDeath: text("cause_of_death"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});
```

**Foreign Key Constraint:** `userId` in `EntryTable` references `UserTable.id` with cascade deletion.

## User Creation Flow

### 1. Clerk Webhook Handler

**File:** `src/app/api/webhooks/clerk/route.ts`

```typescript
export async function POST(request: NextRequest) {
  try {
    const event = await verifyWebhook(request)

    switch (event.type) {
      case "user.created":
      case "user.updated":
        const clerkData = event.data;
        const email = clerkData.email_addresses.find(
          (e) => e.id === clerkData.primary_email_address_id
        )?.email_address
        
        if (email == null) {
          return new Response("No email address found", { status: 400 })
        }
        
        await upsertUserWebhook({
          id: clerkData.id,
          name: `${clerkData.first_name} ${clerkData.last_name}`,
          email,
          imageUrl: clerkData.image_url,
          createdAt: new Date(clerkData.created_at),
          updatedAt: new Date(clerkData.updated_at),
        })
        break;
      
      case "user.deleted":
        if (event.data.id == null) {
          return new Response("No user id found", { status: 400 })
        }
        await deleteUser(event.data.id)
        break;
      
      default:
        break;
    }
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error: Invalid Webhook", { status: 500 })
  }

  return new Response("Webhook executed", { status: 200 })
}
```

### 2. Database Upsert Function

**File:** `src/lib/db/mutations/auth.ts`

```typescript
export const upsertUserWebhook = async (user: User) => {
  try {
    await db
      .insert(UserTable)
      .values(user)
      .onConflictDoUpdate({
        target: [UserTable.id],
        set: user,
      });
  } catch (error) {
    console.error("Error upserting user:", error);
    return null;
  }
}
```

**Issue Identified:** This function catches and logs errors but returns `null` on failure. The webhook handler doesn't check the return value, so it returns a 200 success response even if the database operation fails.

## Entry Creation Flow

### 1. Form Component

**File:** `src/components/sections/dashboard/create-form.tsx`

The form uses React's `useActionState` to submit data to the server action:

```typescript
const [state, formAction, pending] = useActionState<ActionState, FormData>(
  createEntryAction,
  { error: "" }
);
```

Form fields:
- `name` (required)
- `dateOfBirth`
- `dateOfDeath`
- `birthLocation`
- `deathLocation`
- `image`
- `causeOfDeath`

### 2. Server Action

**File:** `src/lib/db/mutations/entries.ts`

```typescript
export const createEntryAction = action(CreateEntrySchema, async (data) => {
  const { userId, orgId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }
  
  try {
    await db.insert(EntryTable).values({
      id: crypto.randomUUID(),
      name: data.name,
      dateOfBirth: new Date(data.dateOfBirth),
      dateOfDeath: new Date(data.dateOfDeath),
      locationBorn: data.birthLocation,
      locationDied: data.deathLocation,
      image: data.image,
      causeOfDeath: data.causeOfDeath,
      userId,                          // <-- THIS IS WHERE THE ERROR OCCURS
      organizationId: orgId ?? null,
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create entry" };
  } finally {
    revalidatePath("/dashboard");
  }
});
```

**The userId comes from Clerk's `auth()` function, which returns the authenticated user's ID.**

## Root Cause Analysis

### Primary Issue: Webhook Failure Silently Ignored

The webhook handler has a critical flaw in error handling:

1. When `upsertUserWebhook()` fails, it returns `null` but the error is only logged
2. The webhook handler doesn't check this return value
3. The webhook returns a 200 success response to Clerk even when the database operation fails
4. Clerk thinks the user was successfully created in the database
5. The user can authenticate and use the app, but their record doesn't exist in `v1_user`
6. When they try to create an entry, the foreign key constraint fails

### Why Existing Users Work

Users created before recent database changes likely:
1. Had their webhook successfully process
2. Have valid records in the `v1_user` table
3. Can create entries without foreign key violations

### Potential Causes of Webhook Failure

The webhook might fail for several reasons:

1. **Database connection issues** during webhook processing
2. **Schema mismatch** - The `User` type might not match what Clerk sends
3. **Validation errors** - Email, name, or other fields might not meet constraints
4. **Timing issues** - The webhook might fire before database migrations complete
5. **Missing environment variables** - `DATABASE_PREFIX` or `DATABASE_URL` might be incorrect in production
6. **Duplicate email constraint** - If the email already exists with a different user ID

## Current Error Handling Gaps

### 1. Webhook Handler
```typescript
// Current: Returns success even if upsert fails
await upsertUserWebhook({...})
return new Response("Webhook executed", { status: 200 })

// Should: Check result and return appropriate status
const result = await upsertUserWebhook({...})
if (!result) {
  return new Response("Failed to sync user", { status: 500 })
}
```

### 2. upsertUserWebhook Function
```typescript
// Current: Catches all errors and returns null
catch (error) {
  console.error("Error upserting user:", error);
  return null;
}

// Should: Provide detailed error information
catch (error) {
  console.error("Error upserting user:", error);
  throw error; // or return { success: false, error }
}
```

### 3. No Fallback User Creation

The application lacks a fallback mechanism to create users if the webhook fails. Options include:

- Creating users on first authenticated request
- Having a scheduled job to sync missing users
- Implementing a manual user sync endpoint

## Recommended Solutions

### High Priority (Immediate)

#### 1. Fix Webhook Error Handling

Modify webhook to properly handle and report failures:

```typescript
// src/app/api/webhooks/clerk/route.ts
case "user.created":
case "user.updated":
  const clerkData = event.data;
  const email = clerkData.email_addresses.find(
    (e) => e.id === clerkData.primary_email_address_id
  )?.email_address
  
  if (email == null) {
    return new Response("No email address found", { status: 400 })
  }
  
  const result = await upsertUserWebhook({
    id: clerkData.id,
    name: `${clerkData.first_name} ${clerkData.last_name}`,
    email,
    imageUrl: clerkData.image_url,
    createdAt: new Date(clerkData.created_at),
    updatedAt: new Date(clerkData.updated_at),
  })
  
  if (!result) {
    console.error(`Failed to sync user ${clerkData.id} to database`);
    return new Response("Failed to sync user to database", { status: 500 })
  }
  break;
```

#### 2. Improve upsertUserWebhook Error Reporting

```typescript
// src/lib/db/mutations/auth.ts
export const upsertUserWebhook = async (user: User) => {
  try {
    await db
      .insert(UserTable)
      .values(user)
      .onConflictDoUpdate({
        target: [UserTable.id],
        set: user,
      });
    
    console.log(`Successfully synced user ${user.id} to database`);
    return { success: true };
  } catch (error) {
    console.error("Error upserting user:", error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return { success: false, error };
  }
}
```

#### 3. Add Fallback User Creation

Implement a fallback that creates users on their first authenticated request:

```typescript
// src/lib/db/mutations/entries.ts
export const createEntryAction = action(CreateEntrySchema, async (data) => {
  const { userId, orgId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }
  
  try {
    // Check if user exists in database, create if missing
    await ensureUserExists(userId);
    
    await db.insert(EntryTable).values({
      id: crypto.randomUUID(),
      name: data.name,
      dateOfBirth: new Date(data.dateOfBirth),
      dateOfDeath: new Date(data.dateOfDeath),
      locationBorn: data.birthLocation,
      locationDied: data.deathLocation,
      image: data.image,
      causeOfDeath: data.causeOfDeath,
      userId,
      organizationId: orgId ?? null,
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create entry" };
  } finally {
    revalidatePath("/dashboard");
  }
});

// New helper function
async function ensureUserExists(userId: string) {
  const existingUser = await db.query.UserTable.findFirst({
    where: eq(UserTable.id, userId),
  });

  if (!existingUser) {
    console.log(`User ${userId} not found in database, creating from Clerk data...`);
    await upsertUser(userId);
  }
}
```

### Medium Priority (Important)

#### 4. Add Webhook Monitoring

Implement logging and monitoring for webhook events:

```typescript
// Add to webhook handler
console.log(`[Webhook] Received event: ${event.type} for user: ${clerkData?.id}`);
console.log(`[Webhook] User data:`, JSON.stringify({
  id: clerkData.id,
  email,
  name: `${clerkData.first_name} ${clerkData.last_name}`,
}));
```

#### 5. Create User Sync Verification Endpoint

Add an admin endpoint to verify and sync missing users:

```typescript
// src/app/api/admin/sync-users/route.ts
export async function POST(request: NextRequest) {
  // Verify admin access
  const { userId } = await auth();
  // Add admin check logic
  
  // Fetch all Clerk users
  // Compare with database users
  // Sync missing users
  // Return report
}
```

### Low Priority (Enhancement)

#### 6. Add Database Constraint Monitoring

Set up alerts for foreign key violations to catch these issues earlier.

#### 7. Implement User Creation Validation

Add validation to ensure user data meets all database constraints before insertion.

## Testing Plan

### 1. Verify Current State

1. Check if the affected user exists in `v1_user` table:
   ```sql
   SELECT * FROM v1_user WHERE id = 'user_34ZrCceEDDXfJJgrn3kYA9j1HPx';
   ```

2. Check webhook logs for any errors during user creation

3. Verify Clerk webhook configuration is pointing to the correct URL

### 2. Test Webhook Fixes

1. Update webhook handler with improved error handling
2. Create a new test user in Clerk
3. Monitor webhook logs for successful/failed sync
4. Verify user exists in database before allowing entry creation

### 3. Test Fallback Mechanism

1. Manually delete a user from `v1_user` (keep in Clerk)
2. Attempt to create an entry as that user
3. Verify fallback creates the user record
4. Verify entry creation succeeds

## Migration Strategy

If implementing the fallback approach:

1. **Immediate Fix (No Deployment Required)**
   - Manually insert missing users into `v1_user` table
   - Script to sync current Clerk users with database

2. **Short-term Fix (Quick Deployment)**
   - Deploy improved webhook error handling
   - Deploy fallback user creation

3. **Long-term Fix (Comprehensive)**
   - Implement webhook monitoring
   - Add admin sync tools
   - Set up database constraint alerts

## Open Questions

1. **Are there webhook logs available?** Need to check if webhooks are actually firing and what errors they're generating.

2. **How many users are affected?** Need to compare Clerk user count with database user count.

3. **When did this start?** Was there a recent schema migration or environment change?

4. **Is the webhook URL correctly configured in Clerk?** Need to verify webhook endpoint configuration.

5. **Are there any rate limiting or timeout issues?** Webhooks might be timing out before completing the database operation.

## Files to Review/Modify

- `src/app/api/webhooks/clerk/route.ts` - Fix error handling
- `src/lib/db/mutations/auth.ts` - Improve error reporting
- `src/lib/db/mutations/entries.ts` - Add fallback user creation
- Environment variables - Verify `DATABASE_PREFIX` and `DATABASE_URL`
- Clerk webhook configuration - Verify endpoint URL

## Conclusion

The root cause is the webhook's silent failure to create user records in the database. The webhook returns success to Clerk even when the database operation fails, creating a state where users can authenticate but don't exist in the application database.

The recommended solution is a two-pronged approach:
1. **Fix the webhook** to properly handle and report errors
2. **Add fallback user creation** to handle cases where the webhook fails

This ensures both that the issue is fixed at its source and that there's a safety net for edge cases.
