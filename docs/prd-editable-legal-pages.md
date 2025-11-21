# PRD: Editable Legal Pages (Privacy & Terms)

**Feature Branch:** `feature/editable-legal-pages`  
**Status:** Draft  
**Created:** November 21, 2025  
**Priority:** High

---

## Overview

System administrators need a low-friction way to keep the public Privacy Policy and Terms of Service up to date without redeploying the site. This PRD defines the plan to persist each pages Markdown in the database, render it at runtime, and gate inline editing behind the existing Tiptap Markdown editor that is already used on obituary routes.

---

## Objectives

1. **Centralize page content** d legal copy lives in the DB so non-developers can edit it.
2. **Improve editing UX** d reuse the familiar Tiptap Markdown editor for WYSIWYG editing.
3. **Maintain security** d limit editing to `system_admin` role, ensure all DB access occurs server-side.
4. **Preserve SEO** d render Markdown via Streamdown on the server for fast, crawlable content.

---

## Scope

### In Scope

- New `PageContentTable` (Drizzle + PostgreSQL) with `id`, `title`, `slug`, `content`, `created_at`, `updated_at`.
- Drizzle migration + Neon deployment (using existing branching workflow).
- Cached server utilities to fetch page content by slug.
- Rendering privacy & terms pages via Streamdown using DB content.
- Admin-only edit button that opens the Tiptap Markdown editor (modal or inline) seeded with current content.
- Save flow that updates DB content and invalidates caches.

### Out of Scope

- Creating content seeding scripts (user will insert content manually post-migration).
- General CMS UI for other pages.
- Granular audit logs beyond timestamps.

---

## Data Model

| Column       | Type          | Notes                                           |
| ------------ | ------------- | ----------------------------------------------- |
| `id`         | `text` PK     | `cuid()` or UUID.                               |
| `title`      | `text`        | Display name ("Privacy Policy").                |
| `slug`       | `text` unique | Used to fetch per route (`privacy`, `terms`).   |
| `content`    | `text`        | Markdown body rendered by Streamdown.           |
| `created_at` | `timestamp`   | Default now.                                    |
| `updated_at` | `timestamp`   | Default now, auto-updated trigger in app layer. |

Constraints:

- Unique index on `slug` for fast lookups.
- Table name should respect `DATABASE_PREFIX` via `pgTable` helper.

---

## Technical Requirements

1. **Drizzle Schema**
   - Extend `src/lib/db/schema/index.ts` export list.
   - New file `src/lib/db/schema/page-content.ts` describing `PageContentTable`.
   - Add helper query functions (insert/update/fetch) in `src/lib/db/queries/page-content.ts`.

2. **Migrations**
   - Generate via `pnpm drizzle-kit generate`.
   - Review SQL, apply to Neon branch, then main.
   - Migration file stored under `src/lib/db/migrations`.

3. **Server Utilities**
   - `getPageContentBySlug(slug)` using Drizzle and cached with `cache()` for Next.js App Router.
   - Provide `updatePageContent(slug, payload)` server action restricted to `system_admin` (reuse Clerk role checks).
   - Invalidate cache via `revalidatePath` for `/privacy` or `/terms` after update.

4. **Rendering**
   - Remove static `<section>` content in `src/app/privacy/page.tsx` & `src/app/terms/page.tsx`.
   - Fetch DB content in Server Component, pass Markdown to `<Streamdown>` (wrap existing Response component or inline).
   - Provide graceful fallback (skeleton or call-to-action) if content missing.

5. **Editing Experience**
   - Admin-only `EditContentButton` on each page (likely below header).
   - Clicking opens client-side modal with the Tiptap Markdown editor reused from obituary routes (import existing component).
   - Initialize editor with current Markdown, allow screenshot attachments? (out of scope).
   - On save, call server action to persist and close modal; show success/error via toast.

6. **Access Control**
   - Server action double-checks Clerk session role.
   - Client UI hides edit button for non-admins.
   - Attempted POSTs without role return 403.

7. **Performance & SEO**
   - Keep pages fully statically optimized by loading content server-side.
   - caching ensures minimal DB hits; updates revalidate.

---

## Implementation Plan

1. **Setup & Planning**
   - Confirm branch `feature/editable-legal-pages` (done).
   - Review existing Tiptap editor component contracts.

2. **Database Layer**
   - Add `PageContentTable` schema + Drizzle relations (none).
   - Run migration locally, apply to Neon staging branch, verify via `SELECT`.
   - Prepare `PageContentTable` entries (empty allowed).

3. **Data Access Helpers**
   - `getPageContent(slug)` cached fetcher.
   - `savePageContent({ slug, content, title })` server action with role guard, updates `updated_at`.

4. **Route Updates**
   - Update `/privacy` and `/terms` server components: fetch data, render `<Streamdown>{markdown}</Streamdown>`.
   - Add loading/empty states (card with message + admin-only CTA to add content).

5. **Editing UI**
   - Create `LegalPageEditor` client component wrapping existing Tiptap Markdown editor (lazy load).
   - Provide `Edit` button (Shadcn button) visible only to `system_admin`.
   - On save, call action, revalidate path, close modal, show toast.

6. **Testing**
   - Unit: ensure fetcher returns data, caching works.
   - Manual: admin edit flow; non-admin sees no button.
   - Migration verification on Neon.

7. **Docs & Handoff**
   - Update README/tech notes if needed with instructions for seeding content.

---

## Risks & Mitigations

| Risk                                    | Mitigation                                            |
| --------------------------------------- | ----------------------------------------------------- |
| Missing page content causes blank pages | Provide fallback copy & admin prompt to add content.  |
| Unauthorized edits                      | Enforce Clerk role checks server-side + UI gating.    |
| Cache staleness                         | Invalidate via `revalidatePath` after updates.        |
| Editor asset bloat                      | Lazy-load Tiptap bundle only for admins when editing. |

---

## Open Questions

1. Should we seed initial rows during migration or let the user insert manually? (current plan: manual insertion post-migration)
2. Preferred placement for the edit button (header vs sticky footer)?
3. Do we need version history/audit log for legal content? (not in MVP).

---

## Next Steps

1. Await product approval of this PRD.
2. Once approved, execute migration + implementation per plan.
3. Provide instructions for inserting initial Privacy/Terms Markdown via SQL or admin UI.
