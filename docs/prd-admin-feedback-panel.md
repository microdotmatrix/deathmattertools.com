# System Admin Feedback Panel PRD

## 1. Overview

The goal is to add a lightweight **System Admin Feedback Panel** to the app. This panel is only accessible to a small set of privileged users ("system admins"), managed via Clerk. It centralizes user feedback (contact, feature requests, surveys, etc.) into a single administrative interface.

The implementation will be done in phases: first the **cosmetic facade** (UI with mock data), then **data wiring and functionality**, and finally **access control and quality-of-life improvements**.

## 2. Goals

- **Centralize feedback** from all user-facing forms into one admin-facing view.
- **Restrict access** to system admins only (new user type in Clerk).
- Provide a **clean, minimal UI** for:
  - **Browsing** feedback.
  - **Filtering/searching** feedback by type, status, and text.
  - **Triaging** feedback by updating its status and internal notes.
- Allow feedback ingestion to **scale with new sources** (future forms and surveys) without major UI changes.

## 3. Non-Goals

- **User account / permission management** UI (this remains in Clerk).
- Rich workflow features such as assignments, SLAs, notifications rules, or full CRM capabilities.
- Public or end-user facing feedback browsing.

## 4. Roles & Access Control

### 4.1 Roles

- **System Admin**
  - Access to admin feedback routes (e.g. `/dashboard/feedback`).
  - Can view all feedback entries.
  - Can update feedback status and internal notes.
- **Other authenticated users**
  - No access to admin feedback UI.
  - Visiting an admin route should result in a redirect to `/dashboard` or a not-authorized experience.
- **Anonymous users**
  - No access; redirected to sign-in.

### 4.2 Enforcement (Conceptual)

- Introduce a helper like `requireSystemAdmin()` used in server components and route handlers.
- `requireSystemAdmin()`
  - Uses Clerk (role, public metadata, or custom claims) to determine whether the user is a system admin.
  - Redirects or throws (e.g. `notFound()` / 403 response) when the user is not a system admin.
- All admin feedback routes and APIs must call this helper early.

## 5. Data Model (Conceptual)

Feedback records represent any user-submitted feedback (contact message, feature request, bug, survey response summary, etc.).

**Entity: `Feedback`**

- **id**: unique identifier (UUID).
- **createdAt**: timestamp of feedback creation.
- **updatedAt**: timestamp of last update.
- **type**: category of feedback.
  - Examples: `"contact"`, `"feature_request"`, `"bug"`, `"other"`.
- **source**: string identifying origin of the feedback.
  - Examples: `"contact_page"`, `"feature_request_card"`, `"inline_survey"`.
- **userId**: optional foreign key to the user record or Clerk id.
- **entryId**: optional foreign key referencing a commemoration entry / obituary if relevant.
- **subject**: short summary or inferred title.
- **message**: full text body of the feedback.
- **status**: triage state.
  - Examples: `"new"`, `"in_review"`, `"resolved"`, `"dismissed"`.
- **priority**: optional priority tag.
  - Examples: `"low"`, `"medium"`, `"high"`.
- **metadata**: JSON blob for arbitrary context (e.g. URL, user agent, screenshot references).

The physical schema will be implemented with Drizzle + Postgres in a later phase.

## 6. User Flows

### 6.1 System Admin – View Feedback List

1. System admin navigates to `/dashboard/feedback`.
2. App validates the user as a system admin.
3. Page renders:
   - **Header**: `Feedback` title and a short description.
   - **Summary cards** (shadcn `Card` components) with counts:
     - New items (`status = new`).
     - Items by type (Contact, Feature Requests, etc.).
   - **Feedback table** using shadcn `Table`-style UI:
     - Columns: Type, Subject, Created At, Status, Source, Actions.
4. System admin can:
   - Search by subject/message text.
   - Filter by type and status.
   - Page through results.

### 6.2 System Admin – Inspect Feedback Item

Two possible UX patterns (one will be chosen for implementation):

- **Inline detail via dialog or sheet**
  - Clicking a row opens a shadcn `Dialog` or `Sheet`.
  - The dialog shows full message, metadata, and controls for status and notes.

- **Dedicated detail route**
  - Navigate to `/dashboard/feedback/[feedbackId]`.
  - Use a `Card` layout for the full feedback content and controls.

Available actions for system admins:

- Change status (select/dropdown or segmented control).
- Add internal notes.
- Optional: mark items as starred or requiring follow-up (future enhancement).

### 6.3 Feedback Ingestion From User-Facing Forms

When wired up (later phase), each feedback-capable form will:

1. Submit to a shared `feedback` server action or API endpoint.
2. That endpoint will:
   - Persist the feedback into the `Feedback` table with the appropriate `type`, `source`, and contextual metadata.
   - Optionally trigger email notifications to system admins.

Admin UI will strictly read from the canonical `Feedback` store and not from Resend/email logs directly.

## 7. Screens and Components

### 7.1 Screen: `/dashboard/feedback`

Base layout:

- Use existing `DashboardShell` and `DashboardHeader` for consistency with other dashboard pages.
- This route will serve as the main entry point for system admin feedback review.

Components (initial target):

- **`FeedbackSummaryCards`**
  - A row or grid of shadcn `Card` components showing key metrics.
- **`FeedbackTable`**
  - Table view using shadcn `Table` or a simple data table pattern.
  - Columns: Type, Subject, Created At, Status, Source, Actions.
- **`FeedbackFilters`** (optional in v1, but designed up front):
  - A small control strip with:
    - `Select` for type.
    - `Select` for status.
    - `Input` for search.
- **`FeedbackDetailDialog`** (or `FeedbackDetailSheet`):
  - Title and created date.
  - Type and source.
  - Full message content.
  - Status control.
  - Internal notes text area.

### 7.2 Future Screen: `/dashboard/feedback/[feedbackId]` (optional)

- Detailed page view for a single feedback record.
- Can reuse the same internals as `FeedbackDetailDialog` but in a full-page `Card` layout.

## 8. Implementation Phases

### Phase 1 – Cosmetic Facade (Mock Data)

**Goal:** Build the complete admin feedback UI using static/mock data only, no real persistence.

Scope:

- **Routes & layout**
  - Use `/dashboard/feedback` as the primary admin feedback page.
  - Optionally render a visible `TODO: restrict to system admins` message to indicate future access control.
- **Mock data**
  - Define an in-file or local module array of 5–10 feedback items.
- **Components**
  - Implement `FeedbackSummaryCards` with shadcn `Card` components.
  - Implement `FeedbackTable` using shadcn `Table` components without TanStack table complexity.
  - Implement `FeedbackDetailDialog` with static/mocked content wired to a selected row.

Deliverable: A visually complete admin feedback screen whose data is entirely mock but representative.

### Phase 2 – Real Data & Actions

**Goal:** Replace mock data with real persisted feedback and wire up admin actions.

Scope:

- Introduce a `feedback` table using Drizzle + Postgres following the conceptual model.
- Implement shared feedback server actions / API endpoints in `src/lib/api/feedback.ts` (or equivalent):
  - Create new feedback records from user-facing forms.
  - List feedback with pagination, filters, and search.
  - Update status and internal notes.
- Update `/dashboard/feedback` to query from the database (server component using Drizzle).
- Wire status and notes controls to server actions with reasonable UX (e.g. simple reload or light optimistic updates).

Deliverable: Admin feedback panel reading and writing real data, integrated with user-facing forms.

### Phase 3 – Access Control & Enhancements

**Goal:** Harden access control and add quality-of-life improvements.

Scope:

- Implement `requireSystemAdmin()` helper using Clerk, and enforce it on:
  - `/dashboard/feedback` route.
  - Any feedback-related server actions or API endpoints.
- Optional enhancements:
  - More advanced filters and search (e.g. by date range, entryId, userId).
  - Export or copy functions (e.g. copy feedback as text, CSV export).
  - Visual indicators for high-priority or unresolved feedback.

Deliverable: A secure, robust admin feedback experience suitable for ongoing use by a small set of system admins.
