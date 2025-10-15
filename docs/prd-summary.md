# Organization-Wide Collaboration: Quick Reference

## Current vs. Proposed Architecture

### Current State ❌
```
Entry
├── userId (owner only)
├── Obituaries (nested, inherit entry access)
│   ├── organizationId ✅ (already exists but unused due to entry restriction)
│   └── organizationCommentingEnabled ✅
└── Access: Creator only
```

### Proposed State ✅
```
Entry
├── userId (owner)
├── organizationId (NEW - enables org access)
├── Obituaries (nested, now accessible to org)
│   ├── organizationId ✅
│   └── organizationCommentingEnabled ✅
└── Access: Owner (edit) + Org Members (view/comment)
```

## Access Control Matrix

| User Type | Entry View | Entry Edit | Obituary View | Obituary Comment | Obituary Edit |
|-----------|------------|------------|---------------|------------------|---------------|
| **Creator** (userId match) | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Org Member** (same orgId) | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes* | ❌ No |
| **Non-Org User** | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No |

*When `organizationCommentingEnabled = true`

## Implementation Phases

### Phase 1: Database (1-2 hrs) 🔴 Critical
- Add `organization_id` column to `entry` table
- Create migration
- Add database index

### Phase 2: Queries (2-3 hrs) 🔴 Critical
- `getEntryWithAccess()` helper
- Update `getCreatorEntries` → `getOrganizationEntries`
- Add access control logic

### Phase 3: Mutations (1-2 hrs) 🔴 Critical
- Update `createEntryAction` to set orgId
- Enforce owner-only edits
- Add authorization tests

### Phase 4: Routes (3-4 hrs) 🔴 Critical
- Update entry page with access checks
- Update all nested obituary routes
- Update dashboard

### Phase 5: UI/UX (2-3 hrs) 🟡 Medium
- Role badges ("Team Entry")
- Conditional edit buttons
- Dashboard tabs (My Entries / Team Entries)

### Phase 6: Testing (2-3 hrs) 🟡 Medium
- Manual testing
- Documentation updates

**Total Estimated Time:** 12-17 hours

## Key Files to Modify

```
Database Layer:
├── drizzle/migrations/XXXX_add_entry_organization.sql (NEW)
├── src/lib/db/schema/entries.ts (ADD organizationId)
├── src/lib/db/queries/entries.ts (UPDATE access logic)
└── src/lib/db/mutations/entries.ts (UPDATE to include orgId)

Route Layer:
├── src/app/[entryId]/page.tsx (UPDATE access checks)
├── src/app/[entryId]/obituaries/[id]/view/page.tsx (UPDATE)
├── src/app/[entryId]/obituaries/[id]/page.tsx (UPDATE)
└── src/app/dashboard/page.tsx (UPDATE to show org entries)

Component Layer:
└── (Various components need conditional rendering based on role)
```

## Critical Security Checks

### ✅ DO
```typescript
// Check userId for edits
.where(and(
  eq(EntryTable.id, id),
  eq(EntryTable.userId, userId) // Owner only
))

// Check userId OR orgId for reads
.where(or(
  eq(EntryTable.userId, userId),
  eq(EntryTable.organizationId, orgId)
))
```

### ❌ DON'T
```typescript
// Never allow edits based on orgId alone
.where(eq(EntryTable.organizationId, orgId)) // WRONG!

// Never trust client-provided orgId
const orgId = req.body.orgId; // WRONG! Use auth()
```

## Quick Start Commands

```bash
# 1. Create migration
pnpm db:generate

# 2. Review migration file
cat drizzle/migrations/XXXX_add_entry_organization.sql

# 3. Apply migration (dev)
pnpm db:push

# 4. Run tests
pnpm test

# 5. Start dev server
pnpm dev
```

## Testing Checklist

- [ ] Create entry in Org A as User 1
- [ ] User 2 (Org A) can view entry
- [ ] User 2 (Org A) cannot edit entry
- [ ] User 3 (Org B) cannot view entry
- [ ] User 2 can view and comment on obituary (when enabled)
- [ ] User 2 cannot edit obituary
- [ ] Dashboard shows both "My Entries" and "Team Entries"
- [ ] Edit buttons only visible to creators
- [ ] Performance: Dashboard loads < 200ms

## Rollback Procedure

If issues arise:

```bash
# 1. Revert code changes
git revert <commit-hash>

# 2. Rollback database (if needed)
# Run the DOWN migration in drizzle/migrations/

# 3. Deploy rollback
pnpm build && pnpm start
```

## References

- **Full PRD:** `docs/prd-organization-entries.md`
- **Clerk Docs:** Organizations & RBAC
- **Similar Pattern:** `src/lib/db/queries/documents.ts` (already org-aware)
