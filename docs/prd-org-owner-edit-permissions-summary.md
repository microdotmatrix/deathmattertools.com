# PRD Summary: Organization Owner Edit Permissions

**Version:** 1.0  
**Created:** October 28, 2025  
**Status:** Planning  
**Estimated Time:** 12-16 hours

---

## Overview

Enable Clerk organization owners/admins to edit entries created by their team members, while keeping regular team members restricted to editing only their own entries.

---

## Current State

✅ **Already Implemented:**
- Entry sharing with organization members
- Organization members can view team entries
- Organization members can comment on team entries
- Access control system with `canEdit` and `canView` flags

❌ **Missing:**
- Organization owners cannot edit team member entries
- Only entry creators can edit their own entries

---

## Proposed Solution

### 1. Role Detection (New)
Create helper to check if user is organization admin:

```typescript
// src/lib/auth/organization-roles.ts (NEW FILE)
export const isOrganizationOwner = async (orgId: string): Promise<boolean> => {
  const { userId } = await auth();
  const clerk = await clerkClient();
  const membership = await clerk.organizations.getOrganizationMembership({
    organizationId: orgId,
    userId,
  });
  return membership.role === "org:admin";
};
```

### 2. Update Access Control
Modify `getEntryWithAccess()` to grant edit rights to org admins:

```typescript
// src/lib/db/queries/entries.ts
if (sameOrganization) {
  const isOrgOwner = await isOrganizationOwner(entry.organizationId);
  
  if (isOrgOwner) {
    return {
      entry,
      role: "org_admin",  // NEW ROLE
      canEdit: true,      // ✅ Org admins can edit
      canView: true,
      isOrgOwner: true,
    };
  }
  
  // Regular members stay view-only
  return {
    entry,
    role: "org_member",
    canEdit: false,  // ❌ Members cannot edit
    canView: true,
  };
}
```

### 3. Update Mutations
Allow org admins to update entries:

```typescript
// src/lib/db/mutations/entries.ts
export const updateEntryAction = action(UpdateEntrySchema, async (data) => {
  const { userId, orgId } = await auth();
  
  const entry = await db.query.EntryTable.findFirst({
    where: eq(EntryTable.id, data.id),
  });
  
  // Check if user is owner
  const isOwner = entry.userId === userId;
  
  // Check if user is org admin
  let isOrgAdmin = false;
  if (entry.organizationId && orgId === entry.organizationId) {
    isOrgAdmin = await isOrganizationOwner(entry.organizationId);
  }
  
  // Allow update if owner OR org admin
  if (!isOwner && !isOrgAdmin) {
    return { error: "You do not have permission to edit this entry" };
  }
  
  // Perform update...
});
```

### 4. UI Indicators
Show admin warning when editing team entries:

```tsx
// src/components/sections/entries/entry-form.tsx
{isOrgOwner && (
  <Alert>
    <Icon icon="mdi:shield-account" />
    <AlertTitle>Editing as Organization Admin</AlertTitle>
    <AlertDescription>
      You are editing this entry with administrator permissions.
    </AlertDescription>
  </Alert>
)}
```

---

## Implementation Phases

### Phase 1: Role Detection (2-3 hours)
- Create `src/lib/auth/organization-roles.ts`
- Implement `isOrganizationOwner()` helper
- Test with Clerk API

### Phase 2: Access Control (2-3 hours)
- Update `EntryAccessRole` type to include `"org_admin"`
- Modify `getEntryWithAccess()` to check org admin status
- Update interface with `isOrgOwner` field

### Phase 3: Mutations (3-4 hours)
- Update `updateEntryAction`
- Update `updateEntryDetailsAction`
- Update `deleteEntryAction`
- Add proper permission checks

### Phase 4: UI Updates (3-4 hours)
- Add admin warning alert to entry form
- Add admin badge to dashboard
- Update all entry pages with `isOrgOwner` prop

### Phase 5: Testing (2-3 hours)
- Unit tests for role helpers
- Integration tests for permissions
- Manual end-to-end testing

---

## Key Files to Modify

### New Files
- `src/lib/auth/organization-roles.ts`

### Modified Files
- `src/lib/db/queries/entries.ts`
- `src/lib/db/mutations/entries.ts`
- `src/app/[entryId]/page.tsx`
- `src/components/sections/entries/entry-form.tsx`
- `src/components/sections/entries/details-card.tsx`
- `src/app/dashboard/page.tsx`

---

## Security Considerations

### Multi-Layer Protection
1. **Query Layer:** Access control checks org membership
2. **Mutation Layer:** Verifies org admin role before updates
3. **UI Layer:** Hides edit controls from non-admins
4. **Route Layer:** Validates access on page load

### Clerk Integration
- Use Clerk's native `getOrganizationMembership()` API
- Trust Clerk's role validation
- Handle API errors gracefully (deny access on error)

---

## Success Criteria

### Functional
- ✅ Org admins can edit team member entries
- ✅ Regular members cannot edit other members' entries
- ✅ Entry creators can still edit their own entries
- ✅ Proper error messages on permission denied

### UI/UX
- ✅ Admin warning visible when editing team entry
- ✅ Admin badges indicate elevated permissions
- ✅ Clear distinction between owner and admin edits

### Security
- ✅ No permission escalation vulnerabilities
- ✅ Proper Clerk role enforcement
- ✅ No data leakage between organizations

---

## Testing Checklist

### As Organization Admin
- [ ] View team member entries
- [ ] Edit team member entry
- [ ] See admin warning on edit form
- [ ] Successfully save changes
- [ ] Delete team member entry

### As Regular Member
- [ ] View other member entries
- [ ] Verify no edit button visible
- [ ] Cannot access edit route directly
- [ ] Can edit own entries normally

### Edge Cases
- [ ] Entry without organization (creator-only)
- [ ] User leaves organization (access revoked)
- [ ] User promoted to admin (edit access granted)

---

## Open Questions

1. **Q:** Should we track who made edits (audit trail)?
   **A:** Phase 2 feature - admin edit warnings sufficient for MVP

2. **Q:** Should this apply to documents/obituaries too?
   **A:** Entries only for MVP, evaluate documents later

3. **Q:** Should admins be able to transfer ownership?
   **A:** No, not in scope - admin can edit content which is sufficient

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Permission escalation bug | Multi-layer access checks, thorough testing |
| Performance degradation | Cache role checks, efficient Clerk API usage |
| User confusion | Clear UI indicators, documentation |
| Clerk API limits | Handle errors, cache where appropriate |

---

**Full PRD:** See `prd-org-owner-edit-permissions.md` (detailed version)  
**Next Steps:** Review and approve before implementation
