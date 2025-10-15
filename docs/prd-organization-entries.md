# PRD: Organization-Wide Entry & Obituary Access

**Version:** 1.0  
**Created:** 2025-01-15  
**Status:** Planning

## Executive Summary

Enable Clerk organization members to view and comment on entries and obituaries created by other members of the same organization, while maintaining edit permissions exclusively for the original creator.

## Problem Statement

### Current State
- Entries are owned exclusively by the user who created them (`userId` check)
- Entry routes (`/[entryId]/*`) are only accessible to the creator
- Obituaries nested under entries inherit this restriction
- Organization members cannot collaborate even though commenting infrastructure exists

### Impact
- Reduced collaboration within organizations
- Underutilized organization commenting features
- Poor user experience for team-based workflows

## Objectives

### Primary Goals
1. Make entries visible to all members of the creator's organization
2. Make obituaries within those entries accessible for viewing and commenting
3. Maintain edit permissions exclusively for entry/obituary creators
4. Ensure data isolation between different organizations

### Success Metrics
- Organization members can view entries created by other org members
- Organization members can view and comment on obituaries (when enabled)
- Only creators can edit their entries/obituaries
- Zero data leakage between organizations

## Technical Architecture

### Database Schema Changes

#### 1. Add `organizationId` to EntryTable

**File:** `src/lib/db/schema/entries.ts`

```typescript
export const EntryTable = pgTable("entry", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  organizationId: text("organization_id"), // NEW FIELD
  name: text("name").notNull(),
  // ... rest of fields
});
```

**Migration Required:** Yes - Add nullable `organization_id` column

#### 2. Update Entry Relations

Add organization context to entry relations for easier querying.

### Query Layer Changes

#### 1. Update `getCreatorEntries` → `getOrganizationEntries`

**File:** `src/lib/db/queries/entries.ts`

**Current:**
```typescript
export const getCreatorEntries = cache(async () => {
  const { userId } = await auth();
  if (!userId) return [];
  
  return await db.query.EntryTable.findMany({
    where: eq(EntryTable.userId, userId),
    // ...
  });
});
```

**New:**
```typescript
export const getOrganizationEntries = cache(async () => {
  const { userId, orgId } = await auth();
  if (!userId) return [];
  
  // Show entries where user is owner OR user's org matches entry's org
  return await db.query.EntryTable.findMany({
    where: orgId 
      ? or(
          eq(EntryTable.userId, userId),
          eq(EntryTable.organizationId, orgId)
        )
      : eq(EntryTable.userId, userId),
    orderBy: desc(EntryTable.createdAt),
  });
});
```

#### 2. Create `getEntryWithAccess` Helper

**File:** `src/lib/db/queries/entries.ts`

```typescript
export type EntryAccessRole = "owner" | "org_member" | "none";

export interface EntryAccessResult {
  entry: Entry;
  role: EntryAccessRole;
  canEdit: boolean;
  canView: boolean;
}

export const getEntryWithAccess = cache(async (entryId: string) => {
  const { userId, orgId } = await auth();
  
  if (!userId) return null;
  
  const entry = await db.query.EntryTable.findFirst({
    where: eq(EntryTable.id, entryId),
  });
  
  if (!entry) return null;
  
  // Owner has full access
  if (entry.userId === userId) {
    return {
      entry,
      role: "owner" as const,
      canEdit: true,
      canView: true,
    };
  }
  
  // Organization member has view-only access
  const sameOrganization = 
    entry.organizationId && orgId && entry.organizationId === orgId;
  
  if (sameOrganization) {
    return {
      entry,
      role: "org_member" as const,
      canEdit: false,
      canView: true,
    };
  }
  
  return null;
});
```

### Mutation Layer Changes

#### 1. Update Entry Creation

**File:** `src/lib/db/mutations/entries.ts`

```typescript
export const createEntryAction = action(CreateEntrySchema, async (data) => {
  const { userId, orgId } = await auth(); // Get orgId
  
  if (!userId) return { error: "Unauthorized" };
  
  try {
    await db.insert(EntryTable).values({
      id: crypto.randomUUID(),
      userId,
      organizationId: orgId ?? null, // NEW: Set org context
      // ... rest of fields
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

#### 2. Update Entry Edit Actions

All update/delete actions must verify ownership (not just org membership):

```typescript
export const updateEntryAction = action(UpdateEntrySchema, async (data) => {
  const { userId } = await auth();
  
  if (!userId) return { error: "Unauthorized" };
  
  try {
    // IMPORTANT: Only allow userId match (owner only)
    await db.update(EntryTable)
      .set({ /* fields */ })
      .where(and(
        eq(EntryTable.id, data.id),
        eq(EntryTable.userId, userId) // Owner check
      ));
    
    return { success: true };
  } catch (error) {
    return { error: "Failed to update entry" };
  }
});
```

### Route/Page Changes

#### 1. Update Entry Page Access Control

**File:** `src/app/[entryId]/page.tsx`

**Current:**
```typescript
const entry = await getEntryById(entryId);
if (!entry) notFound();
```

**New:**
```typescript
const access = await getEntryWithAccess(entryId);

if (!access || !access.canView) {
  notFound();
}

const { entry, role, canEdit } = access;

// Pass canEdit to components to conditionally show edit UI
```

#### 2. Update Dashboard

**File:** `src/app/dashboard/page.tsx`

Replace `getCreatorEntries()` with `getOrganizationEntries()` and add role badges:

```typescript
const entries = await getOrganizationEntries();

// In UI, show badge for org entries
{entry.userId !== currentUserId && (
  <Badge variant="secondary">Org Member Entry</Badge>
)}
```

#### 3. Obituary Pages Already Support Org Access

**File:** `src/app/[entryId]/obituaries/[id]/view/page.tsx`

✅ Already checks organization via `getDocumentWithAccess`
✅ Already has role-based permissions (owner/commenter/viewer)

**Enhancement needed:** Entry-level access check before document check:

```typescript
const access = await getEntryWithAccess(entryId);
if (!access || !access.canView) {
  notFound();
}

// Then proceed with existing document access check
```

### UI/UX Changes

#### 1. Entry Cards - Role Indicators

Show visual indicators for entry ownership:

```tsx
<Card>
  <div className="flex items-center justify-between">
    <h3>{entry.name}</h3>
    {role === "org_member" && (
      <Badge variant="outline">
        <Icon icon="mdi:account-group" className="mr-1" />
        Team Entry
      </Badge>
    )}
  </div>
</Card>
```

#### 2. Edit Buttons - Conditional Rendering

Only show edit/delete buttons for owners:

```tsx
{canEdit && (
  <>
    <Button>Edit Entry</Button>
    <Button>Delete Entry</Button>
  </>
)}

{!canEdit && role === "org_member" && (
  <p className="text-sm text-muted-foreground">
    View-only (created by team member)
  </p>
)}
```

#### 3. Dashboard Sections

Separate "My Entries" from "Team Entries":

```tsx
<Tabs defaultValue="my-entries">
  <TabsList>
    <TabsTrigger value="my-entries">My Entries ({myCount})</TabsTrigger>
    <TabsTrigger value="team-entries">Team Entries ({teamCount})</TabsTrigger>
  </TabsList>
</Tabs>
```

## Implementation Plan

### Phase 1: Database Migration (Priority: HIGH)
**Estimated: 1-2 hours**

- [ ] Create migration to add `organization_id` to `entry` table
- [ ] Run migration on development database
- [ ] Backfill existing entries with orgId from current user context
- [ ] Test migration rollback procedure

**Files:**
- New: `drizzle/migrations/XXXX_add_entry_organization.sql`
- Update: `src/lib/db/schema/entries.ts`

### Phase 2: Query Layer Updates (Priority: HIGH)
**Estimated: 2-3 hours**

- [ ] Create `getEntryWithAccess` helper
- [ ] Update `getCreatorEntries` → `getOrganizationEntries`
- [ ] Update `getEntryById` → use access helper
- [ ] Add unit tests for access control logic

**Files:**
- Update: `src/lib/db/queries/entries.ts`
- New: `src/lib/db/queries/__tests__/entries.test.ts`

### Phase 3: Mutation Layer Updates (Priority: HIGH)
**Estimated: 1-2 hours**

- [ ] Update `createEntryAction` to include orgId
- [ ] Verify all update actions enforce owner-only editing
- [ ] Verify delete action enforces owner-only deletion
- [ ] Add tests for authorization checks

**Files:**
- Update: `src/lib/db/mutations/entries.ts`
- New: `src/lib/db/mutations/__tests__/entries.test.ts`

### Phase 4: Route Protection Updates (Priority: HIGH)
**Estimated: 3-4 hours**

- [ ] Update `src/app/[entryId]/page.tsx` with access checks
- [ ] Update all nested obituary routes with entry access checks
- [ ] Update dashboard to use `getOrganizationEntries`
- [ ] Add proper 404/403 handling

**Files:**
- Update: `src/app/[entryId]/page.tsx`
- Update: `src/app/[entryId]/obituaries/[id]/page.tsx`
- Update: `src/app/[entryId]/obituaries/[id]/view/page.tsx`
- Update: `src/app/[entryId]/obituaries/create/page.tsx`
- Update: `src/app/dashboard/page.tsx`

### Phase 5: UI/UX Updates (Priority: MEDIUM)
**Estimated: 2-3 hours**

- [ ] Add role badges to entry cards
- [ ] Conditional rendering of edit/delete buttons
- [ ] Add "Team Entries" section to dashboard
- [ ] Update loading states and skeletons
- [ ] Add tooltips explaining view-only access

**Files:**
- Update: `src/components/sections/entries/entry-card.tsx` (if exists)
- Update: `src/app/dashboard/page.tsx`
- Update: `src/app/[entryId]/page.tsx`

### Phase 6: Testing & Documentation (Priority: MEDIUM)
**Estimated: 2-3 hours**

- [ ] Manual testing: Create entry in org, verify other members see it
- [ ] Manual testing: Verify non-org members cannot access
- [ ] Manual testing: Verify only owner can edit/delete
- [ ] Manual testing: Verify commenting works for org members
- [ ] Update API documentation
- [ ] Update user-facing documentation

**Files:**
- New: `docs/features/organization-collaboration.md`
- Update: `README.md`

## Security Considerations

### Access Control Enforcement

1. **Defense in Depth**: Access checks at multiple layers
   - Database queries filter by org
   - Route handlers verify access
   - UI conditionally renders actions

2. **Owner-Only Mutations**: All edit/delete operations MUST check `userId` match
   ```typescript
   // ✅ CORRECT
   where: and(eq(EntryTable.id, id), eq(EntryTable.userId, userId))
   
   // ❌ WRONG - allows org members to edit
   where: eq(EntryTable.id, id)
   ```

3. **Organization Validation**: Use Clerk's orgId directly (no manual parsing)
   ```typescript
   const { userId, orgId } = await auth(); // Clerk validates this
   ```

### Data Isolation

1. **Organization Boundaries**: Entries only visible within same org
2. **NULL Organization**: Entries without orgId remain private to creator
3. **Cross-Organization**: No access even if user is in multiple orgs

## Edge Cases

### 1. User Leaves Organization
**Scenario:** User creates entry in Org A, then leaves Org A

**Current Behavior:** Entry's `organizationId` remains set to Org A

**Resolution:** Entry becomes inaccessible to user (they're no longer in Org A)

**Future Enhancement:** Provide admin tool to transfer entry ownership or remove org association

### 2. Entry Created Before Migration
**Scenario:** Existing entries have `organizationId = NULL`

**Behavior:** These entries remain private to original creator

**Migration Strategy:** Optional backfill script to set orgId based on user's current org

### 3. User Not in Any Organization
**Scenario:** User creates entry without being in an organization

**Behavior:** Entry is private (organizationId = NULL), only visible to creator

**Enhancement:** Prompt user to create/join org for collaboration

### 4. User Switches Organizations
**Scenario:** User in Org A viewing entries, switches to Org B

**Behavior:** Dashboard shows different entries (Org B entries + user's own entries)

**UI:** Clear indication of active organization context

## Rollback Plan

If critical issues arise:

1. **Database Rollback:** Migration includes DOWN script to remove `organization_id` column
2. **Code Rollback:** Git revert to previous commit
3. **Data Integrity:** Existing entries unaffected (new column is nullable)

## Open Questions

1. **Q:** Should we show entry creator's name on org member entries?
   **A:** Yes, display "Created by [Name]" badge for transparency

2. **Q:** Should org admins have edit permissions on all org entries?
   **A:** Phase 2 feature - keep simple for initial launch

3. **Q:** How to handle entry created in org, then user leaves org?
   **A:** Entry stays with org, former member loses access (document in help)

4. **Q:** Should we backfill organizationId for existing entries?
   **A:** Optional migration script, run after testing in dev

## Success Criteria

- [ ] Organization members can view entries created by other org members
- [ ] Organization members can view obituaries within org entries
- [ ] Organization members can comment on obituaries (when enabled)
- [ ] Only entry creators can edit/delete their entries
- [ ] Only obituary creators can edit their obituaries
- [ ] Dashboard clearly distinguishes owned vs. org entries
- [ ] No data leakage between organizations
- [ ] Performance: No queries slower than 200ms (with indexes)

## Dependencies

### Technical
- **Clerk Organizations:** Already configured ✅
- **Drizzle ORM:** Already configured ✅
- **Database:** PostgreSQL with support for nullable columns ✅

### External
- None

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data leakage between orgs | Critical | Low | Multi-layer access checks, comprehensive testing |
| Performance degradation | Medium | Low | Add database indexes on `organization_id` |
| User confusion about permissions | Medium | Medium | Clear UI indicators, help documentation |
| Migration failure | High | Low | Test migration in dev, have rollback ready |

## Appendix

### Relevant Files

**Schema:**
- `src/lib/db/schema/entries.ts`
- `src/lib/db/schema/documents.ts` (already org-aware)

**Queries:**
- `src/lib/db/queries/entries.ts`
- `src/lib/db/queries/documents.ts` (reference for org pattern)

**Mutations:**
- `src/lib/db/mutations/entries.ts`
- `src/lib/db/mutations/documents.ts` (reference for org pattern)

**Routes:**
- `src/app/[entryId]/page.tsx`
- `src/app/[entryId]/obituaries/[id]/view/page.tsx`
- `src/app/dashboard/page.tsx`

**Actions:**
- `src/actions/comments.ts` (reference for org-aware actions)
- `src/actions/commenting-settings.ts` (reference for org settings)

### Database Schema Reference

**EntryTable (Current):**
```sql
CREATE TABLE entry (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  -- Missing: organization_id
  name TEXT NOT NULL,
  date_of_birth TIMESTAMP,
  date_of_death TIMESTAMP,
  -- ...
);
```

**EntryTable (After Migration):**
```sql
CREATE TABLE entry (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  organization_id TEXT, -- NEW
  name TEXT NOT NULL,
  date_of_birth TIMESTAMP,
  date_of_death TIMESTAMP,
  -- ...
);

CREATE INDEX idx_entry_organization_id ON entry(organization_id);
```

### Clerk Best Practices Applied

Based on Clerk documentation research:

1. **Use `auth()` helper in Server Components/Actions** ✅
   ```typescript
   const { userId, orgId } = await auth();
   ```

2. **Check both userId (owner) and orgId (org member)** ✅
   ```typescript
   where: or(
     eq(EntryTable.userId, userId),
     and(
       eq(EntryTable.organizationId, orgId),
       isNotNull(EntryTable.organizationId)
     )
   )
   ```

3. **Use `auth().protect()` for role-based access (future)** 🔄
   ```typescript
   await auth().protect({ role: 'org:admin' });
   ```

4. **Middleware for route protection (already implemented)** ✅
   - `clerkMiddleware()` in `middleware.ts`

---

**Document Status:** Ready for Review & Implementation  
**Next Steps:** Review with team, prioritize phases, begin Phase 1
