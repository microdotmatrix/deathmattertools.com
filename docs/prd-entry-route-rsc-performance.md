---
title: Entry Route RSC & Cache Components Performance PRD
status: Draft
owners: Engineering
route: /[entryId]
last_updated: 2025-12-06
---

## 1) Objectives

- **Maximize server-side rendering and caching** for the `/[entryId]` route and its sub-routes using React Server Components (RSC) and Next.js 16 Cache Components.
- **Minimize client bundle size and hydration work** by constraining `"use client"` to the smallest possible leaf components.
- **Improve Lighthouse "Best Practices" score** (currently ~74) and maintain or improve current performance score (~91).
- **Establish route-specific patterns** for entry-related pages that align with the global performance PRD (e.g. `performance-optimization-prd.md`, `prd-cache-components.md`).

## 2) Scope

**In scope:**

- `/[entryId]` (Entry edit / overview route)
- `/[entryId]/obituaries/create`
- `/[entryId]/obituaries/[id]`
- `/[entryId]/images`
- `/[entryId]/images/create`

**Out of scope (referenced but not redesigned here):**

- Global layout, dashboard shell, and non-entry routes
- Low-level DB query implementations (assumed to be Drizzle/Neon-optimized already)
- AI model selection / latency (handled in other PRDs)

## 3) Current Architecture (Per Route)

### 3.1 `/[entryId]`

**Files:**

- `src/app/[entryId]/layout.tsx`
- `src/app/[entryId]/page.tsx`

**Key characteristics:**

- `EntryLayout` wraps children in `DashboardShell`.
- `EntryEditPage` is an async Server Component:
  - Awaits `params` (Promise-based App Router style) to get `entryId`.
  - Calls `getEntryWithAccess(entryId)` to enforce access control.
  - Fetches:
    - `obituaries = getDocumentsByEntryId(entryId)`
    - `generatedImages = getUserGeneratedImages(entry.userId!, entryId)`
  - Renders `EntryEditContent` inside `<Suspense fallback={<EntryEditContentSkeleton />}>`.
- `EntryEditContent` is also async server-side and fetches in parallel:
  - `entryDetails`, `entryImagesResult = Promise.all([getEntryDetailsById(entry.id), getEntryImages(entry.id)])`
  - Derives `entryImages` from `entryImagesResult`.
- Renders a fairly complex layout:
  - **Main column:**
    - Entry image preview (plain `<img>`).
    - `EntryForm` (likely a Client Component with form hooks).
    - `EntryDetailsCard` (may contain client bits like collapsible UI).
    - `EntryImageUpload` (likely client-driven file upload / image selection).
    - `EntryFeedbackPanel` wrapped in `Suspense`.
  - **Side column:**
    - Obituary list with edit/delete actions (uses `ActionButton`, a Client Component that wraps a server action).
    - Generated images summary/links.
    - `SavedQuotesList` under `Suspense`.
    - Entry metadata (created/updated timestamps).
- Cache behavior:
  - Upstream queries such as `getDocumentsByEntryId` already use `'use cache'` and `cacheTag(documentsByEntryTag(entryId))`.
  - A server action for deleting obituaries uses `revalidatePath(
  `/${entry.id}`
)` to refresh the page.

### 3.2 `/[entryId]/obituaries/create`

**File:**

- `src/app/[entryId]/obituaries/create/page.tsx`

**Key characteristics:**

- `ObituaryCreatePage` is an async Server Component:
  - Gets `entryId` from `params`.
  - Renders a back link and a `Suspense` boundary with `ObituaryCreateSkeleton`.
- `ObituaryCreateContent` (async server):
  - Fetches in parallel:
    - `entryAccess = getEntryWithAccess(entryId)`
    - `entryDetails = getEntryDetailsById(entryId)`
    - `savedQuotes = getSavedQuotesByEntryId(entryId)`
  - Fetches `documents = getDocumentsByEntryId(entryId)`.
  - Enforces obituary limit (`obitLimit`) before rendering.
  - Renders the **client-only** `GenerateObituary` component, passing:
    - `entry`, `entryDetails`, `savedQuotes`.
- `GenerateObituary` (from `src/components/sections/obituaries/generate.tsx`) is marked `"use client"` and:
  - Manages local state for tone/style/options.
  - Calls `generateObituary` and `generateObituaryFromDocument` server actions.
  - Uses streaming via `readStreamableValue` and shows loading state and streamed content.

### 3.3 `/[entryId]/obituaries/[id]`

**File:**

- `src/app/[entryId]/obituaries/[id]/page.tsx`

**Key characteristics:**

- `ObituaryPage` is an async Server Component.
- Auth & access:
  - Uses `auth()` to get `{ userId, orgId }`.
  - Redirects to sign-in if unauthenticated.
  - Calls `getDocumentWithAccess({ documentId: id, userId, orgId })`.
  - Validates `entryId` using `getEntryWithAccess(entryId)`.
- Data fetching:
  - Creates a Clerk client via `clerkClient()` and calls `clerk.users.getUser(userId)`.
  - In parallel:
    - `listDocumentComments()` (comment tree + authors).
    - Optionally `getChatByDocumentId()` and `getMessagesByChatId()` when the current user is owner.
- Derives:
  - `currentUser` object.
  - Commenting/organization capabilities and messaging (org membership via `clerk.organizations.getOrganizationMembershipList`).
- Rendering:
  - **Left column:** Suspense-wrapped `ObituaryViewerWithComments` (likely a client or mixed component, given in-document editing and text-anchored comments).
  - **Right column:**
    - Obituary detail Card.
    - `ObituaryComments` component (client) with `initialComments` (server-serialized).
    - `OrganizationCommentingSettings` (client) for org-level commenting controls.
    - Org info card for owners without org.
  - **Floating AI chat:** `DynamicChat` client component, shown only to owners.

### 3.4 `/[entryId]/images`

**File:**

- `src/app/[entryId]/images/page.tsx`

**Key characteristics:**

- `ImagesPage` (async server) uses `getEntryWithAccess(entryId)` and guards with `notFound()`.
- Wraps `PageContent` in `Suspense`.
- `PageContent` (async server):
  - Calls `getUserGeneratedImages(userId, entryId)`.
  - Groups and sorts images by date fully on the server.
  - Renders:
    - A full-width grid of the most recent day's images.
    - A two-column layout for previous days.
    - `ImageResult` components inside `Suspense` per image.
- `ImageResult` (async server component) calls `fetchImage(image.epitaphId)` and renders `EpitaphThumbnail`.

### 3.5 `/[entryId]/images/create`

**File:**

- `src/app/[entryId]/images/create/page.tsx`

**Key characteristics:**

- `Create` is an async Server Component:
  - Uses `auth()` and `getEntryWithAccess(entryId)`.
  - Owners-only; redirects back to `/[entryId]/images` for non-owners.
  - Reads `searchParams` for `id` (list of image IDs), fetches existing epitaph images via `getEpitaphImage` (wrapper around `fetchImage`).
  - Fetches `savedQuotes` and `userUploads` (direct DB call with Drizzle).
  - Declares `createEpitaphsAction` server action and passes it to `CreateImage`.
- Rendering:
  - **Aside:** `CreateImage` (client) for generating new images.
  - **Article:** Suspense-wrapped viewer of existing images using `ImageResult` (client) from `memorials` section.

## 4) Key Observations & Pain Points

1. **Strong RSC usage already**
   - All entry routes are implemented as async Server Components.
   - Data fetching happens server-side; no `fetch` in client components for these core routes.
   - Many heavy features (editor, AI chat, upload widgets) are already isolated into dedicated components.

2. **Large client surfaces in critical routes**
   - `GenerateObituary`, `EntryForm`, `EntryImageUpload`, `EntryFeedbackPanel`, `ObituaryViewerWithComments`, `ObituaryComments`, `OrganizationCommentingSettings`, `DynamicChat`, `CreateImage`, and image viewers are likely `"use client"` and can be heavy.
   - Several of these are rendered directly at route-level without `next/dynamic` or visibility-based loading.

3. **Cache Components partially adopted, but not fully exploited**
   - Some query modules use `'use cache'` and `cacheTag`, but entry-related routes do not yet consistently apply:
     - `cacheLife` profiles (`dashboard`, `content`, `realtime`, `static`).
     - Remote/private caching for semi-dynamic or per-user data.
   - On-demand invalidation is a mix of `revalidateTag` and `revalidatePath`, with some patterns evolving (e.g., delete obituary now uses `revalidatePath`).

4. **Potential Lighthouse "Best Practices" hits**
   While we do not see raw Lighthouse output, common causes given the code include:
   - Heavy client bundles on initial load for `/[entryId]` and `/[entryId]/obituaries/[id]` (editor/chat/comments UI).
   - Possible non-optimized image usage (plain `<img>` on `/[entryId]` instead of `next/image`).
   - Many client components wrapped in `Suspense` with generic fallbacks (`<div>Loading...</div>`), which can be perceived as layout shifts or low-quality loading UX.
   - Potential overuse of dynamic behavior (Clerk client usage) without `use cache: private` or properly framed boundaries.

## 5) Target Architecture & Principles (Next.js 16 + Cache Components)

1. **RSC-first:**
   - Continue treating all entry routes as RSC by default.
   - Only introduce `"use client"` at the smallest possible leaf components that need interactivity.

2. **Use Cache Components deliberately:**
   - For stable, frequently reused queries (entries, obituaries list, images, quotes), wrap them with `'use cache'` and `cacheTag(...)` with appropriate `cacheLife` profiles.
   - Prefer `cacheComponents: true` (already configured) and Cache Components over ad-hoc in-memory caches.

3. **Granular caching by data type:**
   - **Content-like** data (`entry`, `documents`, `images`): use `'use cache'` + `cacheLife('content')` + `cacheTag`.
   - **Dashboard/entry overlays & summaries:** use `cacheLife('dashboard')` where slightly shorter TTL is desired.
   - **Comments & AI chat metadata:** consider `use cache: remote` with short `cacheLife({ expire: 60 })` or `cacheLife('realtime')`.
   - **Per-user data (Clerk, org memberships):** consider `use cache: private` to avoid sharing between users.

4. **Revalidation strategy:**
   - Use `revalidateTag(tag, 'max')` for eventual consistency where stale-while-revalidate semantics are acceptable.
   - Continue to use `revalidatePath` for strict read-your-own-writes UX (e.g., deleting an obituary from the list).
   - For comments and org settings, rely primarily on tag-based revalidation + client-side optimistic updates where appropriate.

5. **Client boundaries and dynamic imports:**
   - Wrap heavy client experiences (editor, AI chat, full comment panels) behind `next/dynamic` with `ssr: false` **only when truly needed** (e.g., browser-only APIs), otherwise keep them SSR-capable.
   - Load these features **on intent**: click, hover, intersection, or route-level segmentation, not by default on first paint.

## 6) Detailed Recommendations by Route

### 6.1 `/[entryId]` (Entry Edit / Overview)

**6.1.1 Server-side data fetching & caching**

- Ensure the following functions use Cache Components with explicit caching directives in their implementation modules:
  - `getEntryWithAccess(entryId)`
  - `getEntryDetailsById(entry.id)`
  - `getEntryImages(entry.id)`
  - `getDocumentsByEntryId(entryId)`
  - `getUserGeneratedImages(entry.userId!, entryId)`
- For each, apply (in their query files):
  - `'use cache'`
  - `cacheLife('content')` (or `'dashboard'` if route is frequently updated).
  - `cacheTag(...)` with existing helpers (`entryDetailTag`, `documentsByEntryTag`, `userGeneratedImagesTag`, etc.).
- Confirm all entry-related fetches avoid `force-dynamic`/`revalidate = 0` in segment configs unless absolutely necessary.

**6.1.2 Make `DashboardShell` and `EntryLayout` server-friendly**

- If `DashboardShell` is currently a Client Component (using router, local state for sidebar, etc.), refactor per `performance-optimization-prd.md`:
  - Extract a tiny client leaf (e.g. `SidebarToggle`) with `"use client"`.
  - Keep the surrounding frame (`DashboardShell`, `EntryLayout`) as RSC.

**6.1.3 Minimize client footprint within `EntryEditContent`**

- **Entry image + static details** remain server-rendered.
- **EntryForm**:
  - Audit: if it is `"use client"` and uses local state for form fields, consider:
    - Moving non-interactive portions (labels, static text, summary) into a server wrapper component.
    - Using **Server Actions** for submission while keeping the UI as a minimal client form.
  - Avoid passing large objects (e.g. full `entry` record with relations) into the client; pass a minimal, serializable shape.

- **EntryImageUpload**:
  - Keep upload mutation logic on the server via Server Actions.
  - Ensure the client component only owns:
    - Drag-and-drop / file picker UI.
    - Progress display.
  - Defer loading any heavy upload preview or cropping libraries until a file is selected.

- **EntryFeedbackPanel**:
  - Wrap in a server wrapper that fetches feedback via `use cache` and only passes minimal props to a client visualization component.
  - Use `cacheTag(entryFeedbackTag(entry.id))` so feedback can be invalidated on mutation.

- **SavedQuotesList**:
  - Similar pattern: server wrapper loads data via `getSavedQuotesByEntryId` with `use cache` and `cacheTag(userSavedQuotesTag/entryId)`, then passes small props to a client component if interactivity is needed.

**6.1.4 Obituaries list actions**

- Current pattern:
  - Server action `deleteDocumentById`.
  - After success, `revalidatePath(
  `/${entry.id}`
)`.
- This is acceptable for strict consistency. To further optimize:
  - Optionally add `revalidateTag(documentsByEntryTag(entry.id), 'max')` in addition to `revalidatePath`, so other routes sharing the same data pick up changes with SWR semantics.
  - Optionally add a small optimistic client update in the obituary list (remove deleted item immediately) while server revalidation runs.

### 6.2 `/[entryId]/obituaries/create`

**6.2.1 Server-side orchestration**

- `ObituaryCreateContent` already uses a server-only orchestration pattern.
- Strengthen caching:
  - Ensure `getEntryWithAccess`, `getEntryDetailsById`, `getSavedQuotesByEntryId`, `getDocumentsByEntryId` all use `use cache` + `cacheLife('content')` + `cacheTag(...)`.

**6.2.2 `GenerateObituary` boundary and bundle size**

- `GenerateObituary` is a large client component with:
  - Multiple `useState` hooks.
  - `useTransition` for server actions.
  - Streaming output from `readStreamableValue`.
  - File uploads for PDF-based obituaries.

Recommendations:

- Keep `GenerateObituary` as client, but:
  - **Split** it into smaller client components where possible (e.g., configuration form, upload form, output viewer) to help React Compiler and bundle tree-shaking.
  - Ensure it is only imported from this route and not from shared layouts.
  - Consider `next/dynamic` at the route level if there are cases where the user rarely opens the "Create" tab.

- Move any purely-presentational text (e.g., explanatory copy, headings) into server components where feasible to avoid shipping them as client code.

### 6.3 `/[entryId]/obituaries/[id]`

**6.3.1 Cache Comments & Document Access**

- For `getDocumentWithAccess`, `listDocumentComments`, `getChatByDocumentId`, `getMessagesByChatId`:
  - Add `use cache` and appropriate `cacheLife` profiles.
  - Use tagging:
    - `cacheTag(documentTag(documentId))` for document content.
    - `cacheTag(documentCommentsTag(documentId))` for comments.
    - A separate tagging scheme for chat (e.g., `chat:${documentId}`).
- For org membership (Clerk):
  - Consider using `use cache: private` for `clerk.organizations.getOrganizationMembershipList` and limit its TTL with `cacheLife({ expire: 300 })` to reduce repeated calls.

**6.3.2 Client boundaries and dynamic features**

- `ObituaryViewerWithComments`:
  - If the **viewer** supports both read-only and inline editing, consider splitting into:
    - A server/SSR-friendly **read-only** viewer that renders content.
    - A small client overlay that handles in-place editing only when the user toggles "Edit".

- `ObituaryComments`:
  - Use a server wrapper that passes `initialComments` (already implemented with `toSerializableComments`).
  - The wrapper should be responsible for fetching and caching; the client component should only handle interaction (replying, expanding threads) and call Server Actions to add/edit/delete comments.

- `OrganizationCommentingSettings`:
  - Keep as client, but consider lazy-loading it only when the owner opens a "Commenting settings" section (accordion or modal) rather than always rendering it in the main sidebar.

- `DynamicChat`:
  - Already conditionally rendered (`isOwner && ...`). Further optimize by:
    - Using `next/dynamic` import for `DynamicChat` with a minimal placeholder button ("Open AI assistant") as the default.
    - Only load the full chat UI when the user opens it, reducing initial JS and improving Lighthouse best practices.

### 6.4 `/[entryId]/images`

**6.4.1 Server-side heavy lifting**

- `PageContent` does all grouping and sorting on the server, which is ideal.
- `ImageResult` is an async server component that fetches the image from Placid and renders `EpitaphThumbnail`.

Recommendations:

- Add `use cache: remote` to the `fetchImage` call (or inside an internal helper) with `cacheLife({ expire: 300 })` so Placid image responses are cached in the remote cache handler, reducing repeated external requests.
- Ensure `EpitaphThumbnail` is an RSC if possible. If it must be client-side (hover effects, tooltips), keep the client portion light and stateless.

### 6.5 `/[entryId]/images/create`

**6.5.1 Data fetching & caching**

- `getEpitaphImage` should also use `use cache: remote` + `cacheLife({ expire: 300 })` for Placid images.
- Saved quotes and user uploads should leverage `use cache` + `cacheTag(userUploadsTag(entryId))` and `userSavedQuotesTag(entryId)`.

**6.5.2 Client-create flow**

- `CreateImage` is a client component that:
  - Receives a server action (`createEpitaphsAction`) for mutations.
  - Likely uses local state for configuration and previews.

Recommendations:

- Keep `CreateImage` client-only but ensure that:
  - All heavy logic (actual generation, DB writes) stays server-side in `createEpitaphs`.
  - Client-side image previews use efficient components and avoid heavy libraries unless needed.

- `ImageResult` from the memorials section (used to show generated images after redirect):
  - If this is client-based and heavy, consider a server wrapper that only passes pre-fetched image URLs.

## 7) Cross-Cutting Improvements & Best Practices

1. **Adopt file-/function-level `use cache` consistently**
   - For all entry-related read-only fetchers, standardize on:
     ```ts
     export async function getX(...) {
       'use cache'
       cacheLife('content')
       cacheTag(/* appropriate tag */)
       // ...query...
     }
     ```
   - Use `use cache: remote` for external services (`fetchImage`, AI providers if used in server functions).

2. **Segment dynamic behavior with Suspense & connection() only where needed**
   - Avoid unnecessary calls to `connection()` or Dynamic APIs in components that can remain static/cached.
   - Keep Suspense fallbacks meaningful and avoid flashing generic text that can hurt perceived quality.

3. **Image best practices**
   - Prefer `next/image` for large, user-facing images on `/[entryId]` (entry portrait) with proper `sizes` and `priority` usage.
   - Confirm Placid images are cached and not repeatedly re-fetched without reason.

4. **Client bundle hygiene**
   - Run bundle analysis focused on `/[entryId]`, `/[entryId]/obituaries/[id]`, `/[entryId]/obituaries/create`, and `/[entryId]/images/create`.
   - Identify top contributors (editor, chat, comments, upload widgets) and prioritize:
     - Lazy-loading via `next/dynamic`.
     - Splitting large components into smaller ones.
     - Reducing dependency surface (e.g., not importing full icon packs).

5. **CI & guardrails for this route**
   - Extend global guardrails (from `performance-optimization-prd.md`) to explicitly track and alert when:
     - Client JS for `/[entryId]` or `/[entryId]/obituaries/[id]` exceeds a defined threshold.
     - New top-level `"use client"` directives appear under `src/app/[entryId]/**`.

## 8) Phased Implementation Plan (Entry Routes)

### Phase 1: Measurement & Baseline (1–2 days)

- Run `next build --analyze` and record client JS for:
  - `/[entryId]`
  - `/[entryId]/obituaries/create`
  - `/[entryId]/obituaries/[id]`
  - `/[entryId]/images`
  - `/[entryId]/images/create`
- Capture Lighthouse reports for `/[entryId]` and `/[entryId]/obituaries/[id]` focusing on **Best Practices**.
- Document findings in a short addendum to this PRD.

### Phase 2: Cache Components Alignment (2–3 days)

- Audit all entry-related query functions and:
  - Add `use cache` + `cacheLife` + `cacheTag` where missing.
  - Introduce `use cache: remote` for Placid and similar external services.
  - Add `use cache: private` where Clerk/user-specific data should not be shared.
- Standardize mutation handlers (server actions) to use `revalidateTag` or `revalidatePath` according to consistency needs.

### Phase 3: Client Boundary Refinement (3–5 days)

- For `/[entryId]`:
  - Refactor `EntryForm`, `EntryImageUpload`, `EntryFeedbackPanel`, `SavedQuotesList` into server+client shells as needed.
  - Confirm `DashboardShell` and `EntryLayout` are server.
- For `/[entryId]/obituaries/[id]`:
  - Split `ObituaryViewerWithComments` into server read-only + client editing.
  - Lazy-load `DynamicChat` and optionally `OrganizationCommentingSettings`.
- For `/[entryId]/images/create`:
  - Confirm `CreateImage` only does client UI; keep logic server-side.

### Phase 4: Best Practices & UX Polish (2–3 days)

- Replace generic Suspense fallbacks with context-appropriate skeletons.
- Migrate key images to `next/image` where beneficial.
- Verify no blocking third-party scripts/resources are introduced on these routes.

### Phase 5: Validation & Regression Guardrails (1–2 days)

- Re-run Lighthouse and bundle analysis; compare against baseline.
- Update CI to:
  - Enforce per-route JS budget for `/[entryId]` and `/[entryId]/obituaries/[id]`.
  - Flag new top-level `"use client"` under `src/app/[entryId]/**`.

## 9) Success Metrics

- **Client JS reduction:**
  - Target: >15–25% reduction in client JS for `/[entryId]` and `/[entryId]/obituaries/[id]` vs baseline.
- **Lighthouse:**
  - Maintain **Performance** ≥ 90.
  - Improve **Best Practices** from ~74 to ≥ 90.
- **RSC coverage:**
  - 80–90% of components used in entry routes remain server by LOC.
- **Operational:**
  - No regressions in access control, comments, or AI chat behavior.

## 10) Open Questions

- Should `/[entryId]` prioritize **strict read-your-own-writes** for all mutations (deletes, edits, feedback), or can some flows rely on SWR-style `revalidateTag` only?
- Are there UX constraints around always showing the AI chat bubble and comment settings, or can these be deferred behind explicit user actions?
- What are acceptable TTLs for entry content vs comments vs chat metadata in the context of Neon + Drizzle?
