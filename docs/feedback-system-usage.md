# Feedback System Usage Guide

## Overview

The feedback system allows users to submit feature requests, bug reports, contact messages, and other feedback types. System admins can manage and triage all feedback through the admin dashboard.

## Database Migration

**Migration already run** ✅ - The `system_feedback` table is now in your database.

## Admin Dashboard

### Access

Navigate to `/dashboard/feedback` to view the admin feedback panel.

**Note:** Access control for system admins is pending (Phase 3). Currently, any authenticated user can access this page.

### Features

- **Summary Cards**: View counts by status and type
- **Filtering**: Filter by type, status, and search feedback
- **Detail View**: Click any feedback item to view details and update status/notes
- **Status Management**: Change feedback status (new → in_review → resolved/dismissed)
- **Internal Notes**: Add admin-only notes to feedback items

## User-Facing Forms

### 1. Reusable Form Component

Use `FeedbackForm` directly for custom implementations:

```tsx
import { FeedbackForm } from "@/components/forms/feedback-form";

<FeedbackForm
  type="feature_request" // or "bug", "contact", "other"
  source="my_custom_source"
  entryId={entryId} // optional, links to specific entry
  onSuccess={() => {
    /* callback after submission */
  }}
  showSubject={true}
  subjectPlaceholder="What's your idea?"
  messagePlaceholder="Tell us more..."
  submitButtonText="Send"
/>;
```

### 2. Pre-built Dialog Components

#### Feature Request Dialog

```tsx
import { FeatureRequestDialog } from "@/components/dialogs/feature-request-dialog";
import { useState } from "react";

const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>
  Request Feature
</Button>

<FeatureRequestDialog
  open={open}
  onOpenChange={setOpen}
  entryId={currentEntry?.id} // optional
/>
```

#### Bug Report Dialog

```tsx
import { BugReportDialog } from "@/components/dialogs/bug-report-dialog";
import { useState } from "react";

const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>
  Report Bug
</Button>

<BugReportDialog
  open={open}
  onOpenChange={setOpen}
  entryId={currentEntry?.id} // optional
/>
```

## Server Actions

The feedback system exports server actions that can be called directly:

```tsx
import { submitFeedbackAction } from "@/actions/system-feedback-actions";

const result = await submitFeedbackAction({
  type: "feature_request",
  source: "my_app_section",
  userId: user.id, // optional
  entryId: entry.id, // optional
  subject: "Add dark mode",
  message: "Would love a dark mode option",
  metadata: { url: "/dashboard", userAgent: navigator.userAgent },
});

if (result.success) {
  console.log("Feedback submitted:", result.feedbackId);
}
```

## Integration Examples

### Add to Navigation Menu

```tsx
<DropdownMenuItem onSelect={() => setFeatureDialogOpen(true)}>
  <Icon icon="mdi:lightbulb-outline" className="mr-2 h-4 w-4" />
  Request Feature
</DropdownMenuItem>
```

### Add to Entry Page

```tsx
// On an entry detail page
<BugReportDialog
  open={bugDialogOpen}
  onOpenChange={setBugDialogOpen}
  entryId={entry.id} // Links bug to specific entry
/>
```

### Add to Contact Page

```tsx
<FeedbackForm
  type="contact"
  source="contact_page"
  showSubject={true}
  subjectPlaceholder="How can we help?"
  messagePlaceholder="Your message..."
  submitButtonText="Send Message"
/>
```

## Feedback Types

- **`contact`**: General contact messages (source: `contact_page`)
- **`feature_request`**: Feature suggestions (source: `feature_request_card`)
- **`bug`**: Bug reports (source: `inline_survey`)
- **`other`**: Other feedback types

## Metadata

Each feedback entry can store arbitrary metadata as JSON:

- URL where feedback was submitted
- User agent/browser info
- Email address (for non-authenticated users)
- Screenshots references
- Survey responses
- Any other contextual data

## Next Steps (Phase 3)

1. **Access Control**: Implement `requireSystemAdmin()` helper using Clerk
2. **Email Notifications**: Notify admins of new high-priority feedback
3. **Search Enhancement**: Add full-text search on subject and message
4. **Export**: Add CSV export for feedback data

## Database Schema

Table: `system_feedback`

Key fields:

- `type`: feedback category
- `source`: origination point
- `status`: triage state (new, in_review, resolved, dismissed)
- `priority`: optional priority tag (low, medium, high)
- `userId`: optional link to user
- `entryId`: optional link to entry
- `subject`: short summary
- `message`: full text content
- `metadata`: JSON for arbitrary context
- `internalNotes`: admin-only notes

Indexes on: `type`, `status`, `userId`, `createdAt`
