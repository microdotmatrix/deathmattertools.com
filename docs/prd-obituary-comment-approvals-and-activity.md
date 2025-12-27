# PRD: Obituary Comment Approvals + Activity Indicators

**Version:** 0.1  
**Created:** 2025-12-26  
**Status:** Draft (for review)  
**Priority:** Medium  

---

## Executive Summary

Add an approval workflow to obituary comments (document comments) using the same model as entry feedback (pending/approved/denied/resolved). Then surface activity indicators on obituary list items inside entry pages, so entry owners can see when an obituary has pending comment approvals. This will align review workflows across entry feedback and obituary comments, and provide a consistent “pending activity” signal across the product.

---

## Current State (Codebase Evaluation)

### Obituary Comments (Document Comments)

- **Schema:** `DocumentCommentTable` in `src/lib/db/schema/documents.ts`
  - Fields: `content`, `parentId`, `createdAt`, `updatedAt`, plus anchor fields (`anchorStart`, `anchorEnd`, `anchorStatus`, etc.).
  - **No comment approval status** exists today.
- **Actions:** `src/actions/comments.ts`
  - `createCommentAction`, `updateCommentAction`, `deleteCommentAction`
  - `updateAnchorStatusAction` (owner-only; for anchored comments only)
- **Queries:** `src/lib/db/queries/comments.ts`
  - `listDocumentComments` returns all comments for a document.
- **UI:** `src/components/sections/obituaries/comments-panel.tsx`
  - Threaded comment UI with reply/edit/delete.
  - No moderation or approval state displayed.
- **Access:** `getDocumentWithAccess` in `src/lib/db/queries/documents.ts`
  - Owner can edit/comment. Org members can comment if `organizationCommentingEnabled`.
  - Owner is currently the only moderation role used in comment actions.

### Entry Feedback (Reference Model)

- **Schema:** `EntryFeedbackTable` in `src/lib/db/schema/entry-feedback.ts`
  - `status` with `pending|approved|denied|resolved` + status metadata.
- **Actions/UI:** `src/actions/entry-feedback.ts` and `src/components/sections/entry-feedback/*`
  - Owner moderates.
  - Author can edit/delete only while pending.
  - Status displayed per item.

### Obituary List Locations (Activity Indicator Targets)

Obituaries are listed inside each entry in two primary places:
- **Entry sidebar:** `src/app/[entryId]/_components/entry-sidebar-content.tsx` uses `ObituaryListItem` from `src/components/sections/entries/obituary-list.tsx`.
- **Obituary list modal:** `src/components/sections/entries/obituary-list.tsx` also renders `ObituaryListItem`.

---

## Goals

1. Introduce an approval workflow for obituary comments that mirrors entry feedback status flow.
2. Provide owners with clear moderation actions for comments (approve/deny/resolve).
3. Surface pending-comment activity indicators on obituary list items inside entry pages.
4. Keep existing anchor moderation (`anchorStatus`) intact and separate.

---

## Non-Goals (for this iteration)

- Changing the anchored comment approval logic (`anchorStatus`) or replacing it.
- Reworking the threading UI or adding new comment types.
- Notification delivery (email/push); this is UI-only.

---

## User Stories

### Entry Owner / Document Owner
- **I want** to approve/deny obituary comments like I do entry feedback  
  **So that** I can manage quality and accuracy.
- **I want** a visible indicator when an obituary has pending comments  
  **So that** I can quickly identify documents needing review.

### Organization Member (Commenter)
- **I want** to leave a comment and see its status  
  **So that** I know whether it was accepted or still pending.

---

## Proposed Approval Model (Obituary Comments)

### Status Fields (mirrors entry feedback)

Add to `DocumentCommentTable`:
- `status` (`pending|approved|denied|resolved`) default `pending`
- `statusChangedAt` timestamp
- `statusChangedBy` text (user id)

### Status Transitions

```
pending -> approved -> resolved
pending -> denied
```

**Rules:**
- Only document owner can change status.
- Comment author can edit/delete only while `pending`.
- “Resolved” only allowed from “approved” (same as entry feedback).

### Visibility (Open Choice)

Two options:
1. **Entry-feedback parity (recommended for consistency):** show all comments to all viewers, with status badges.
2. **Moderation-first:** show only approved comments to non-owners; owners see all.

This choice affects the UI/UX and should be decided before implementation.

---

## Activity Indicator Requirements (Obituaries)

### Trigger

Show indicator when `pending` comment count for an obituary is > 0.

### UI Pattern

Match the entry-card indicator style:
- **Icon:** small dot (`bg-primary`) with tooltip text showing count.
- **Placement:** right side of `ObituaryListItem` (same component used in sidebar + modal).

### Tooltip Text

`{count} pending feedback item(s)`

---

## Technical Design

### Data Model Changes

**Table:** `v1_document_comment`  
**Migration:** add a new SQL file (e.g., `0019_add_document_comment_status.sql`)

Add columns:
- `status` (varchar/text, default `pending`)
- `status_changed_at` (timestamp, nullable)
- `status_changed_by` (text, FK to user, nullable)

Add index:
- `(document_id, status)` to speed pending-count queries

> **Note (Context7):** Drizzle migrations are SQL files stored in the migrations folder and applied with `drizzle-kit migrate`. (Ref: Drizzle ORM docs from Context7.)

### Server Actions

Extend `src/actions/comments.ts` with:
- `updateCommentStatusAction(documentId, commentId, status)`
  - Mirrors `updateFeedbackStatusAction` behavior.
  - Owner-only.
  - Uses `updateDocumentCommentStatus` mutation.

Update `createCommentAction` to set `status = pending` (default is OK).
Update `updateCommentAction` and `deleteCommentAction` to enforce `pending` constraint (author-only, pending-only).

### Mutations

Add `updateDocumentCommentStatus` in `src/lib/db/mutations/comments.ts`:
- Sets status, `statusChangedAt`, `statusChangedBy`, `updatedAt`.

### Queries

Add `getPendingDocumentCommentCounts(documentIds: string[])` in `src/lib/db/queries/comments.ts` or a new query module:
- Groups by `documentId`, counts `status = pending`.
- Uses `documentCommentsTag(documentId)` for cache invalidation.

### UI Updates (Comment Panel)

In `src/components/sections/obituaries/comments-panel.tsx`:
- Display status badge for each comment.
- Add moderation actions (approve/deny/resolve) for owners.
- Restrict edit/delete to pending only (author or owner).

### UI Updates (Obituary List Items)

In `src/components/sections/entries/obituary-list.tsx`:
- Accept `pendingCommentCount` prop.
- Render dot indicator + tooltip if `> 0`.

In `src/app/[entryId]/layout.tsx`:
- Fetch counts in `src/app/[entryId]/layout.tsx` and pass into sidebar.
- Pass counts into `EntrySidebarContent`/`ObituaryListItem`.

---

## Implementation Plan (Phased)

### Phase 1 — Approval System

1. **Schema + Migration**
   - Add `status`, `status_changed_at`, `status_changed_by` to `DocumentCommentTable`.
   - Migration SQL in `src/lib/db/migrations`.
2. **Mutations**
   - Add `updateDocumentCommentStatus`.
3. **Actions**
   - Add `updateCommentStatusAction`.
   - Enforce pending-only edit/delete.
4. **UI**
   - Add status badges and moderation actions in `ObituaryComments`.
   - Adjust visibility rules (decide per Open Questions).

### Phase 2 — Activity Indicators

1. **Counts Query**
   - `getPendingDocumentCommentCounts(documentIds)`.
2. **Entry Layout**
   - Fetch counts in `src/app/[entryId]/layout.tsx` and pass into sidebar.
3. **Obituary List Items**
   - Render dot indicator + tooltip in `ObituaryListItem`.

---

## Edge Cases

- **Existing comments:** should default to `approved` or `pending`? (see Open Questions)
- **Replies:** if parent is denied/resolved, should replies be allowed?
- **Anchored comments:** keep `anchorStatus` independent from new comment status.
- **Permissions:** owner-only moderation; organization admins currently have no access path—confirm if needed.

---

## Open Questions

1. Should existing comments be backfilled as `approved` to avoid a “mass pending” state?
2. Should non-owners see pending/denied comments, or only approved?
3. Should a denied parent hide its replies (for non-owners)?
4. Should organization admins be able to moderate document comments, or only the document owner?
