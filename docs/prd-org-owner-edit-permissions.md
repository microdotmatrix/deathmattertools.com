# PRD: Organization Owner Edit Permissions for Team Entries

**Version:** 1.0  
**Created:** October 28, 2025  
**Status:** Planning  
**Priority:** Medium  

---

## Executive Summary

Enable Clerk organization owners/admins to edit entries created by their team members, while keeping regular team members restricted to editing only their own entries. This enhances team collaboration by allowing organization leaders to maintain quality control and make corrections when needed.

---

## Problem Statement

### Current State
- ✅ Entries can be shared with organization members (already implemented)
- ✅ Organization members can view and comment on team entries
- ❌ Only the entry creator can edit their entry
- ❌ Organization owners have no administrative control over team content
- ❌ Corrections/updates require contacting the original creator

### User Pain Points
1. **Organization owners** cannot fix typos or update outdated information in team entries
2. **Quality control** is difficult when owners can't maintain consistency across entries
3. **Workflow bottlenecks** when original creator is unavailable
4. **Collaboration friction** when entries need updates but creator has left organization

### Impact
- Reduced administrative efficiency
- Content quality concerns for organization-wide profiles
- Poor user experience for organization administrators

---

## Objectives

### Primary Goals
1. Allow organization owners/admins to edit ANY entry within their organization
2. Maintain restriction for regular team members (can only edit own entries)
3. Preserve audit trail showing who made edits
4. Provide clear UI indicators showing admin capabilities

### Success Metrics
- Organization owners can successfully edit team member entries
- Regular members still cannot edit other members' entries
- UI clearly communicates admin vs. member permissions
- Edit history tracks both original creator and editor
- Zero unauthorized edits by non-admin team members

---

## User Stories

### As an Organization Owner
1. I want to edit entries created by my team members so I can fix errors or update information
2. I want to see which entries I have admin access to so I know where I can make changes
3. I want a clear indication that I'm editing someone else's entry so I'm aware of the responsibility
4. I want to maintain quality standards across all organization entries

### As a Team Member (Regular)
1. I want to edit my own entries without restriction
2. I do not want to accidentally edit someone else's entry
3. I want to see view-only UI on entries I cannot edit
4. I want to know if an admin edited my entry

### As an Entry Creator
1. I want to know if someone else (admin) has edited my entry
2. I want my name to remain as the original creator
3. I want a history of who made changes (future enhancement)

---

## Technical Architecture

### 1. Role Detection System

#### Create Organization Role Helper

**File:** `src/lib/auth/organization-roles.ts` (NEW)

```typescript
import { auth, clerkClient } from "@clerk/nextjs/server";
import { cache } from "react";

/**
 * Check if the current user is an owner/admin of the specified organization
 */
export const isOrganizationOwner = cache(
  async (organizationId: string): Promise<boolean> => {
    const { userId } = await auth();
    
    if (!userId) return false;
    
    try {
      const clerk = await clerkClient();
      const membership = await clerk.organizations.getOrganizationMembership({
        organizationId,
        userId,
      });
      
      // Clerk roles: 'org:admin' or 'org:member'
      // Admin role grants full permissions
      return membership.role === "org:admin";
    } catch (error) {
      console.error("Error checking organization role:", error);
      return false;
    }
  }
);

/**
 * Get user's role in the specified organization
 */
export const getUserOrganizationRole = cache(
  async (organizationId: string): Promise<"admin" | "member" | null> => {
    const { userId } = await auth();
    
    if (!userId) return null;
    
    try {
      const clerk = await clerkClient();
      const membership = await clerk.organizations.getOrganizationMembership({
        organizationId,
        userId,
      });
      
      return membership.role === "org:admin" ? "admin" : "member";
    } catch (error) {
      console.error("Error fetching organization role:", error);
      return null;
    }
  }
);
```

---

### 2. Update Access Control Logic

#### Enhanced Entry Access Result

**File:** `src/lib/db/queries/entries.ts`

**Update the type:**
```typescript
export type EntryAccessRole = "owner" | "org_admin" | "org_member";

export interface EntryAccessResult {
  entry: Entry;
  role: EntryAccessRole;
  canEdit: boolean;
  canView: boolean;
  isOrgOwner: boolean; // NEW: Indicates if user is org owner/admin
}
```

**Update the function:**
```typescript
import { isOrganizationOwner } from "@/lib/auth/organization-roles";

export const getEntryWithAccess = cache(
  async (entryId: string): Promise<EntryAccessResult | null> => {
    const { userId, orgId } = await auth();

    if (!userId) {
      return null;
    }

    const entry = await db.query.EntryTable.findFirst({
      where: eq(EntryTable.id, entryId),
    });

    if (!entry) {
      return null;
    }

    // Owner has full access
    if (entry.userId === userId) {
      return {
        entry,
        role: "owner",
        canEdit: true,
        canView: true,
        isOrgOwner: false, // Owner but not via org admin rights
      };
    }

    // Check if user is in the same organization
    const sameOrganization =
      entry.organizationId && orgId && entry.organizationId === orgId;

    if (sameOrganization) {
      // Check if user is organization owner/admin
      const isOrgOwner = await isOrganizationOwner(entry.organizationId);

      if (isOrgOwner) {
        return {
          entry,
          role: "org_admin",
          canEdit: true, // NEW: Org admins can edit
          canView: true,
          isOrgOwner: true,
        };
      }

      // Regular organization member - view only
      return {
        entry,
        role: "org_member",
        canEdit: false,
        canView: true,
        isOrgOwner: false,
      };
    }

    // No access
    return null;
  }
);
```

---

### 3. Update Mutation Layer

#### Update Entry Mutation with Org Admin Support

**File:** `src/lib/db/mutations/entries.ts`

```typescript
import { isOrganizationOwner } from "@/lib/auth/organization-roles";

export const updateEntryAction = action(UpdateEntrySchema, async (data) => {
  const { userId, orgId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    // First, get the entry to check ownership and org
    const entry = await db.query.EntryTable.findFirst({
      where: eq(EntryTable.id, data.id),
    });

    if (!entry) {
      return { error: "Entry not found" };
    }

    // Check if user is the owner
    const isOwner = entry.userId === userId;

    // Check if user is organization admin
    let isOrgAdmin = false;
    if (entry.organizationId && orgId === entry.organizationId) {
      isOrgAdmin = await isOrganizationOwner(entry.organizationId);
    }

    // Allow update if user is owner OR org admin
    if (!isOwner && !isOrgAdmin) {
      return { error: "You do not have permission to edit this entry" };
    }

    // Perform the update
    await db
      .update(EntryTable)
      .set({
        name: data.name,
        dateOfBirth: new Date(data.dateOfBirth),
        dateOfDeath: new Date(data.dateOfDeath),
        locationBorn: data.birthLocation,
        locationDied: data.deathLocation,
        image: data.image,
        causeOfDeath: data.causeOfDeath,
        updatedAt: new Date(),
      })
      .where(eq(EntryTable.id, data.id));

    return { success: true };
  } catch (error) {
    console.error("Error updating entry:", error);
    return { error: "Failed to update entry" };
  } finally {
    revalidatePath(`/dashboard`);
    revalidatePath(`/${data.id}`);
  }
});
```

#### Update Entry Details Mutation

```typescript
export const updateEntryDetailsAction = action(
  UpdateEntryDetailsSchema,
  async (data) => {
    const { userId, orgId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    try {
      // Get the entry to check ownership
      const entry = await db.query.EntryTable.findFirst({
        where: eq(EntryTable.id, data.id),
      });

      if (!entry) {
        return { error: "Entry not found" };
      }

      // Check if user is the owner
      const isOwner = entry.userId === userId;

      // Check if user is organization admin
      let isOrgAdmin = false;
      if (entry.organizationId && orgId === entry.organizationId) {
        isOrgAdmin = await isOrganizationOwner(entry.organizationId);
      }

      // Allow update if user is owner OR org admin
      if (!isOwner && !isOrgAdmin) {
        return { error: "You do not have permission to edit this entry" };
      }

      // Perform the update
      await db
        .update(EntryDetailsTable)
        .set({
          // ... all fields
          updatedAt: new Date(),
        })
        .where(eq(EntryDetailsTable.entryId, data.id));

      return { success: true };
    } catch (error) {
      console.error("Error updating entry details:", error);
      return { error: "Failed to update entry details" };
    } finally {
      revalidatePath(`/${data.id}`);
    }
  }
);
```

#### Update Delete Entry Action

```typescript
export const deleteEntryAction = async (id: string) => {
  const { userId, orgId } = await auth();

  if (!userId) {
    return { error: true, message: "Unauthorized" };
  }

  try {
    // Get the entry to check ownership
    const entry = await db.query.EntryTable.findFirst({
      where: eq(EntryTable.id, id),
    });

    if (!entry) {
      return { error: true, message: "Entry not found" };
    }

    // Check if user is the owner
    const isOwner = entry.userId === userId;

    // Check if user is organization admin
    let isOrgAdmin = false;
    if (entry.organizationId && orgId === entry.organizationId) {
      isOrgAdmin = await isOrganizationOwner(entry.organizationId);
    }

    // Allow deletion if user is owner OR org admin
    if (!isOwner && !isOrgAdmin) {
      return { error: true, message: "You do not have permission to delete this entry" };
    }

    // Perform the delete
    await db
      .delete(EntryTable)
      .where(eq(EntryTable.id, id));

    return { error: false };
  } catch (error) {
    console.error("Error deleting entry:", error);
    return { error: true, message: "Failed to delete entry" };
  } finally {
    revalidatePath("/dashboard");
  }
};
```

---

### 4. UI Updates

#### Entry Page - Pass Admin Flag

**File:** `src/app/[entryId]/page.tsx`

```typescript
const access = await getEntryWithAccess(entryId);

if (!access || !access.canView) {
  notFound();
}

const { entry, canEdit, role, isOrgOwner } = access;

// Pass isOrgOwner to components
<EntryForm entry={entry} isOrgOwner={isOrgOwner} />
<EntryDetailsCard 
  entry={entry} 
  entryDetails={entryDetails} 
  canEdit={canEdit}
  isOrgOwner={isOrgOwner}
/>
```

#### Entry Form - Admin Warning

**File:** `src/components/sections/entries/entry-form.tsx`

```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export const EntryForm = ({ 
  entry, 
  isOrgOwner = false 
}: { 
  entry: any; 
  isOrgOwner?: boolean;
}) => {
  // ... existing form logic

  return (
    <form action={formAction} className="space-y-4">
      {/* Admin editing indicator */}
      {isOrgOwner && (
        <Alert>
          <Icon icon="mdi:shield-account" className="h-4 w-4" />
          <AlertTitle>Editing as Organization Admin</AlertTitle>
          <AlertDescription>
            You are editing this entry with administrator permissions. 
            This entry was created by another team member.
          </AlertDescription>
        </Alert>
      )}

      {/* Rest of form fields */}
      <input type="hidden" name="id" value={entry.id} />
      {/* ... existing fields ... */}
    </form>
  );
};
```

#### Dashboard - Admin Badge

**File:** `src/app/dashboard/page.tsx`

```tsx
// In entry card rendering
{entry.userId !== userId && canEdit && (
  <Badge variant="default" className="gap-1">
    <Icon icon="mdi:shield-account" className="w-3 h-3" />
    Admin Access
  </Badge>
)}
```

---

## Implementation Plan

### Phase 1: Role Detection (2-3 hours)
**Priority: HIGH**

- [ ] Create `src/lib/auth/organization-roles.ts`
- [ ] Implement `isOrganizationOwner()` function
- [ ] Implement `getUserOrganizationRole()` function
- [ ] Add error handling and logging
- [ ] Test with Clerk organization API

**Testing:**
- [ ] Verify admin role detected correctly
- [ ] Verify member role detected correctly
- [ ] Verify null returned for non-members
- [ ] Test error handling for invalid org IDs

---

### Phase 2: Access Control (2-3 hours)
**Priority: HIGH**

- [ ] Update `EntryAccessRole` type
- [ ] Update `EntryAccessResult` interface
- [ ] Modify `getEntryWithAccess()` function
- [ ] Add unit tests for new access logic

**Testing:**
- [ ] Owner can still edit (unchanged)
- [ ] Org admin can edit team member entries
- [ ] Regular member cannot edit team entries
- [ ] Non-org users cannot access entries

---

### Phase 3: Mutations (3-4 hours)
**Priority: HIGH**

- [ ] Update `updateEntryAction`
- [ ] Update `updateEntryDetailsAction`
- [ ] Update `deleteEntryAction`
- [ ] Add comprehensive error messages

**Testing:**
- [ ] Org admin can update entry
- [ ] Org admin can update entry details
- [ ] Org admin can delete entry
- [ ] Regular member gets proper error
- [ ] Validation works correctly

---

### Phase 4: UI Updates (3-4 hours)
**Priority: MEDIUM**

- [ ] Add admin warning to entry form
- [ ] Add admin badge to dashboard
- [ ] Update entry detail page
- [ ] Update details card component
- [ ] Ensure consistent styling

**Testing:**
- [ ] Admin warning shows correctly
- [ ] Admin badge visible on cards
- [ ] Indicators are clear and distinct
- [ ] UI is responsive

---

### Phase 5: Integration Testing (2-3 hours)
**Priority: HIGH**

- [ ] Test org owner edit flow
- [ ] Test regular member restrictions
- [ ] Test with multiple organizations
- [ ] Test role changes
- [ ] Test edge cases

---

### Phase 6: Documentation (1-2 hours)
**Priority: MEDIUM**

- [ ] Update user guide
- [ ] Document Clerk role requirements
- [ ] Add troubleshooting guide
- [ ] Update API documentation

---

## Security Considerations

### Multi-Layer Protection
1. **Query Layer:** Checks organization membership
2. **Mutation Layer:** Verifies org admin role
3. **UI Layer:** Hides edit controls from non-admins
4. **Route Layer:** Validates access on page load

### Clerk Integration
- Use native `getOrganizationMembership()` API
- Trust Clerk's role validation
- Handle API errors gracefully (deny access on error)

### Role Hierarchy
```
org:admin → Can edit all organization entries
org:member → Can only edit own entries
no membership → No access to organization entries
```

---

## Edge Cases

### 1. User Role Change During Session
**Handling:**
- Mutation will fail with permission error
- Next page load shows correct permissions
- Form submission errors handled gracefully

### 2. Multiple Organization Admins
**Handling:**
- Last write wins (standard behavior)
- No lock mechanism needed
- OptimisticUI handles conflicts

### 3. Entry Without Organization
**Handling:**
- `organizationId` is NULL
- Only creator can edit
- Org admins have NO access

### 4. User Leaves Organization
**Handling:**
- User loses admin rights immediately
- Entries remain in organization
- Ex-admin loses edit access

---

## Success Criteria

### Functional
- [ ] Org admins can edit team member entries
- [ ] Org admins can update entry details
- [ ] Org admins can delete team entries
- [ ] Regular members cannot edit other entries
- [ ] Entry creators can still edit own entries

### Security
- [ ] Clerk organization roles correctly enforced
- [ ] No permission escalation vulnerabilities
- [ ] Proper error handling on permission denied
- [ ] No data leakage between organizations

### UX
- [ ] Admin warning clearly visible
- [ ] Admin badges indicate permissions
- [ ] Edit buttons show/hide correctly
- [ ] Error messages are clear

### Performance
- [ ] Role check adds < 100ms to page load
- [ ] Mutation checks add < 50ms to updates
- [ ] No N+1 query issues

---

## Dependencies

### Technical
- ✅ Clerk Organizations (configured)
- ✅ Organization collaboration feature (implemented)
- ✅ Drizzle ORM (configured)
- ✅ Entry access control system (implemented)

### External
- ✅ Clerk SDK `@clerk/nextjs` ^6.34.0
- ✅ Clerk API access

### Prerequisites
- Organization feature enabled in Clerk dashboard
- Users must be assigned roles (admin vs member)

---

## Open Questions

### Q1: Should we track who made edits?
**Decision:** Phase 2 feature - not essential for MVP

**Rationale:**
- Adds complexity with database changes
- Can be added later as audit feature
- Admin edit warnings sufficient for MVP

### Q2: Should admins see "edited by admin" indicator?
**Decision:** Yes, show during edit only (warning alert)

**Rationale:**
- Prevents accidental edits
- Transparent about admin privileges
- Doesn't clutter view mode

### Q3: Should admins transfer entry ownership?
**Decision:** No, not in scope

**Rationale:**
- Ownership transfer is separate feature
- Entry creator should remain original creator
- Admin can edit content (sufficient)

### Q4: Should this apply to documents/obituaries?
**Decision:** Entries only for MVP

**Rationale:**
- Documents have existing role-based access
- Keep scope focused
- Can extend later if needed

---

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Permission escalation bug | Critical | Low | Multi-layer checks, thorough testing |
| Performance degradation | Medium | Low | Cache role checks, efficient API usage |
| User confusion about roles | Medium | Medium | Clear UI indicators, documentation |
| Clerk API rate limits | Medium | Low | Cache results, handle errors |
| Conflicting edits | Low | Low | Last-write-wins acceptable |

---

## Future Enhancements

### Phase 2
1. **Audit Trail:** Track edit history with timestamps
2. **Granular Permissions:** Custom roles and field restrictions
3. **Notifications:** Notify creator when admin edits
4. **Document Admin Access:** Extend to documents/obituaries

---

## Summary

This feature enables organization owners to maintain quality control over team entries while preserving the current permission model for regular members. Implementation is straightforward, leveraging existing Clerk organization infrastructure and access control patterns.

**Total Estimated Time:** 12-16 hours  
**Risk Level:** Low  
**Value:** High for organizations

---

**Document Status:** Ready for Review  
**Next Steps:** Review with stakeholders, prioritize phases, begin implementation
