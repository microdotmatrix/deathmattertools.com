# PRD: Next.js 16 Cache Components Implementation

## Overview

This document outlines the implementation strategy for adopting Next.js 16's stable Cache Components feature, including the `"use cache"` directive, `cacheLife()` function, `cacheTag()` function, and proper `revalidateTag()` integration with mutations. This replaces the legacy `unstable_cache` wrapper currently in use.

## Background

### Current State

- Project uses Next.js 16.0.7 with `cacheComponents` commented out in `next.config.ts`
- Legacy caching via `unstable_cache` wrapped with React's `cache()` in `src/lib/cache.ts`
- Mutations already use `revalidateTag()` with the `'max'` profile for stale-while-revalidate
- Existing tag helpers: `entryListTag`, `entryDetailTag`, `documentTag`, `documentCommentsTag`, etc.
- React's `cache()` used in query files for request deduplication

### New Paradigm (Next.js 16 Cache Components)

The stable Cache Components feature provides:

- **`"use cache"` directive** - Mark functions/components as cacheable
- **`cacheLife()`** - Define cache duration profiles (stale, revalidate, expire)
- **`cacheTag()`** - Associate tags for on-demand invalidation
- **`revalidateTag(tag, profile)`** - Invalidate with stale-while-revalidate behavior

### Key Behavioral Changes

1. With `cacheComponents: true`, data fetching is **excluded from pre-renders by default**
2. Components accessing uncached data must be wrapped in `<Suspense>` or use `"use cache"`
3. Props/arguments automatically become part of the cache key
4. Cache spans both client and server caching layers

---

## Goals

1. **Enable `cacheComponents`** in `next.config.ts` with appropriate cache profiles
2. **Migrate data fetching functions** from `unstable_cache` to `"use cache"` directive
3. **Define cache profiles** appropriate for different data types (entries, documents, comments)
4. **Ensure proper Suspense boundaries** for dynamic content
5. **Update mutations** to use `revalidateTag()` with appropriate profiles
6. **Maintain request deduplication** via React's `cache()` where needed

---

## Cache Profile Strategy

### Proposed Profiles in `next.config.ts`

```typescript
cacheLife: {
  // For user-specific dashboard data - short cache, frequent revalidation
  dashboard: {
    stale: 60,           // 1 minute client staleness OK
    revalidate: 30,      // Server revalidates every 30s
    expire: 300,         // Max 5 minutes before forced refresh
  },

  // For entry/document detail pages - moderate caching
  content: {
    stale: 300,          // 5 minutes client staleness OK
    revalidate: 60,      // Server revalidates every minute
    expire: 3600,        // Max 1 hour
  },

  // For comments - short cache for real-time feel
  realtime: {
    stale: 30,           // 30 seconds
    revalidate: 15,      // 15 seconds
    expire: 120,         // 2 minutes max
  },

  // For static/semi-static content - long cache
  static: {
    stale: 3600,         // 1 hour
    revalidate: 1800,    // 30 minutes
    expire: 86400,       // 1 day
  },
}
```

---

## Implementation Phases

### Phase 1: Configuration & Infrastructure (1-2 hours)

**Tasks:**

1. Enable `cacheComponents: true` in `next.config.ts`
2. Define cache profiles as specified above
3. Update `src/lib/cache.ts` to export new utilities:
   - Keep existing tag helper functions
   - Add new `"use cache"` compatible wrappers if needed
   - Deprecate the `cache()` wrapper that uses `unstable_cache`

**Files:**

- `next.config.ts`
- `src/lib/cache.ts`

---

### Phase 2: Query Function Migration (3-4 hours)

Migrate query functions to use `"use cache"` directive with appropriate tags and lifetimes.

#### 2.1 Entry Queries (`src/lib/db/queries/entries.ts`)

```typescript
// Before (current pattern)
export const getOrganizationEntries = cache(async () => {
  const { userId, orgId } = await auth();
  // ...db query
});

// After (use cache pattern)
export async function getOrganizationEntries() {
  "use cache";
  cacheLife("dashboard");

  const { userId, orgId } = await auth();
  if (!userId) return [];

  cacheTag(entryListTag(userId));
  if (orgId) cacheTag(`entries:org:${orgId}`);

  // ...db query
}
```

**Important:** Functions reading `auth()` cookies need careful handling:

- The auth call creates a dynamic boundary
- Cache key includes `userId`/`orgId` via closed-over values
- Consider separating auth check from cached data fetch

**Recommended Pattern for Auth-Dependent Queries:**

```typescript
// Uncached wrapper handles auth, passes to cached function
export async function getOrganizationEntries() {
  const { userId, orgId } = await auth();
  if (!userId) return [];
  return getCachedOrganizationEntries(userId, orgId);
}

// Cached function receives auth data as props (cache key)
async function getCachedOrganizationEntries(
  userId: string,
  orgId: string | null
) {
  "use cache";
  cacheLife("dashboard");
  cacheTag(entryListTag(userId));
  if (orgId) cacheTag(`entries:org:${orgId}`);

  // ...db query (no auth() call here)
}
```

#### 2.2 Document Queries (`src/lib/db/queries/documents.ts`)

```typescript
export async function getDocumentsByEntryId(entryId: string) {
  "use cache";
  cacheLife("content");
  cacheTag(`documents:entry:${entryId}`);

  // ...db query
}

export async function getDocumentById(id: string) {
  "use cache";
  cacheLife("content");
  cacheTag(documentTag(id));

  // ...db query
}
```

#### 2.3 Comment Queries (`src/lib/db/queries/comments.ts`)

```typescript
export async function getDocumentComments(documentId: string) {
  "use cache";
  cacheLife("realtime");
  cacheTag(documentCommentsTag(documentId));

  // ...db query
}
```

**Query Files to Migrate:**

- `src/lib/db/queries/entries.ts` - ✓ High priority
- `src/lib/db/queries/documents.ts` - ✓ High priority
- `src/lib/db/queries/comments.ts` - ✓ High priority
- `src/lib/db/queries/media.ts` - Medium priority
- `src/lib/db/queries/chats.ts` - Medium priority
- `src/lib/db/queries/entry-feedback.ts` - Lower priority
- `src/lib/db/queries/quotes.ts` - Lower priority

---

### Phase 3: Mutation Revalidation Updates (1-2 hours)

Ensure all mutations properly invalidate cache with appropriate profiles.

**Pattern:**

```typescript
"use server";

import { revalidateTag } from "next/cache";

export async function createEntry(data: FormData) {
  // ... create entry

  // Use 'max' profile for stale-while-revalidate
  revalidateTag(entryListTag(userId), "max");
  revalidateTag(`entries:org:${orgId}`, "max");
}

export async function updateEntry(entryId: string, data: FormData) {
  // ... update entry

  revalidateTag(entryDetailTag(entryId), "max");
  revalidateTag(entryListTag(userId), "max");
}

export async function deleteEntry(entryId: string) {
  // ... delete entry

  // Immediate invalidation for deletes (no second arg)
  revalidateTag(entryDetailTag(entryId));
  revalidateTag(entryListTag(userId), "max");
}
```

**Mutation Files to Update:**

- `src/actions/obituaries.ts` - Already uses revalidatePath
- `src/actions/comments.ts` - Already uses revalidateTag with 'max' ✓
- `src/lib/db/mutations/entries.ts`
- `src/lib/db/mutations/documents.ts`

---

### Phase 4: Suspense Boundary Optimization (2-3 hours)

With `cacheComponents: true`, components accessing dynamic data without `"use cache"` must be wrapped in Suspense.

#### 4.1 Dashboard Page (`src/app/dashboard/page.tsx`)

Current structure is good - already has Suspense around `PageContent`. Verify:

```tsx
export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return <AccessDenied />;
  }

  return (
    <DashboardShell>
      <Suspense fallback={<PageContentSkeleton />}>
        <PageContent />
      </Suspense>
    </DashboardShell>
  );
}
```

#### 4.2 Entry Detail Page (`src/app/[entryId]/page.tsx`)

Add granular Suspense boundaries for independent data:

```tsx
export default async function EntryPage({ params }) {
  return (
    <div>
      {/* Static shell */}
      <Header />

      {/* Entry details - can be cached */}
      <Suspense fallback={<EntrySkeleton />}>
        <EntryDetails entryId={params.entryId} />
      </Suspense>

      {/* Obituaries list - separate cache/suspense */}
      <Suspense fallback={<ObituariesSkeleton />}>
        <ObituariesList entryId={params.entryId} />
      </Suspense>

      {/* Comments - more frequent updates */}
      <Suspense fallback={<CommentsSkeleton />}>
        <CommentsSection documentId={documentId} />
      </Suspense>
    </div>
  );
}
```

#### 4.3 Review All Route Pages

**Pages requiring Suspense audit:**

- `src/app/dashboard/page.tsx` ✓ Has Suspense
- `src/app/[entryId]/page.tsx` - Needs review
- `src/app/[entryId]/obituaries/[documentId]/page.tsx` - Needs review
- `src/app/[entryId]/images/page.tsx` - Needs review

---

### Phase 5: Component-Level Caching (1-2 hours)

For components that fetch their own data, add `"use cache"` at component level:

```tsx
// Cached server component
async function RecentEntries({ userId }: { userId: string }) {
  "use cache";
  cacheLife("dashboard");
  cacheTag(`recent-entries:${userId}`);

  const entries = await db.query.EntryTable.findMany({
    where: eq(EntryTable.userId, userId),
    limit: 5,
    orderBy: desc(EntryTable.createdAt),
  });

  return <EntriesList entries={entries} />;
}
```

---

## Testing Strategy

### 1. Build Verification

```bash
pnpm build
```

- Ensure no "Uncached data was accessed outside of <Suspense>" errors
- Verify static shell generation

### 2. Cache Behavior Testing

- Use browser DevTools Network tab to verify cache headers
- Check for `x-nextjs-cache` header values
- Test revalidation by triggering mutations

### 3. Performance Metrics

- Compare LCP/FCP before and after
- Monitor cache hit rates via logging (optional)

---

## Rollback Plan

If issues arise:

1. Comment out `cacheComponents: true` in `next.config.ts`
2. Legacy `cache()` wrapper remains functional
3. Query functions without `"use cache"` will work normally

---

## Files Summary

### Modified Files

| File                                      | Changes                                            |
| ----------------------------------------- | -------------------------------------------------- |
| `next.config.ts`                          | Enable cacheComponents, add cacheLife profiles     |
| `src/lib/cache.ts`                        | Update utilities, deprecate unstable_cache wrapper |
| `src/lib/db/queries/entries.ts`           | Add "use cache", cacheLife, cacheTag               |
| `src/lib/db/queries/documents.ts`         | Add "use cache", cacheLife, cacheTag               |
| `src/lib/db/queries/comments.ts`          | Add "use cache", cacheLife, cacheTag               |
| `src/lib/db/queries/media.ts`             | Add "use cache", cacheLife, cacheTag               |
| `src/lib/db/mutations/*`                  | Ensure revalidateTag with profiles                 |
| `src/actions/*.ts`                        | Verify revalidateTag usage                         |
| `src/app/dashboard/page.tsx`              | Verify Suspense coverage                           |
| `src/app/[entryId]/page.tsx`              | Add granular Suspense boundaries                   |
| `src/app/[entryId]/obituaries/*/page.tsx` | Add Suspense boundaries                            |

### New Files

| File          | Purpose               |
| ------------- | --------------------- |
| None required | Migration is in-place |

---

## Estimated Timeline

| Phase                        | Duration  | Dependencies |
| ---------------------------- | --------- | ------------ |
| Phase 1: Configuration       | 1-2 hours | None         |
| Phase 2: Query Migration     | 3-4 hours | Phase 1      |
| Phase 3: Mutation Updates    | 1-2 hours | Phase 1      |
| Phase 4: Suspense Boundaries | 2-3 hours | Phases 2-3   |
| Phase 5: Component Caching   | 1-2 hours | Phase 4      |
| Testing & Fixes              | 1-2 hours | All phases   |

**Total: 9-15 hours**

---

## Success Criteria

1. ✅ `pnpm build` completes without cache-related errors
2. ✅ Dashboard loads with proper static shell + streaming
3. ✅ Entry/document pages show improved TTFB
4. ✅ Mutations properly invalidate cached data
5. ✅ No regression in user-facing functionality
6. ✅ Cache hit rate observable in production metrics

---

## References

- [Next.js Cache Components Docs](https://nextjs.org/docs/app/building-your-application/caching)
- [use cache Directive](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [cacheLife Function](https://nextjs.org/docs/app/api-reference/functions/cacheLife)
- [cacheTag Function](https://nextjs.org/docs/app/api-reference/functions/cacheTag)
- [revalidateTag Function](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
