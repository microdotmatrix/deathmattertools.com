---
description: Redesign the entry page layout into a full-width primary form with collapsible sections.
---

# Entry Page Redesign PRD

## Objective

Refactor `src/app/[entryId]/page.tsx` to present a single, full-width primary “Commemoration Entry” editing experience, followed by full-width collapsible sections for related content. Improve clarity between main entry fields, images, obituaries, documents, quotes, and collaboration panels.

## Current State (summary)

- Two-column layout (main edit + right rail) with mixed cards and non-collapsible sections.
- Header image is separate from the “Photos & Images” uploader; counts do not include the primary/header image.
- Generated images are labeled “Memorial Images,” which conflicts with uploaded photos.
- Content is spread across multiple cards without a consistent collapse/expand pattern.

## Goals

1. Make the primary “Commemoration Entry” form full-width and always expanded (non-collapsible).
2. Move all other content into full-width, horizontally spanning collapsible sections stacked vertically.
3. Normalize media handling: include the primary/header image in the same Photos & Images section, support multiple uploads per entry, and allow choosing/changing which image is primary.
4. Clarify naming and grouping for secondary content:
   - Obituary Details (edit)
   - [NAME] Obituaries (#)
   - Photos and Images (#) — unified gallery with primary selection
   - Saved Quotes and Scripture (#)
   - Memorial Documents (#) — replaces “Memorial Images” to avoid collision with photos
   - Entry Feedback and Collaboration
   - Entry Info
5. Ensure counts (#) reflect the total items in each section.

## Non-Goals

- No changes to underlying data models unless required for primary image association (prefer reusing existing image schemas/actions).
- No net-new features for editing workflows beyond layout/grouping and primary image selection.
- No redesign of Dashboard shell/navigation.

## UX & Layout Plan

### Top of page (always expanded)

- **Commemoration Entry**: Full-width block containing:
  - Back link to Dashboard, role badge (view-only), and context as today.
  - EntryDisplay / EntryForm (editing toggle) spanning the full width.
  - Existing informational banners (view-only notice, admin badge) remain inline.

### Collapsible sections (stacked, full-width)

Use a consistent collapsible component (e.g., Accordion style, but fully expanded width with no side rail). Each section title bar shows the section name and count badge where applicable.

1. **Obituary Details (edit)** — wraps current `EntryDetailsCard` content; edit dialog stays available.
2. **[NAME] Obituaries (#)** — wraps `ObituaryList`; count = obituaries length.
3. **Photos and Images (#)** — unified gallery:
   - Include current primary/header image in the list.
   - Allow multiple uploads; counts include all images (header + uploads).
   - Provide “Set as Main” control to mark primary image (updates entry.image).
   - Reuse `EntryImageUpload` logic; extend to show the current header image inside the same gallery, and ensure uploads/primary selection update counts and state.
4. **Saved Quotes and Scripture (#)** — wraps `SavedQuotesList`; count = saved quotes length.
5. **Memorial Documents (#)** — replaces “Memorial Images”; show generated documents/media list (currently `generatedImages`). Rename UI copy to “Memorial Documents” to reduce confusion with photos. Counts reflect items.
6. **Entry Feedback and Collaboration** — wraps `EntryFeedbackPanel`; keep Suspense fallback.
7. **Entry Info** — metadata (created/updated, owner, last edited).

### Interaction & Behavior

- Only the primary Commemoration Entry is non-collapsible; all other sections are collapsible.
- Sections occupy full horizontal space (no side rail). Scrolling is vertical through the section stack.
- Counts update reactively after uploads/adds/deletes where data is available server-side; fall back to server-rendered counts on refresh.

## Data & Logic Changes

- **Primary image inclusion**: Ensure the header/primary image (`entry.image`) is part of the Photos & Images gallery. If absent from uploads, synthesize an item so counts and selection include it.
- **Primary selection**: Reuse `setPrimaryImageAction` to promote any gallery image (including previously uploaded ones) to primary; update UI to reflect active primary state.
- **Counts**: Wire counts to existing data sources:
  - Obituaries: `obituaries.length`
  - Photos & Images: primary/header + uploaded images (`entryImages`)
  - Saved Quotes: `getSavedQuotesByEntryId`
  - Memorial Documents: generated media list (`getUserGeneratedImages`), but labeled as documents
  - Feedback: no count required unless already available
- **Permissions**: Respect `canEdit`/role gating already in place; hide edit actions when view-only.

## Component/Implementation Plan

- `src/app/[entryId]/page.tsx`
  - Restructure layout to single-column stack: Commemoration Entry (always open) + collapsible sections.
  - Wrap secondary blocks in a shared collapsible section component (reuse Accordion/Disclosure; ensure full-width).
  - Pass counts into section headers.
  - Replace “Memorial Images” card with “Memorial Documents” using generated items list.
  - Route existing Suspense fallbacks appropriately.
- `EntryImageUpload` (and surrounding Photos card)
  - Include the header/primary image in the gallery data passed to the uploader.
  - Display current primary, allow switching primary, and keep counts accurate.
- Copy updates
  - Rename “Memorial Images” → “Memorial Documents” in this page context.
  - Section headings must match the list above verbatim.

## Acceptance Criteria

1. Page renders a single-column, full-width stack with the Commemoration Entry section always visible and non-collapsible.
2. All other sections render as full-width collapsible bars with counts where applicable.
3. Photos & Images section shows the header/primary image alongside other uploads; user (with edit rights) can set any image as primary; count matches total images (including header).
4. Section names match the specification (Obituary Details, [NAME] Obituaries, Photos and Images, Saved Quotes and Scripture, Memorial Documents, Entry Feedback and Collaboration, Entry Info).
5. “Memorial Documents” replaces the prior “Memorial Images” label; no conflicting copy remains on this page.
6. View-only users cannot access edit controls; edit-capable users can edit where previously allowed.
7. Layout has no side rail; vertical scrolling through sections works on mobile and desktop.

## Open Questions

- Should Memorial Documents support download/view links if assets are available? (If not, keep current summary tiles.)
- Should sections remember expanded/collapsed state per user/session? (Default to expanded or collapsed? Recommend default collapsed except primary form.)
- Any animation preference for expand/collapse (keep subtle for performance)?
