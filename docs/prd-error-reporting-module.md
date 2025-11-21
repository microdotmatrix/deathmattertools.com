# PRD: Error Reporting Module

**Version:** 1.0  
**Status:** Draft  
**Last Updated:** November 20, 2024  
**Author:** System  
**Related PRDs:** [Admin Feedback Panel](./prd-admin-feedback-panel.md)

---

## 1. Overview

### 1.1 Executive Summary

The Error Reporting Module provides users with an immediate, accessible way to report errors and issues they encounter while using the platform. Integrated directly into the global navigation bar, this lightweight popover-based form allows users to quickly describe what went wrong, where it happened, and what they were trying to do—creating a direct feedback loop that helps improve platform stability and user experience.

### 1.2 Problem Statement

Currently, when users encounter errors:

- There's no standardized way to report issues
- Context about the error is lost (what page, what action, etc.)
- Users may abandon tasks without reporting problems
- Support team lacks structured error reports from real usage

### 1.3 Goals & Objectives

- **Primary Goal:** Enable users to report errors in under 30 seconds
- **Secondary Goals:**
  - Capture structured error context automatically
  - Reduce friction in the error reporting process
  - Feed error data into the existing feedback management system
  - Improve platform reliability through better error visibility

### 1.4 Success Metrics

- Time to complete error report: < 30 seconds (target)
- Error report submission rate: > 10% of users who encounter errors
- Error reports per week: Baseline → Target (TBD after initial data)
- Admin triage time: < 2 minutes per error report

---

## 2. User Stories

### 2.1 Primary User Stories

**As a platform user**, I want to:

- Report an error I encountered without leaving my current page
- Quickly describe what went wrong in my own words
- Have the system capture relevant context automatically
- Know my report was successfully submitted

**As a system administrator**, I want to:

- Receive structured error reports with context
- Identify which modules/features have the most issues
- Prioritize fixes based on error frequency and impact
- Track error resolution over time

### 2.2 Edge Cases

- User encounters error while offline (report queued, submitted when online)
- User submits duplicate reports for same issue
- User reports error in production vs. development environment
- Anonymous users reporting errors

---

## 3. Feature Requirements

### 3.1 Must-Have (Phase 1)

#### 3.1.1 Global Navigation Integration

- **Icon Button:** Warning/alert icon in the top-right navigation bar
- **Visual Indicator:** Subtle, non-intrusive styling (outline or ghost variant)
- **Position:** Near user menu/profile icon (right side of navbar)
- **Responsive:** Works on mobile, tablet, and desktop

#### 3.1.2 Popover Form

- **Trigger:** Click icon button to open popover
- **Form Fields:**
  - **Module/Location** (text input, required)
    - Placeholder: "e.g., Dashboard, Entry Editor, etc."
    - Auto-populated with current route/page if possible
  - **What happened?** (textarea, required)
    - Placeholder: "Describe the error or unexpected behavior..."
    - Min height: 100px
  - **What were you trying to do?** (textarea, required)
    - Placeholder: "What action were you performing when this occurred?"
    - Min height: 60px
  - **Email** (input, optional for authenticated users)
    - Pre-filled if user is authenticated
    - Optional text: "We'll use this to follow up if needed"

#### 3.1.3 Automatic Context Capture

System automatically captures and includes in `metadata`:

- Current URL/route
- Timestamp
- User agent/browser info
- User ID (if authenticated)
- Platform (web, mobile PWA)
- Viewport size
- Previous page (referrer)

#### 3.1.4 Submission & Feedback

- **Submit Button:** "Report Error"
- **Loading State:** Disable form, show "Submitting..." text
- **Success:** Toast notification "Error report submitted. Thank you!"
- **Error:** Toast notification "Failed to submit. Please try again."
- **Post-Submission:** Close popover, reset form

### 3.2 Nice-to-Have (Phase 2)

- **Screenshot Capture:** Allow user to attach a screenshot
- **Browser Console Logs:** Optionally capture recent console errors
- **Severity Selection:** User can indicate if issue is blocking/critical
- **Similar Issues:** Show similar error reports before submitting
- **Offline Support:** Queue reports when offline, submit when online

### 3.3 Future Enhancements (Phase 3)

- **AI-Powered Categorization:** Auto-tag error type based on description
- **Error Patterns:** Detect recurring errors and group them
- **Real-time Error Monitoring:** Integration with Sentry/error tracking
- **In-app Error Reproduction:** Record user session leading to error

---

## 4. Technical Architecture

### 4.1 Component Structure

```
src/components/
├── layout/
│   └── global-navbar.tsx (existing, updated)
└── error-reporting/
    ├── error-report-popover.tsx (new)
    └── error-report-form.tsx (new)
```

### 4.2 Data Flow

1. **User Interaction:**
   - User clicks error icon in navbar
   - Popover opens with form

2. **Form Submission:**
   - User fills form fields
   - Client captures automatic context
   - Calls `submitFeedbackAction` with type: "bug" or new type: "error"

3. **Server Processing:**
   - Server action validates data
   - Inserts into `system_feedback` table
   - Returns success/error response

4. **Admin Review:**
   - Error appears in `/dashboard/feedback`
   - Admin can filter by type: "error"
   - Admin can triage, update status, add notes

### 4.3 Database Schema (Existing)

Uses existing `system_feedback` table:

```typescript
{
  type: "bug" | "error", // Use "bug" or add new "error" type
  source: "error_reporter",
  userId: string | null,
  entryId: null, // Not typically linked to specific entry
  subject: "Error: [Module/Location]",
  message: "[What happened] + [What user was trying to do]",
  metadata: {
    url: string,
    timestamp: string,
    userAgent: string,
    viewport: { width: number, height: number },
    referrer: string,
    module: string, // User-specified location
  },
  status: "new",
  priority: null,
}
```

### 4.4 Integration Points

- **Feedback System:** Reuses `submitFeedbackAction` server action
- **Admin Dashboard:** Errors visible in `/dashboard/feedback`
- **Global Navbar:** Inject error icon component
- **Toast Notifications:** Use existing `sonner` for user feedback

---

## 5. UI/UX Specifications

### 5.1 Icon Button (Navbar)

**Visual Design:**

- Icon: Alert/warning icon (e.g., `mdi:alert-circle-outline` or `mdi:bug-outline`)
- Variant: Ghost or outline
- Size: Same as other navbar icons
- Color: Muted (not alarming, but noticeable)
- Hover state: Slight color change, tooltip "Report an Error"

**Behavior:**

- Click toggles popover open/closed
- Keyboard accessible (Tab, Enter to activate)
- Screen reader label: "Report an error or issue"

### 5.2 Popover Layout

**Dimensions:**

- Width: 400px (desktop), 90vw (mobile, max 400px)
- Max height: 80vh (scrollable if needed)
- Positioning: Aligned to bottom-right of icon, offset 8px

**Structure:**

```
┌─────────────────────────────────────┐
│ Report an Error               [X]   │
├─────────────────────────────────────┤
│                                     │
│ [Input: Module/Location]            │
│                                     │
│ [Textarea: What happened?]          │
│                                     │
│ [Textarea: What were you doing?]    │
│                                     │
│ [Input: Email (optional)]           │
│                                     │
│           [Report Error] ───────►   │
│                                     │
└─────────────────────────────────────┘
```

**Styling:**

- Background: Card background (with border)
- Padding: 24px
- Border radius: 8px
- Shadow: Medium elevation
- Gap between fields: 16px

### 5.3 Form Fields

#### Module/Location

```tsx
<Input
  id="module"
  placeholder="e.g., Dashboard, Entry Editor, Settings"
  required
  defaultValue={currentRoute} // Auto-populate
/>
```

#### What happened?

```tsx
<Textarea
  id="description"
  placeholder="Describe the error or unexpected behavior..."
  required
  minHeight="100px"
  maxLength={1000}
/>
```

#### What were you trying to do?

```tsx
<Textarea
  id="action"
  placeholder="What action were you performing?"
  required
  minHeight="60px"
  maxLength={500}
/>
```

#### Email (if not authenticated)

```tsx
<Input
  id="email"
  type="email"
  placeholder="your@email.com"
  defaultValue={user?.email}
/>
<Text variant="muted" size="sm">
  We'll use this to follow up if needed
</Text>
```

### 5.4 Accessibility

- **Keyboard Navigation:** Full support (Tab, Shift+Tab, Escape to close)
- **ARIA Labels:** All form fields properly labeled
- **Focus Management:** Auto-focus first field on open
- **Screen Reader:** Announce popover open/close states
- **Error States:** Clear error messages for required fields

### 5.5 Responsive Design

**Desktop (≥ 768px):**

- Fixed width: 400px
- Positioned relative to icon

**Mobile (< 768px):**

- Full width with margin: 90vw
- Centered positioning
- Adjusted padding: 16px

---

## 6. Implementation Plan

### Phase 1: Core Functionality (Week 1)

**Tasks:**

1. Create `error-report-form.tsx` component
   - Form fields with validation
   - Auto-capture context metadata
   - Submit via `submitFeedbackAction`

2. Create `error-report-popover.tsx` component
   - Radix UI Popover wrapper
   - Integrate form component
   - Loading and success states

3. Update global navbar component
   - Add error report icon button
   - Integrate popover component
   - Position and styling

4. Testing
   - Unit tests for form validation
   - Integration tests for submission
   - Manual testing across devices

### Phase 2: Enhancements (Week 2)

- Screenshot capture
- Similar issue detection
- Admin dashboard filtering improvements

### Phase 3: Advanced Features (Future)

- AI categorization
- Error pattern detection
- Sentry integration

---

## 7. Testing & Quality Assurance

### 7.1 Test Cases

**Functional Tests:**

- [ ] Popover opens when icon clicked
- [ ] Popover closes when clicking outside
- [ ] Popover closes when Escape pressed
- [ ] Form validation: required fields
- [ ] Form validation: email format
- [ ] Successful submission: data persisted
- [ ] Successful submission: toast shown
- [ ] Failed submission: error toast shown
- [ ] Auto-populated fields work correctly

**Accessibility Tests:**

- [ ] Keyboard navigation works
- [ ] Screen reader announces states
- [ ] Focus management correct
- [ ] Color contrast meets WCAG AA
- [ ] Touch targets ≥ 44x44px

**Responsive Tests:**

- [ ] Works on mobile (< 768px)
- [ ] Works on tablet (768-1024px)
- [ ] Works on desktop (> 1024px)
- [ ] Popover positioning adjusts

**Edge Cases:**

- [ ] Offline submission (queued)
- [ ] Rapid submit clicks (prevented)
- [ ] Very long text (truncated/scrollable)
- [ ] Special characters in input

### 7.2 Performance Targets

- Time to open popover: < 100ms
- Form submission: < 500ms
- No layout shift when popover opens

---

## 8. Documentation Requirements

### 8.1 User Documentation

- Help article: "How to Report an Error"
- FAQ: "What happens after I report an error?"
- Video walkthrough (optional)

### 8.2 Developer Documentation

- Component API documentation
- Integration guide for navbar
- Extension guide for custom error types

### 8.3 Admin Documentation

- Guide: "Triaging Error Reports"
- Guide: "Error Report Metrics & Analytics"

---

## 9. Risks & Mitigation

| Risk               | Impact | Likelihood | Mitigation                               |
| ------------------ | ------ | ---------- | ---------------------------------------- |
| User spam/abuse    | Medium | Low        | Rate limiting, Clerk auth required       |
| Performance impact | Medium | Low        | Lazy load popover component              |
| Low adoption       | High   | Medium     | Prominent placement, user education      |
| Privacy concerns   | High   | Low        | Clear data policy, optional email        |
| Form abandonment   | Medium | Medium     | Minimal required fields, auto-save draft |

---

## 10. Open Questions

1. Should we differentiate between "bug" and "error" types, or use "bug" for both?
2. Should screenshot capture be Phase 1 or Phase 2?
3. Do we want to show a "Recent errors" count badge on the icon?
4. Should we limit error reports to authenticated users only?
5. What's the ideal balance between capturing context and respecting privacy?

---

## 11. Appendix

### 11.1 Related Resources

- [Admin Feedback Panel PRD](./prd-admin-feedback-panel.md)
- [Feedback System Usage Guide](./feedback-system-usage.md)
- [Radix UI Popover Documentation](https://www.radix-ui.com/primitives/docs/components/popover)

### 11.2 Design References

- Error reporting in GitHub Issues
- Bug report flows in Jira
- Chrome browser's "Report an Issue" feature
- Notion's feedback widget

### 11.3 Competitive Analysis

**GitHub:**

- Pros: Simple, integrated with issues
- Cons: Requires navigation away from context

**Sentry User Feedback:**

- Pros: Captures technical context automatically
- Cons: Requires external service, more setup

**Intercom:**

- Pros: Real-time chat support
- Cons: Heavyweight, expensive

**Our Approach:**

- Lightweight popover (no page change)
- Integrated with existing feedback system
- Focus on user-reported issues (not automated)
- Privacy-conscious (minimal auto-capture)

---

## 12. Approval & Sign-off

_This section will be completed after stakeholder review._

**Stakeholders:**

- [ ] Product Lead
- [ ] Engineering Lead
- [ ] Design Lead
- [ ] Support/Success Team

**Approved by:** ******\_******  
**Date:** ******\_******
