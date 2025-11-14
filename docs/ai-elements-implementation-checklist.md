# AI Elements Implementation Checklist

**Project**: Floating Chat Bubble Enhancement  
**Branch**: `feature/ai-elements-chat-ui`  
**Status**: Pre-Implementation

---

## Pre-Implementation

### Documentation Review

- [ ] Review full PRD (`prd-ai-elements-chat-ui.md`)
- [ ] Review summary (`prd-ai-elements-chat-ui-summary.md`)
- [ ] Review quick reference (`ai-elements-quick-reference.md`)
- [ ] Approve design direction
- [ ] Answer open questions in PRD

### Environment Setup

- [ ] Branch checked out: `feature/ai-elements-chat-ui`
- [ ] Dependencies up to date: `pnpm install`
- [ ] Dev server running: `pnpm dev`

---

## Phase 1: Setup & Core Integration (2-3 hours)

### AI Elements Installation

- [ ] Run `pnpm dlx ai-elements@latest`
- [ ] Accept default component path
- [ ] Confirm overwrite if prompted
- [ ] Verify installation: `ls src/components/ai-elements/`
- [ ] Verify components: conversation, message, prompt-input

### Import Updates

- [ ] Open `/src/components/sections/obituaries/floating-chat-bubble.tsx`
- [ ] Add AI Elements imports:
  ```typescript
  import {
    Conversation,
    ConversationContent,
    ConversationEmptyState,
  } from "@/components/ai-elements/conversation";
  import {
    Message,
    MessageContent,
    MessageResponse,
  } from "@/components/ai-elements/message";
  ```
- [ ] Keep existing imports (useChat, motion, jotai, etc.)

### Message Rendering Update

- [ ] Replace custom message list div with `Conversation`
- [ ] Replace individual message divs with `Message` component
- [ ] Replace `Response` with `MessageResponse`
- [ ] Handle message parts correctly (map over parts)
- [ ] Maintain role-based styling (`from` prop)
- [ ] Test: Messages render correctly
- [ ] Test: Streaming works
- [ ] Test: Auto-scroll functions

### Dimension Updates

- [ ] Change container width: `400px` → `550px`
- [ ] Change container height: `560px` → `700px`
- [ ] Update motion animation if needed
- [ ] Test: Chat displays correctly at new size
- [ ] Test: Responsive behavior on smaller screens

### Empty State

- [ ] Add `ConversationEmptyState` for zero messages
- [ ] Set title: "AI Editing Assistant"
- [ ] Set description with usage instructions
- [ ] Test: Empty state displays when no messages

### Testing Phase 1

- [ ] Send test message - renders correctly
- [ ] Send multiple messages - all render
- [ ] Test streaming - displays live
- [ ] Test auto-scroll - follows new content
- [ ] Test empty state - shows when appropriate
- [ ] Check console - no errors
- [ ] Verify performance - no lag

### Git Checkpoint

- [ ] Commit: "feat: integrate AI Elements core components"
- [ ] Push to feature branch

---

## Phase 2: Input Enhancement (1-2 hours)

### Import AI Elements Input

- [ ] Add to imports:
  ```typescript
  import {
    PromptInput,
    PromptInputTextarea,
    PromptInputSubmit,
  } from "@/components/ai-elements/prompt-input";
  ```

### Replace Input Form

- [ ] Replace existing `PromptInput` wrapper
- [ ] Use `PromptInputTextarea` for input field
- [ ] Use `PromptInputSubmit` for send button
- [ ] Port `value` and `onChange` handlers
- [ ] Port `disabled` logic (streaming states)
- [ ] Port `placeholder` text
- [ ] Update `onSubmit` handler signature

### Status Handling

- [ ] Verify `status` from useChat hook
- [ ] Calculate `isLoading` state
- [ ] Pass to input components
- [ ] Update submit button state

### Testing Phase 2

- [ ] Type message - input updates
- [ ] Press Enter - message sends
- [ ] Click send button - message sends
- [ ] Test during streaming - input disabled
- [ ] Test auto-resize - textarea grows
- [ ] Test paste - works correctly
- [ ] Verify edge cases: empty input, whitespace

### Git Checkpoint

- [ ] Commit: "feat: upgrade to AI Elements input components"
- [ ] Push to feature branch

---

## Phase 3: User Feedback System (3-4 hours)

### Database Mutations

- [ ] Create `/src/lib/db/mutations/votes.ts`
- [ ] Implement `createOrUpdateVote(chatId, messageId, isUpvoted, userId)`
  - [ ] Use db.insert() with onConflict
  - [ ] Handle upsert logic
  - [ ] Return Vote object
- [ ] Implement `deleteVote(chatId, messageId)`
  - [ ] Use db.delete()
  - [ ] Add where clause
  - [ ] Handle errors
- [ ] Add proper TypeScript types
- [ ] Add error handling
- [ ] Test mutations in isolation

### Database Queries

- [ ] Open `/src/lib/db/queries/chats.ts`
- [ ] Add `getVoteByMessage(chatId, messageId)` query
  - [ ] Select from VoteTable
  - [ ] Where chatId and messageId match
  - [ ] Return Vote | null
- [ ] Test query in dev

### API Route

- [ ] Create `/src/app/api/votes/route.ts`
- [ ] Implement POST handler
  - [ ] Parse request body
  - [ ] Validate chatId, messageId, isUpvoted
  - [ ] Get userId from auth
  - [ ] Call createOrUpdateVote mutation
  - [ ] Return success response
  - [ ] Handle errors with proper status codes
- [ ] Implement DELETE handler
  - [ ] Parse request body
  - [ ] Validate chatId, messageId
  - [ ] Get userId from auth
  - [ ] Call deleteVote mutation
  - [ ] Return success response
- [ ] Add authentication check
- [ ] Test with Postman/curl

### MessageFeedback Component

- [ ] Create `/src/components/ai/message-feedback.tsx`
- [ ] Define props interface:
  ```typescript
  interface MessageFeedbackProps {
    messageId: string;
    chatId: string;
    currentVote?: boolean | null;
    onVote: (isUpvoted: boolean) => Promise<void>;
  }
  ```
- [ ] Build UI layout
  - [ ] Thumbs up button (Lucide `ThumbsUp`)
  - [ ] Thumbs down button (Lucide `ThumbsDown`)
  - [ ] Horizontal layout with gap
- [ ] Add visual states
  - [ ] Default (not voted)
  - [ ] Upvoted (thumbs up filled)
  - [ ] Downvoted (thumbs down filled)
  - [ ] Hover states
  - [ ] Loading state (during vote submission)
- [ ] Implement vote handler
  - [ ] Call onVote prop
  - [ ] Show loading indicator
  - [ ] Handle errors
  - [ ] Update UI optimistically
- [ ] Add toggle behavior (click again to remove vote)
- [ ] Test component in isolation

### Integration with Chat

- [ ] Import MessageFeedback in floating-chat-bubble
- [ ] Add to Message component (AI messages only)
- [ ] Fetch current vote state for each message
- [ ] Implement vote submission handler
  - [ ] Call /api/votes POST
  - [ ] Update local state optimistically
  - [ ] Handle success/error
  - [ ] Show toast on success
- [ ] Only show after message completes (not during streaming)
- [ ] Only show for assistant role messages
- [ ] Test vote persistence across refresh

### Testing Phase 3

- [ ] Vote on message - saves to database
- [ ] Refresh page - vote state persists
- [ ] Toggle vote - updates correctly
- [ ] Remove vote - deletes from database
- [ ] Vote during streaming - not visible
- [ ] Vote on user message - not visible
- [ ] Multiple votes on different messages - all work
- [ ] Check database - votes saved correctly
- [ ] Test error handling - shows toast

### Git Checkpoint

- [ ] Commit: "feat: add user feedback voting system"
- [ ] Push to feature branch

---

## Phase 4: Action Buttons (3-4 hours)

### MessageActions Component

- [ ] Create `/src/components/ai/message-actions.tsx`
- [ ] Define props interface:
  ```typescript
  interface MessageActionsProps {
    message: Message;
    chatId: string;
    isLastMessage: boolean;
    onRegenerate?: () => void;
    onApply?: (content: string) => void;
  }
  ```
- [ ] Build layout
  - [ ] Horizontal row of action buttons
  - [ ] Subtle, minimal design
  - [ ] Hidden by default, show on message hover
- [ ] Add Button components with tooltips

### Copy Button

- [ ] Add copy icon (Lucide `Copy`)
- [ ] Implement clipboard API
  ```typescript
  await navigator.clipboard.writeText(messageText);
  ```
- [ ] Show success feedback (toast)
- [ ] Show checkmark icon for 2 seconds after copy
- [ ] Handle errors (fallback to document.execCommand)
- [ ] Add tooltip: "Copy message"

### Regenerate Button

- [ ] Add refresh icon (Lucide `RefreshCw`)
- [ ] Only show on last AI message
- [ ] Implement regenerate logic
  - [ ] Get last user message
  - [ ] Re-send to sendMessage()
  - [ ] Show loading state
- [ ] Disable during streaming
- [ ] Add tooltip: "Regenerate response"

### Apply Button (Conditional)

- [ ] Add check icon (Lucide `Check`)
- [ ] Detect if message contains actionable content
  - [ ] Check for specific keywords/patterns
  - [ ] Parse message structure
- [ ] Show only when applicable
- [ ] Implement apply logic
  - [ ] Show confirmation dialog
  - [ ] Extract changes from message
  - [ ] Apply to obituary
  - [ ] Set processing state
  - [ ] Show success feedback
- [ ] Add tooltip: "Apply changes to obituary"

### Report Button (Optional/Future)

- [ ] Add flag icon (Lucide `Flag`)
- [ ] Implement report modal
- [ ] Add tooltip: "Report issue"
- [ ] Mark as future enhancement

### Integration with Chat

- [ ] Import MessageActions in floating-chat-bubble
- [ ] Add to Message component (AI messages only)
- [ ] Pass required props
- [ ] Implement hover state CSS
  ```css
  .message-actions {
    opacity: 0;
  }
  .message:hover .message-actions {
    opacity: 1;
  }
  ```
- [ ] Connect regenerate handler to useChat
- [ ] Connect apply handler to obituary update
- [ ] Test all actions

### Testing Phase 4

- [ ] Hover message - actions appear
- [ ] Copy message - copies to clipboard, shows feedback
- [ ] Regenerate last message - creates new response
- [ ] Regenerate not-last - button hidden
- [ ] Apply actionable message - shows confirmation, applies changes
- [ ] Apply non-actionable - button hidden
- [ ] Actions during streaming - appropriate states
- [ ] Multiple rapid actions - handled gracefully

### Git Checkpoint

- [ ] Commit: "feat: add message action buttons"
- [ ] Push to feature branch

---

## Phase 5: Polish & Testing (2-3 hours)

### Visual Refinements

- [ ] Review spacing consistency
  - [ ] Message gaps
  - [ ] Padding inside messages
  - [ ] Action button spacing
- [ ] Review color scheme
  - [ ] Vote button colors
  - [ ] Action button colors
  - [ ] Hover states
  - [ ] Active states
- [ ] Review animations
  - [ ] Smooth transitions
  - [ ] No jarring movements
  - [ ] Consistent timing
- [ ] Review typography
  - [ ] Font sizes
  - [ ] Line heights
  - [ ] Font weights
- [ ] Mobile responsiveness
  - [ ] Test at 320px width
  - [ ] Test at 768px width
  - [ ] Adjust sizes if needed

### Accessibility

- [ ] All buttons have aria-labels
- [ ] Tooltips have proper roles
- [ ] Keyboard navigation works
  - [ ] Tab through interactive elements
  - [ ] Enter/Space activate buttons
  - [ ] Escape closes dialogs
- [ ] Screen reader testing
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible

### Edge Case Testing

- [ ] Very long messages (>2000 chars)
  - [ ] Scrolling works
  - [ ] Layout doesn't break
  - [ ] Actions still accessible
- [ ] Messages with code blocks
  - [ ] Syntax highlighting works
  - [ ] Copy includes proper formatting
  - [ ] Scrolling horizontal if needed
- [ ] Messages with markdown tables
  - [ ] Tables render correctly
  - [ ] Responsive on small screens
- [ ] Multiple rapid messages
  - [ ] All render correctly
  - [ ] No race conditions
  - [ ] Scroll keeps up
- [ ] Network errors during streaming
  - [ ] Error displayed
  - [ ] Can retry
  - [ ] State recovers
- [ ] Concurrent votes from multiple users
  - [ ] No data loss
  - [ ] Optimistic updates work
  - [ ] Database constraints hold

### Performance Testing

- [ ] Profile with React DevTools
  - [ ] No unnecessary re-renders
  - [ ] Check component render times
- [ ] Test with 50+ messages
  - [ ] Scroll performance smooth
  - [ ] Memory usage acceptable
- [ ] Test streaming performance
  - [ ] No dropped frames
  - [ ] Smooth character-by-character display
- [ ] Test action button responsiveness
  - [ ] Instant feedback on click
  - [ ] No delays

### Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Documentation

- [ ] Update component JSDoc comments
- [ ] Add usage examples in comments
- [ ] Document vote system in README
- [ ] Add troubleshooting guide
- [ ] Update component props documentation

### Git Checkpoint

- [ ] Commit: "polish: refine UI and add comprehensive testing"
- [ ] Push to feature branch

---

## Pre-Merge Checklist

### Code Quality

- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Proper error handling everywhere
- [ ] TypeScript errors resolved
- [ ] ESLint warnings resolved
- [ ] Proper types for all props
- [ ] No 'any' types

### Testing Verification

- [ ] All acceptance criteria met
- [ ] No regressions in existing features
- [ ] Performance benchmarks passed
- [ ] Accessibility checklist complete
- [ ] Cross-browser testing done
- [ ] Mobile testing done

### Documentation

- [ ] PRD updated with any changes
- [ ] Implementation notes added
- [ ] Known issues documented
- [ ] Future enhancements listed

### Deployment Readiness

- [ ] All commits pushed to feature branch
- [ ] Branch up to date with main
- [ ] No merge conflicts
- [ ] Build succeeds: `pnpm build`
- [ ] Type check passes: `pnpm type-check` (if available)
- [ ] Lint passes: `pnpm lint`

---

## Post-Implementation

### Code Review

- [ ] Create pull request
- [ ] Link to PRD documents
- [ ] Add screenshots/video
- [ ] Request review from team
- [ ] Address review feedback

### QA Testing

- [ ] QA team testing complete
- [ ] All bugs fixed
- [ ] Regression testing passed

### Deployment

- [ ] Merge to main
- [ ] Deploy to staging
- [ ] Smoke test on staging
- [ ] Deploy to production
- [ ] Monitor for errors

### Monitoring

- [ ] Check error tracking (first 24h)
- [ ] Monitor performance metrics
- [ ] Review user feedback
- [ ] Check vote submission rates

---

## Rollback Plan

If issues arise:

- [ ] Identify issue severity
- [ ] Attempt quick fix if minor
- [ ] If major, revert merge commit
- [ ] Communicate to users
- [ ] Fix issues in feature branch
- [ ] Re-test before re-deploy

---

## Success Metrics (After 1 Week)

### Quantitative

- [ ] Vote submission rate: >30% of AI messages
- [ ] Copy button usage: Track clicks
- [ ] Regenerate usage: Track frequency
- [ ] Apply button success rate: Track applies
- [ ] Error rate: <1% of interactions
- [ ] Performance: <200ms TFP (no regression)

### Qualitative

- [ ] User feedback collected
- [ ] Team feedback collected
- [ ] Accessibility audit passed
- [ ] No critical bugs reported

---

## Notes

### Open Issues

- (Track any issues discovered during implementation)

### Deferred Items

- Message threading (Phase 6)
- Tool displays (Phase 6)
- Reasoning displays (Phase 6)
- Export functionality (Phase 6)

### Learnings

- (Document what worked well, what didn't)

---

**Last Updated**: 2025-01-14  
**Maintained By**: Development Team
