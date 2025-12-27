# PRD: Targeted Entry Feedback (Component Context)

**Version:** 0.1  
**Created:** 2025-12-26  
**Status:** Draft (for review)  
**Priority:** Medium  

---

## Executive Summary

Enhance the existing entry feedback system so feedback can be explicitly associated with a specific entry component (e.g., “Birth Date”, “Occupation”, “Photos & Images”). Add a `+` (plus) control next to the feedback textarea that opens a searchable menu of entry components. Persist the selected target alongside feedback, and display it prominently to the entry owner during approve/deny workflows.

---

## Problem Statement

### Current State (as implemented)

The entry feedback system is already live and includes:

- **DB:** `EntryFeedbackTable` (`src/lib/db/schema/entry-feedback.ts`)
  - Fields: `content`, `status` (`pending|approved|denied|resolved`), status change metadata, created/updated timestamps.
- **Server actions:** (`src/actions/entry-feedback.ts`)
  - `createFeedbackAction(entryId, formData)`
  - `updateFeedbackAction(feedbackId, formData)` (author-only, pending-only)
  - `deleteFeedbackAction(feedbackId)` (author-only, pending-only)
  - `updateFeedbackStatusAction(feedbackId, status)` (entry owner/admin-only)
- **UI:** (`src/components/sections/entry-feedback/*`)
  - `EntryFeedbackPanel` renders the “Add Feedback” form plus status-grouped feedback lists.
  - `FeedbackForm` is a single textarea + submit button (create/edit).
  - `FeedbackCard` displays author, time, status badge, and content. No contextual metadata beyond status.
- **Access control:** org members can view and submit feedback on team entries; only the entry owner/org admin can manage status.

### Pain Points

- Feedback is **unstructured**: it’s unclear which part of the entry the feedback refers to without reading/guessing.
- The entry owner’s review workflow (approve/deny/resolve) lacks **context cues**, making it slower to triage and more error-prone.
- For entries with extensive “Obituary Details”, the feedback list becomes a “wall of text” with no quick way to identify relevance.

### Opportunity

Introduce lightweight “targeting” to make feedback immediately scannable and actionable by explicitly linking each feedback item to an entry component.

---

## Goals

1. Let feedback authors select an **optional target component** for each feedback item.
2. Persist that target and display it in the feedback UI so the entry owner can quickly understand context while moderating.
3. Keep the experience **fast and low-friction**: targeting should be optional and not block submission.
4. Keep the feature **entry-feedback-only** (do not merge with obituary anchored comments).

---

## Non-Goals (for this iteration)

- Auto-detecting targets from text.
- Deep linking / scrolling the entry UI to the targeted component when clicking the target badge.
- Multi-target feedback (one feedback item pointing to multiple components).
- Per-array-item targeting (e.g., “Survived By → John Smith” or “Photo #3”).
- Replacing the obituary text-anchored comment system.

---

## Users & Use Cases

### Organization Member (feedback author)

- Selects a target (optional) like “Birth Location” before submitting feedback.
- Edits pending feedback, including updating/clearing the target.

### Entry Owner / Org Admin (feedback manager)

- Sees each feedback item labeled with its target (or “General” if none).
- Approves/denies/resolves faster because the feedback’s subject is explicit.

---

## UX / Interaction Design

### Add/Edit Feedback Form (MVP)

Update `src/components/sections/entry-feedback/feedback-form.tsx`:

- Add a small **`+` icon button** adjacent to the textarea.
- Clicking the button opens a **popover menu** with a searchable, grouped list of entry components.
  - Recommended implementation: `Popover` + `Command` list (`src/components/ui/popover.tsx`, `src/components/ui/command.tsx`)
- When a component is selected:
  - Show a compact “Target: …” pill/badge near the textarea.
  - Include a clear (“x”) affordance to remove the target.
- Store the selected target in a hidden input (e.g., `name="targetKey"`) so server actions can persist it.
- Default state is **no target** (treated as “General”).

### Feedback List (MVP)

Update `src/components/sections/entry-feedback/feedback-card.tsx`:

- Display the target (if present) as a small badge near the status badge, e.g.:
  - `Target: Birth Date`
  - If missing: `Target: General` (or omit entirely; see “Open Questions”)

### Target Catalog

Create a single source of truth for target keys/labels:

- `src/lib/entry-feedback/targets.ts` (proposed)
  - Exports the list of targets used by the UI menu.
  - Exports helper(s) for label lookup and server-side validation.

This avoids hardcoding strings in multiple places and prevents UI/server drift.

---

## Data Model / Persistence

### Database

Add nullable fields to `entry_feedback`:

- `target_key` (text, nullable)
  - Example values: `entry.name`, `entry.dateOfBirth`, `entryDetails.occupation`, `images.gallery`, `general`

Optional (future-proofing but not required for MVP):

- `target_version` (integer) to handle future taxonomy changes

### Drizzle Schema

Update `src/lib/db/schema/entry-feedback.ts` to include `targetKey` and extend `EntryFeedbackWithUser` types.

### Migration

Add a Drizzle migration (SQL) to introduce `target_key` nullable column and index (optional):

- Index suggestion: `(entry_id, target_key)` if we expect future filtering/grouping by target.

---

## Server Actions / Validation

Update `src/actions/entry-feedback.ts`:

- Extend `CreateFeedbackSchema` / `UpdateFeedbackSchema` to accept optional `targetKey`.
- Validate that `targetKey` is either:
  - `null`/empty (meaning “General”), OR
  - A member of the known target catalog from `src/lib/entry-feedback/targets.ts`.

Update `src/lib/db/mutations/entry-feedback.ts` to persist `targetKey` on create/update (pending-only edits already enforced).

Update queries (`src/lib/db/queries/entry-feedback.ts`) to return `targetKey` with feedback records (automatic once schema is updated).

---

## Target Taxonomy (Initial Proposal)

The goal is to match what users actually see on the entry page (`src/app/[entryId]/page.tsx`), and the related sections:

- **General**
  - `general` → “General”
- **Entry (basic details)**
  - `entry.name` → “Full Name”
  - `entry.locationBorn` → “Birth Location”
  - `entry.locationDied` → “Death Location”
  - `entry.dateOfBirth` → “Birth Date”
  - `entry.dateOfDeath` → “Death Date”
  - `entry.causeOfDeath` → “Cause of Death”
  - `entry.image` → “Primary Photo”
- **Obituary Details (entry_details)**
  - `entryDetails.occupation` → “Occupation”
  - `entryDetails.jobTitle` → “Job Title”
  - `entryDetails.companyName` → “Company Name”
  - `entryDetails.yearsWorked` → “Years Worked”
  - `entryDetails.education` → “Education (legacy)”
  - `entryDetails.educationDetails` → “Education (structured)”
  - `entryDetails.accomplishments` → “Accomplishments”
  - `entryDetails.biographicalSummary` → “Biographical Summary”
  - `entryDetails.hobbies` → “Hobbies”
  - `entryDetails.personalInterests` → “Personal Interests”
  - `entryDetails.militaryService` → “Military Service”
  - `entryDetails.religious` → “Religion”
  - `entryDetails.familyDetails` → “Family Details”
  - `entryDetails.survivedBy` → “Survived By”
  - `entryDetails.precededBy` → “Preceded By”
  - `entryDetails.serviceDetails` → “Service Details”
  - `entryDetails.donationRequests` → “Donation Requests”
  - `entryDetails.specialAcknowledgments` → “Special Acknowledgments”
  - `entryDetails.additionalNotes` → “Additional Notes”
- **Media**
  - `images.gallery` → “Photos & Images”

Notes:
- Some `EntryDetailsTable` fields exist in schema but are not currently exposed in UI; this taxonomy intentionally focuses on **visible/editable** components first.
- This list can be iterated on once you confirm the desired granularity.

---

## Acceptance Criteria (MVP)

1. Feedback author can optionally select a target from a menu opened by a plus icon next to the textarea.
2. Submitting feedback persists both `content` and `targetKey` (or null).
3. Editing pending feedback allows updating/clearing the target.
4. Feedback manager sees the target displayed on each feedback item in the list during moderation.
5. Existing feedback (without targets) continues to render correctly (treated as “General”).

---

## Edge Cases

- **Taxonomy drift:** a stored `targetKey` no longer exists in the catalog → UI should display “Unknown target” + the raw key (or fall back to “General”).
- **Empty/whitespace target:** treat as null.
- **Server-side validation:** reject unknown `targetKey` values to keep data clean.
- **Permissions:** no change to who can view/submit/manage feedback.

---

## Analytics / Telemetry (Optional)

If you track product usage:

- % of feedback created with a non-null target
- Top target keys used
- Moderator time-to-first-action on pending feedback (pre/post)

---

## Implementation Plan (Proposed)

### Phase 0 — Confirm Taxonomy & UX (this PRD)

- Decide the initial target list granularity (field-level vs section-level).
- Confirm whether “Target: General” should be shown explicitly or only when set.

### Phase 1 — Data Model & Server Plumbing

- Add DB column `target_key` (nullable) + optional index.
- Update `src/lib/db/schema/entry-feedback.ts`
- Update `src/lib/db/mutations/entry-feedback.ts` to read/write `targetKey`
- Update `src/actions/entry-feedback.ts` zod schemas + formData parsing + validation
- Add shared catalog module `src/lib/entry-feedback/targets.ts`

### Phase 2 — UI: Target Selector Control

- Update `src/components/sections/entry-feedback/feedback-form.tsx`
  - Add plus button + popover/command menu
  - Add selected target badge + clear action
  - Add hidden `targetKey` input

### Phase 3 — UI: Display Target in Feedback List

- Update `src/components/sections/entry-feedback/feedback-card.tsx` to render target badge
- (Optional) Update `src/components/sections/entry-feedback/feedback-status-section.tsx` to add future grouping/filter hooks

### Phase 4 — QA / Regression Checks

- Verify create/edit/delete flows still work for pending feedback.
- Verify moderation flows still work (approve/deny/resolve).
- Verify the entry page (`src/app/[entryId]/page.tsx`) renders without hydration issues.

---

## Open Questions

1. Should the target be **required** for org members (to force specificity), or optional (recommended)?
2. Should the menu show **field-level targets** (detailed list) or **section-level** targets (short list) for MVP?
3. Should “General” be a selectable option in the menu, or only the “cleared” state?
4. Do you want the target badge to appear in the collapsed section headers (e.g., “Pending Review”), or only per item?

