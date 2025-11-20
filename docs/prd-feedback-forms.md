# PRD: User Feedback & Feature Request Forms

## 1. Overview

Implementation of a user feedback system starting with a "Feature Request" form. This form allows users to submit suggestions for the platform, providing their contact info and role context.

## 2. Requirements

### 2.1. Visual Design

- **Style**: Consistent with existing application theme (Dark mode, Tailwind CSS, Shadcn UI).
- **Layout**: Vertical stack of fields with clear labels.
- **Components**:
  - `Textarea` for open-ended feedback.
  - `Input` for email.
  - `Checkbox` group for role selection.
  - `Button` for submission.

### 2.2. Fields Schema (Zod)

```typescript
const featureRequestSchema = z.object({
  request: z.string().min(10, "Please provide more detail about your request."),
  email: z.string().email("Please enter a valid email address."),
  roles: z
    .array(
      z.enum([
        "individual_myself",
        "individual_others",
        "funeral_home_owner",
        "funeral_home_manager",
        "funeral_home_employee",
      ])
    )
    .min(1, "Please select at least one role."),
});
```

### 2.3. Components Structure

- **Page**: `src/app/dashboard/feedback/page.tsx`
  - Server Component.
  - Renders the client-side form component.
- **Form Component**: `src/components/forms/feature-request-form.tsx`
  - Client Component (`"use client"`).
  - Uses standard form `action` or `onSubmit` handler.
  - Uses `zod` for client-side validation.
  - Uses `shadcn/ui` components:
    - `Form` (or standard labels + error text)
    - `Textarea`
    - `Input`
    - `Checkbox`
    - `Button`

### 2.4. Functional Requirements (Phase 2)

- Form submission triggers a Server Action.
- Server Action validates input using Zod.
- Submissions are sent via email using Resend to: `feedback@deathmattertools.com`
- No database storage required.
- On success:
  - Show success message.
  - Reset form.
- On error:
  - Show field-level validation errors.

## 3. Implementation Plan

### Phase 1: Cosmetic Implementation (✅ Completed)

1. ✅ Create `src/components/forms/feature-request-form.tsx`.
2. ✅ Implement layout and styling matching the provided mockup.
3. ✅ Integrate into `src/app/contact/page.tsx` (moved from dashboard).

### Phase 2: Functionality (Current Task)

1. Create email template for feature requests.
2. Define Server Action for handling submission via Resend.
3. Connect form to Server Action using `useActionState`.
4. Add client-side validation and error handling.
