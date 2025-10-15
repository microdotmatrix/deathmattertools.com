# Entry Feedback System - Testing Guide

**Version:** 1.0  
**Date:** 2025-01-15  
**Status:** Ready for Testing

---

## 🧪 Manual Testing Checklist

### Prerequisites
- [ ] Database migration applied
- [ ] Application running locally or on staging
- [ ] At least 2 users in the same organization
- [ ] At least 1 user outside the organization
- [ ] At least 1 entry created

---

## 📋 Test Scenarios

### Scenario 1: Organization Member Creates Feedback ✅

**Setup:**
- User: Org Member (not entry creator)
- Entry: Owned by another org member

**Steps:**
1. [ ] Sign in as org member (User B)
2. [ ] Navigate to entry created by User A
3. [ ] Scroll to "Entry Feedback & Collaboration" section
4. [ ] Verify info alert shows: "Use this section to suggest corrections..."
5. [ ] Type feedback: "Birth date should be March 15, 1985"
6. [ ] Verify character counter updates (0/2000)
7. [ ] Click "Submit Feedback"
8. [ ] Verify toast notification: "Feedback submitted"
9. [ ] Verify feedback appears in "Pending Review (1)" section
10. [ ] Verify section is expanded by default
11. [ ] Verify feedback shows user avatar and name
12. [ ] Verify feedback shows "Pending Review" badge (amber)
13. [ ] Verify relative timestamp shows (e.g., "2 minutes ago")

**Expected Results:**
- ✅ Form clears after submission
- ✅ Feedback appears immediately (no refresh needed)
- ✅ Count badge updates to (1)
- ✅ Only "Pending Review" section visible initially
- ✅ No edit/delete buttons visible (not author yet)

**Pass Criteria:** All steps complete without errors, feedback visible immediately.

---

### Scenario 2: Entry Creator Approves Feedback ✅

**Setup:**
- User: Entry Creator (User A)
- Existing: 1 pending feedback from User B

**Steps:**
1. [ ] Sign in as entry creator (User A)
2. [ ] Navigate to own entry
3. [ ] Verify info alert shows: "Organization members can provide feedback..."
4. [ ] Verify "Pending Review (1)" section visible
5. [ ] Expand pending section if collapsed
6. [ ] Verify feedback from User B visible
7. [ ] Verify [Approve] and [Deny] buttons visible
8. [ ] Click "Approve" button
9. [ ] Verify toast notification: "Feedback approved"
10. [ ] Verify feedback moves to "Approved (1)" section
11. [ ] Verify "Pending Review" section shows (0) or hides
12. [ ] Verify [Mark as Resolved] button now visible
13. [ ] Verify status badge changed to green "Approved"

**Expected Results:**
- ✅ Feedback state changes without page refresh
- ✅ Section counts update correctly
- ✅ Audit trail captured (statusChangedAt, statusChangedBy)
- ✅ Only creator sees management buttons

**Pass Criteria:** Feedback successfully moves to approved state with proper UI updates.

---

### Scenario 3: Author Edits Own Pending Feedback ✅

**Setup:**
- User: Org Member (User B, feedback author)
- Existing: 1 pending feedback by User B

**Steps:**
1. [ ] Sign in as feedback author (User B)
2. [ ] Navigate to entry
3. [ ] Find own pending feedback
4. [ ] Verify [Edit] and [Delete] buttons visible
5. [ ] Click "Edit" button
6. [ ] Verify inline form appears with existing content
7. [ ] Modify content: "Birth date should be March 15, 1985 (corrected)"
8. [ ] Verify character counter updates
9. [ ] Click "Update" button
10. [ ] Verify toast notification: "Feedback updated"
11. [ ] Verify form closes and displays updated content
12. [ ] Verify feedback still in "Pending" state
13. [ ] Verify updatedAt timestamp changed

**Edge Cases to Test:**
- [ ] Click "Cancel" - form closes without saving
- [ ] Clear all text - submit button disabled
- [ ] Exceed 2000 characters - submit button disabled
- [ ] Network error - error toast shown

**Expected Results:**
- ✅ Content updates immediately
- ✅ Form returns to view mode
- ✅ No status change (remains pending)
- ✅ Only author can edit

**Pass Criteria:** Edit functionality works smoothly with proper validation.

---

### Scenario 4: Author Deletes Own Pending Feedback ✅

**Setup:**
- User: Org Member (User B, feedback author)
- Existing: 1 pending feedback by User B

**Steps:**
1. [ ] Sign in as feedback author (User B)
2. [ ] Navigate to entry
3. [ ] Find own pending feedback
4. [ ] Click "Delete" button
5. [ ] Verify confirmation dialog appears
6. [ ] Verify dialog shows: "This action cannot be undone..."
7. [ ] Click "Cancel" - dialog closes, feedback remains
8. [ ] Click "Delete" again
9. [ ] Click "Delete" in confirmation dialog
10. [ ] Verify toast notification: "Feedback deleted"
11. [ ] Verify feedback removed from list
12. [ ] Verify section count decrements or section hides

**Expected Results:**
- ✅ Confirmation required before deletion
- ✅ Feedback permanently removed
- ✅ UI updates immediately
- ✅ No way to undo

**Pass Criteria:** Delete requires confirmation and works correctly.

---

### Scenario 5: Creator Marks Approved Feedback as Resolved ✅

**Setup:**
- User: Entry Creator (User A)
- Existing: 1 approved feedback

**Steps:**
1. [ ] Sign in as entry creator (User A)
2. [ ] Navigate to entry
3. [ ] Expand "Approved (1)" section
4. [ ] Verify feedback shows green "Approved" badge
5. [ ] Verify [Mark as Resolved] button visible
6. [ ] Make actual correction to entry (optional)
7. [ ] Click "Mark as Resolved" button
8. [ ] Verify toast notification: "Feedback marked as resolved"
9. [ ] Verify feedback moves to "Resolved (1)" section
10. [ ] Verify status badge changed to gray "Resolved"
11. [ ] Verify no action buttons visible
12. [ ] Verify timestamp shows "Updated X ago"

**Expected Results:**
- ✅ Feedback enters final state
- ✅ Read-only (no further actions)
- ✅ Audit trail preserved
- ✅ Clear visual indication of resolved status

**Pass Criteria:** Resolution workflow completes successfully.

---

### Scenario 6: Creator Denies Invalid Feedback ✅

**Setup:**
- User: Entry Creator (User A)
- Existing: 1 pending feedback (invalid suggestion)

**Steps:**
1. [ ] Sign in as entry creator (User A)
2. [ ] Navigate to entry
3. [ ] Expand "Pending Review" section
4. [ ] Click "Deny" button
5. [ ] Verify toast notification: "Feedback denied"
6. [ ] Verify feedback moves to "Denied (1)" section
7. [ ] Verify status badge changed to red "Denied"
8. [ ] Expand "Denied" section
9. [ ] Verify feedback is read-only
10. [ ] Verify no action buttons visible

**Expected Results:**
- ✅ Feedback enters final state
- ✅ Marked as denied for record
- ✅ No further actions possible
- ✅ Preserved in history

**Pass Criteria:** Deny workflow works and feedback is archived.

---

### Scenario 7: Access Control - Non-Org User ✅

**Setup:**
- User: User C (different organization)
- Entry: Owned by User A (different org)

**Steps:**
1. [ ] Sign in as User C (different org)
2. [ ] Try to access entry URL directly
3. [ ] Verify 404 page displayed
4. [ ] Verify no entry content visible
5. [ ] Verify no feedback panel visible
6. [ ] Try to access feedback directly via URL manipulation
7. [ ] Verify still blocked (404)

**Expected Results:**
- ✅ Complete access denial
- ✅ No data leakage
- ✅ Proper 404 response
- ✅ No workarounds possible

**Pass Criteria:** Non-org users completely blocked from access.

---

### Scenario 8: Access Control - Org Member View Only ✅

**Setup:**
- User: Org Member (User B)
- Entry: Team entry (User A's entry)

**Steps:**
1. [ ] Sign in as org member (User B)
2. [ ] Navigate to team entry
3. [ ] Verify "Team Entry (View Only)" badge visible
4. [ ] Scroll to feedback section
5. [ ] Verify can see "Add Feedback" form
6. [ ] Verify can see all feedback (any status)
7. [ ] Verify cannot see [Approve]/[Deny]/[Resolve] buttons
8. [ ] Verify can only edit/delete own pending feedback
9. [ ] Verify cannot edit others' feedback
10. [ ] Add new feedback successfully
11. [ ] Verify can edit own pending feedback
12. [ ] Verify cannot edit after creator approves it

**Expected Results:**
- ✅ View access to all feedback
- ✅ Can add feedback
- ✅ Limited management rights
- ✅ Cannot manage others' feedback
- ✅ Cannot change states

**Pass Criteria:** Org members have correct limited permissions.

---

### Scenario 9: Multiple Feedback Items ✅

**Setup:**
- User: Multiple org members
- Entry: Single entry

**Steps:**
1. [ ] User B adds feedback "Issue 1"
2. [ ] User C adds feedback "Issue 2"
3. [ ] User D adds feedback "Issue 3"
4. [ ] Sign in as creator (User A)
5. [ ] Verify all 3 feedback items in "Pending Review (3)"
6. [ ] Approve feedback 1
7. [ ] Deny feedback 2
8. [ ] Leave feedback 3 pending
9. [ ] Verify "Pending Review (1)"
10. [ ] Verify "Approved (1)"
11. [ ] Verify "Denied (1)"
12. [ ] Resolve approved feedback
13. [ ] Verify "Approved (0)" or section hidden
14. [ ] Verify "Resolved (1)"

**Expected Results:**
- ✅ Multiple feedback items managed independently
- ✅ Counts always accurate
- ✅ Sections show/hide correctly
- ✅ No performance issues

**Pass Criteria:** System handles multiple feedback items correctly.

---

### Scenario 10: Collapsible Sections ✅

**Setup:**
- Existing: Feedback in all statuses

**Steps:**
1. [ ] Load entry page with feedback
2. [ ] Verify "Pending Review" expanded by default
3. [ ] Verify other sections collapsed by default
4. [ ] Click "Approved" section header
5. [ ] Verify section expands smoothly
6. [ ] Verify chevron icon rotates
7. [ ] Click header again
8. [ ] Verify section collapses
9. [ ] Test all sections
10. [ ] Verify multiple sections can be open simultaneously

**Expected Results:**
- ✅ Smooth animations
- ✅ Icon changes correctly
- ✅ Default states correct
- ✅ Independent operation

**Pass Criteria:** Collapsible sections work smoothly.

---

### Scenario 11: Empty States ✅

**Setup:**
- Entry with no feedback

**Steps:**
1. [ ] Navigate to entry with no feedback
2. [ ] Scroll to feedback section
3. [ ] Verify empty state displays
4. [ ] Verify icon shows (comment-off-outline)
5. [ ] Verify message: "No feedback yet. Be the first..."
6. [ ] Add first feedback
7. [ ] Verify empty state disappears
8. [ ] Verify feedback sections appear

**Expected Results:**
- ✅ Friendly empty state
- ✅ Clear call-to-action
- ✅ Smooth transition to content

**Pass Criteria:** Empty state is helpful and clear.

---

### Scenario 12: Character Counter & Validation ✅

**Setup:**
- User: Any org member

**Steps:**
1. [ ] Navigate to feedback form
2. [ ] Verify counter shows "0/2000"
3. [ ] Type 10 characters
4. [ ] Verify counter shows "10/2000"
5. [ ] Paste 3000 characters
6. [ ] Verify only 2000 accepted
7. [ ] Verify counter shows "2000/2000"
8. [ ] Verify submit button works
9. [ ] Clear all text
10. [ ] Verify submit button disabled
11. [ ] Type 1 character
12. [ ] Verify submit button enabled

**Expected Results:**
- ✅ Counter updates in real-time
- ✅ 2000 character limit enforced
- ✅ Submit disabled when empty
- ✅ Clear validation feedback

**Pass Criteria:** Validation works correctly with clear feedback.

---

### Scenario 13: Toast Notifications ✅

**Setup:**
- User: Any authorized user

**Steps:**
1. [ ] Create feedback - verify "Feedback submitted" toast
2. [ ] Edit feedback - verify "Feedback updated" toast
3. [ ] Delete feedback - verify "Feedback deleted" toast
4. [ ] Approve feedback - verify "Feedback approved" toast
5. [ ] Deny feedback - verify "Feedback denied" toast
6. [ ] Resolve feedback - verify "Feedback marked as resolved" toast
7. [ ] Trigger error (network issue) - verify error toast
8. [ ] Verify toasts auto-dismiss after ~3 seconds
9. [ ] Verify multiple toasts stack properly

**Expected Results:**
- ✅ Clear success messages
- ✅ Clear error messages
- ✅ Auto-dismiss works
- ✅ Non-intrusive

**Pass Criteria:** Toast notifications are helpful and unobtrusive.

---

### Scenario 14: Loading States ✅

**Setup:**
- Slow network connection (throttle in DevTools)

**Steps:**
1. [ ] Open entry page with network throttling
2. [ ] Verify skeleton loads immediately
3. [ ] Verify skeleton matches final layout
4. [ ] Wait for feedback panel to load
5. [ ] Verify smooth transition
6. [ ] Submit new feedback with throttling
7. [ ] Verify loading spinner on submit button
8. [ ] Verify button text changes to "Submitting..."
9. [ ] Verify button disabled during submission
10. [ ] Verify all action buttons show loading states

**Expected Results:**
- ✅ No layout shift
- ✅ Clear loading indicators
- ✅ Buttons disabled during operations
- ✅ Smooth experience

**Pass Criteria:** Loading states prevent confusion and errors.

---

### Scenario 15: Mobile Responsive ✅

**Setup:**
- Mobile device or responsive mode (375px width)

**Steps:**
1. [ ] Load entry page on mobile
2. [ ] Verify feedback panel stacks correctly
3. [ ] Verify form is usable
4. [ ] Verify buttons are tappable (min 44x44px)
5. [ ] Verify text is readable
6. [ ] Verify sections collapse/expand smoothly
7. [ ] Verify avatar sizes appropriate
8. [ ] Test on tablet (768px)
9. [ ] Test on desktop (1024px+)
10. [ ] Verify no horizontal scroll

**Expected Results:**
- ✅ Fully functional on mobile
- ✅ Touch-friendly interface
- ✅ Readable text sizes
- ✅ No broken layouts

**Pass Criteria:** Works perfectly on all screen sizes.

---

## 🐛 Edge Cases & Error Handling

### Edge Case 1: State Transition Validation
**Test:** Try to resolve denied feedback
**Expected:** Button not visible, action blocked
**Status:** [ ]

### Edge Case 2: Edit After Status Change
**Test:** Try to edit approved feedback
**Expected:** Edit button not visible
**Status:** [ ]

### Edge Case 3: Concurrent Edits
**Test:** Two users edit same feedback simultaneously
**Expected:** Last write wins, both see final version
**Status:** [ ]

### Edge Case 4: Delete While Editing
**Test:** User A edits while User B deletes
**Expected:** Graceful error handling
**Status:** [ ]

### Edge Case 5: Permission Change Mid-Session
**Test:** User removed from org while viewing
**Expected:** Next action blocked with error
**Status:** [ ]

### Edge Case 6: Network Failure
**Test:** Submit feedback with network offline
**Expected:** Error toast, form data preserved
**Status:** [ ]

### Edge Case 7: Very Long Names
**Test:** User with 50+ character name
**Expected:** Name truncates with ellipsis
**Status:** [ ]

### Edge Case 8: Special Characters
**Test:** Feedback with emojis, unicode, HTML
**Expected:** Displays correctly, no XSS
**Status:** [ ]

### Edge Case 9: Rapid Clicking
**Test:** Click submit multiple times rapidly
**Expected:** Only one submission, button disabled
**Status:** [ ]

### Edge Case 10: Browser Back Button
**Test:** Submit feedback, click back, forward
**Expected:** Feedback persists, no duplicates
**Status:** [ ]

---

## 🎯 Performance Testing

### Load Time Tests
- [ ] Entry page loads < 1 second
- [ ] Feedback panel loads < 500ms
- [ ] No cumulative layout shift (CLS)
- [ ] First contentful paint < 1.5s

### Query Performance
- [ ] getEntryFeedback query < 50ms
- [ ] Indexes being used (check EXPLAIN)
- [ ] No N+1 query issues
- [ ] React cache working

### Client Performance
- [ ] No memory leaks
- [ ] Smooth animations (60fps)
- [ ] No unnecessary re-renders
- [ ] Efficient state updates

---

## ♿ Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Enter/Space trigger buttons
- [ ] Esc closes dialogs
- [ ] Focus visible on all elements
- [ ] Logical tab order

### Screen Reader
- [ ] Form labels announced
- [ ] Button purposes clear
- [ ] Status changes announced
- [ ] Error messages announced
- [ ] ARIA labels correct

### Visual
- [ ] Sufficient color contrast (4.5:1)
- [ ] Focus indicators visible
- [ ] Text scalable to 200%
- [ ] Icons have text alternatives

---

## 🔒 Security Testing

### Authentication
- [ ] Unauthenticated users blocked
- [ ] Session timeout handled gracefully
- [ ] No token leakage in URLs

### Authorization
- [ ] Non-org users cannot access
- [ ] Org members cannot manage
- [ ] Only creator can change states
- [ ] Only author can edit/delete pending

### Data Validation
- [ ] XSS prevention (content sanitized)
- [ ] SQL injection prevention (parameterized)
- [ ] CSRF protection (Next.js built-in)
- [ ] Input length limits enforced

### API Security
- [ ] Server actions validate auth
- [ ] Error messages don't leak info
- [ ] Rate limiting considered
- [ ] No direct object references

---

## 📊 Test Results Summary

### Test Completion
- [ ] All scenarios tested: __/15
- [ ] All edge cases tested: __/10
- [ ] Performance validated: [ ]
- [ ] Accessibility validated: [ ]
- [ ] Security validated: [ ]

### Issues Found
| ID | Severity | Description | Status |
|----|----------|-------------|--------|
| 1  |          |             |        |
| 2  |          |             |        |

### Sign-Off
- [ ] Manual testing complete
- [ ] All critical issues resolved
- [ ] Documentation accurate
- [ ] Ready for production

**Tested By:** _________________  
**Date:** _________________  
**Approved By:** _________________  
**Date:** _________________

---

## 🚀 Production Deployment Checklist

- [ ] All tests passing
- [ ] Database migration applied to production
- [ ] Environment variables verified
- [ ] Monitoring configured
- [ ] Error tracking enabled
- [ ] Rollback plan prepared
- [ ] Team notified
- [ ] Documentation published

---

**Testing Guide Version:** 1.0  
**Last Updated:** 2025-01-15  
**Next Review:** After first production deployment
