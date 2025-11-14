# PRD: AI Elements Chat UI Enhancement

**Status**: Draft for Review  
**Created**: 2025-01-14  
**Author**: Cascade AI  
**Branch**: `feature/ai-elements-chat-ui`

---

## Executive Summary

This PRD outlines the enhancement of the existing floating chat bubble AI assistant UI by integrating Vercel's AI Elements component library, improving the user experience with professional AI-native components, expanded chat functionality, and user feedback mechanisms.

### Key Objectives

1. **Replace custom components** with production-ready AI Elements components
2. **Expand chat area** for better readability and interaction
3. **Add user feedback system** utilizing existing `Vote` table schema
4. **Implement action buttons** for enhanced AI response interaction
5. **Maintain existing functionality** while improving UX/DX

---

## Current State Analysis

### Existing Implementation

- **Location**: `/src/components/sections/obituaries/floating-chat-bubble.tsx`
- **Framework**: Next.js 16 + React 19.2 + AI SDK v5
- **State Management**: `useChat` from `@ai-sdk/react`, Jotai atoms
- **Custom Components**:
  - `PromptInput` (existing)
  - `Response` (Streamdown markdown renderer)
  - Custom message bubbles with role-based styling
- **Features**:
  - Collapsible floating bubble
  - Message streaming with loading states
  - Auto-scroll behavior
  - Integration with obituary editing workflow

### Current Dimensions

- Width: `400px`
- Height: `560px`
- Position: Fixed bottom-right/left

### Pain Points

1. Custom components lack polish of dedicated AI UI libraries
2. No user feedback mechanism for AI responses
3. Limited interaction options with AI responses
4. Markdown rendering handled by basic wrapper
5. Smaller chat area limits readability

---

## Proposed Solution

### 1. AI Elements Integration

#### Installation

```bash
pnpm dlx ai-elements@latest
```

#### Core Components to Integrate

| Component                | Purpose                       | Replaces               |
| ------------------------ | ----------------------------- | ---------------------- |
| `Conversation`           | Container with auto-scrolling | Custom div wrapper     |
| `ConversationContent`    | Message list container        | Custom message list    |
| `ConversationEmptyState` | Empty state UI                | Custom empty state     |
| `Message`                | Individual message display    | Custom message div     |
| `MessageContent`         | Message content wrapper       | Message content div    |
| `MessageResponse`        | Enhanced markdown rendering   | `Response` component   |
| `PromptInput`            | Advanced input component      | Existing `PromptInput` |
| `PromptInputTextarea`    | Auto-resizing textarea        | Custom textarea        |
| `PromptInputSubmit`      | Smart submit button           | Custom button          |
| `Actions` (new)          | Message action buttons        | N/A                    |

#### Additional Components for Future Enhancement

- `Tool` - Display tool usage in conversations
- `Reasoning` - Display AI thought processes
- `CodeBlock` - Enhanced code rendering

---

### 2. Enhanced Chat Dimensions

#### New Dimensions

- **Width**: `550px` (increased from 400px)
- **Height**: `700px` (increased from 560px)
- **Chat Messages Area**: Calculated dynamically (header + input subtracted)
- **Responsive Behavior**: Maintain existing responsive patterns

#### Rationale

- 37.5% increase in width provides better readability
- 25% increase in height allows more message history
- Maintains visual balance on typical desktop displays
- Better accommodates longer AI responses and markdown formatting

---

### 3. User Feedback System

#### Database Schema (Existing)

```typescript
// From /src/lib/db/schema/chat.ts
export const VoteTable = pgTable(
  "vote",
  {
    chatId: uuid("chat_id")
      .notNull()
      .references(() => ChatTable.id),
    messageId: uuid("message_id")
      .notNull()
      .references(() => MessageTable.id),
    isUpvoted: boolean("is_upvoted").notNull(),
  },
  (table) => {
    return [primaryKey({ columns: [table.chatId, table.messageId] })];
  }
);
```

#### Implementation Components

**1. MessageFeedback Component**

```tsx
// New component: /src/components/ai/message-feedback.tsx
interface MessageFeedbackProps {
  messageId: string;
  chatId: string;
  currentVote?: boolean | null; // true = upvote, false = downvote, null = no vote
  onVote: (isUpvoted: boolean) => Promise<void>;
}
```

**Features**:

- Thumbs up/down buttons
- Visual feedback for current vote state
- Loading state during vote submission
- Optimistic UI updates
- Integration with existing vote queries

**2. Server Actions**

```typescript
// /src/lib/db/mutations/votes.ts
export async function createOrUpdateVote(
  chatId: string,
  messageId: string,
  isUpvoted: boolean,
  userId: string
): Promise<Vote>;

export async function deleteVote(
  chatId: string,
  messageId: string
): Promise<void>;
```

**3. Vote Display Rules**

- Only show for AI assistant messages (not user messages)
- Show after message is fully streamed (not during streaming)
- Persist vote state across sessions
- Allow vote changes (toggle behavior)

---

### 4. Action Buttons

#### Copy to Clipboard

- **Icon**: Copy icon (Lucide `Copy`)
- **Behavior**: Copy message text to clipboard
- **Feedback**: Toast notification "Copied to clipboard"
- **State**: Show checkmark icon for 2 seconds after copy

#### Regenerate Response

- **Icon**: Refresh icon (Lucide `RefreshCw`)
- **Behavior**: Re-send last user message to generate new response
- **Availability**: Only on last AI message
- **State**: Disabled during streaming

#### Apply to Obituary

- **Icon**: Check icon (Lucide `Check`)
- **Behavior**: Apply suggested changes directly to obituary
- **Availability**: Only when message contains actionable suggestions
- **State**: Show confirmation before applying

#### Report Issue (Future)

- **Icon**: Flag icon (Lucide `Flag`)
- **Behavior**: Open feedback form for problematic responses
- **Integration**: Admin notification system

---

### 5. UI Layout

#### Component Structure

```
FloatingChatBubble
├── Collapsed State (existing)
│   └── Floating button with notification badge
│
└── Expanded State (enhanced)
    ├── Header (existing)
    │   ├── Icon + Title
    │   └── Close button
    │
    ├── Info Banner (existing)
    │   └── Usage instructions
    │
    ├── Conversation (NEW - AI Elements)
    │   └── ConversationContent
    │       ├── ConversationEmptyState (when no messages)
    │       └── Messages List
    │           └── Message (for each message)
    │               ├── MessageContent
    │               │   └── MessageResponse (markdown)
    │               └── MessageActions (NEW)
    │                   ├── MessageFeedback (thumbs up/down)
    │                   ├── CopyButton
    │                   ├── RegenerateButton (last msg only)
    │                   └── ApplyButton (conditional)
    │
    └── Input Area (enhanced)
        └── PromptInput
            ├── PromptInputTextarea
            └── PromptInputSubmit
```

---

## Technical Specifications

### Dependencies

#### New Dependencies

```json
{
  "@ai-elements/react": "latest",
  "react-markdown": "^9.0.0", // If not already included
  "remark-gfm": "^4.0.0" // GitHub Flavored Markdown
}
```

#### Existing Dependencies (utilized)

- `@ai-sdk/react`: `^2.0.81`
- `ai`: `^5.0.81`
- `motion`: `^12.23.24` (for animations)
- `jotai`: `^2.15.0` (for state management)
- `sonner`: `^2.0.7` (for toasts)

### File Structure

```
src/
├── components/
│   ├── ai-elements/           # NEW - AI Elements components (auto-generated)
│   │   ├── conversation/
│   │   ├── message/
│   │   ├── prompt-input/
│   │   ├── response/
│   │   └── actions/
│   │
│   ├── ai/
│   │   ├── message-feedback.tsx      # NEW
│   │   ├── message-actions.tsx       # NEW
│   │   └── response.tsx              # Keep as fallback
│   │
│   └── sections/obituaries/
│       └── floating-chat-bubble.tsx  # UPDATED
│
├── lib/
│   └── db/
│       ├── mutations/
│       │   └── votes.ts              # NEW
│       └── queries/
│           └── votes.ts              # UPDATE (add getVoteByMessage)
│
└── app/
    └── api/
        └── votes/
            └── route.ts              # NEW - Vote API endpoint
```

---

## Implementation Plan

### Phase 1: Setup & Core Integration (2-3 hours)

#### Tasks

1. **Install AI Elements** ✓

   ```bash
   pnpm dlx ai-elements@latest
   ```

   - Accept defaults
   - Verify installation in `components/ai-elements/`

2. **Update FloatingChatBubble imports**
   - Add AI Elements component imports
   - Maintain existing utility imports

3. **Replace message rendering**
   - Wrap messages in `Conversation` component
   - Use `Message` and `MessageContent` for individual messages
   - Integrate `MessageResponse` for markdown rendering
   - Test streaming behavior

4. **Update chat dimensions**
   - Change width to `550px`
   - Change height to `700px`
   - Test responsive behavior

**Deliverables**:

- AI Elements installed and configured
- Messages render with new components
- Larger chat area functional

---

### Phase 2: Input Enhancement (1-2 hours)

#### Tasks

1. **Replace input system**
   - Integrate `PromptInput` components
   - Port existing state management
   - Maintain disabled state logic

2. **Test input functionality**
   - Verify auto-resize behavior
   - Test submit on Enter key
   - Test disabled states during streaming

**Deliverables**:

- Enhanced input with AI Elements components
- All existing functionality preserved

---

### Phase 3: User Feedback System (3-4 hours)

#### Tasks

1. **Create vote mutations**
   - Implement `createOrUpdateVote` server action
   - Implement `deleteVote` server action
   - Add error handling

2. **Create vote queries**
   - Implement `getVoteByMessage` query
   - Update existing queries if needed

3. **Build MessageFeedback component**
   - Create thumbs up/down UI
   - Implement optimistic updates
   - Add loading states
   - Handle vote toggling

4. **Create API endpoint**
   - POST `/api/votes` - create/update vote
   - DELETE `/api/votes` - remove vote
   - Add authentication checks

5. **Integrate into chat UI**
   - Add to AI assistant messages only
   - Hide during streaming
   - Show current vote state
   - Test vote persistence

**Deliverables**:

- Working vote system
- Visual feedback for user votes
- Database integration complete

---

### Phase 4: Action Buttons (3-4 hours)

#### Tasks

1. **Create MessageActions component**
   - Build action button layout
   - Implement hover states
   - Add tooltips

2. **Implement Copy functionality**
   - Add clipboard API integration
   - Show success feedback
   - Handle errors gracefully

3. **Implement Regenerate functionality**
   - Add regenerate logic for last message
   - Integrate with existing `sendMessage`
   - Show loading state

4. **Implement Apply functionality (conditional)**
   - Parse message for actionable content
   - Show confirmation dialog
   - Integrate with obituary update workflow

**Deliverables**:

- Action buttons on AI messages
- Copy, regenerate features working
- Apply feature for actionable messages

---

### Phase 5: Polish & Testing (2-3 hours)

#### Tasks

1. **Visual refinements**
   - Adjust spacing and padding
   - Refine animations
   - Ensure consistent theming

2. **Edge case testing**
   - Test with very long messages
   - Test with code blocks
   - Test with multiple users
   - Test vote race conditions

3. **Performance optimization**
   - Verify no unnecessary re-renders
   - Test streaming performance
   - Check memory usage

4. **Documentation**
   - Update component documentation
   - Add usage examples
   - Document vote system

**Deliverables**:

- Polished, production-ready UI
- All edge cases handled
- Documentation updated

---

## Design Specifications

### Color Palette (existing)

- Uses shadcn/ui CSS variables
- Primary: `hsl(var(--primary))`
- Muted: `hsl(var(--muted))`
- Destructive: `hsl(var(--destructive))`

### Typography

- Font: Inter (existing)
- Message text: `text-sm`
- Headers: `text-sm font-semibold`

### Spacing

- Message gap: `space-y-4`
- Padding: `p-4` for main areas, `px-3 py-2` for messages
- Border radius: `rounded-2xl` for container, `rounded-lg` for messages

### Animations (motion/react)

```typescript
// Existing animations maintained
initial={{ opacity: 0, scale: 0.95, y: 20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
transition={{ duration: 0.2 }}
```

### Action Buttons Design

- Size: `size-8` (32x32px)
- Variant: `ghost` (transparent, hover background)
- Icon size: `size-4` (16x16px)
- Layout: Horizontal row at bottom of AI messages
- Spacing: `gap-1`

---

## API Specifications

### Vote Endpoints

#### POST /api/votes

```typescript
// Request
{
  chatId: string;
  messageId: string;
  isUpvoted: boolean;
}

// Response (Success)
{
  success: true;
  vote: {
    chatId: string;
    messageId: string;
    isUpvoted: boolean;
  }
}

// Response (Error)
{
  success: false;
  error: string;
}
```

#### DELETE /api/votes

```typescript
// Request
{
  chatId: string;
  messageId: string;
}

// Response
{
  success: true;
}
```

---

## Migration Strategy

### Backward Compatibility

- Existing chat functionality must remain operational
- No breaking changes to API routes
- Vote table schema already exists (no migration needed)
- Existing messages continue to display correctly

### Rollback Plan

- Feature branch allows easy rollback
- Custom components preserved as fallback
- Database schema unchanged (vote table already exists)

---

## Success Metrics

### User Experience

- **Metric**: Time to find relevant information in chat
- **Target**: 20% reduction due to larger display area

### User Engagement

- **Metric**: Vote submission rate
- **Target**: >30% of AI messages receive votes

### Developer Experience

- **Metric**: Component reusability
- **Target**: AI Elements components used in 2+ features

### Performance

- **Metric**: Time to First Paint (TFP) for chat
- **Target**: <200ms (no regression from current)

### Quality

- **Metric**: Bug reports related to chat UI
- **Target**: <2 bugs per month post-launch

---

## Risks & Mitigations

### Risk 1: AI Elements Version Compatibility

- **Probability**: Medium
- **Impact**: High
- **Mitigation**: Lock versions, test thoroughly, maintain fallback components

### Risk 2: Performance Degradation

- **Probability**: Low
- **Impact**: Medium
- **Mitigation**: Profile before/after, lazy load components, optimize re-renders

### Risk 3: Vote Race Conditions

- **Probability**: Medium
- **Impact**: Low
- **Mitigation**: Optimistic updates, proper error handling, database constraints

### Risk 4: Mobile Responsiveness Issues

- **Probability**: Low
- **Impact**: Medium
- **Mitigation**: Test on mobile devices, maintain existing responsive patterns

---

## Future Enhancements

### Phase 6: Advanced Features (Post-MVP)

1. **Message Threading**
   - Reply to specific messages
   - Branching conversations

2. **Rich Tool Displays**
   - Use `Tool` component for tool calls
   - Visual representation of tool usage

3. **Reasoning Display**
   - Integrate `Reasoning` component
   - Show AI thought process for o1/o3 models

4. **Message History Search**
   - Search within conversation
   - Jump to specific messages

5. **Export Conversation**
   - Download chat as PDF/Markdown
   - Share conversation via link

6. **Voice Input**
   - Add speech-to-text
   - Voice message support

---

## Acceptance Criteria

### Must Have (MVP)

- ✅ AI Elements components integrated
- ✅ Chat area enlarged to 550x700px
- ✅ User can upvote/downvote AI responses
- ✅ Votes persist across sessions
- ✅ Copy message functionality
- ✅ Regenerate last response
- ✅ All existing functionality preserved
- ✅ No performance regression

### Should Have

- ✅ Apply suggestions to obituary
- ✅ Markdown rendering with code blocks
- ✅ Empty state for new chats
- ✅ Loading states for all async actions

### Nice to Have (Future)

- ⏳ Message threading
- ⏳ Tool usage display
- ⏳ Reasoning display
- ⏳ Export conversation
- ⏳ Search functionality

---

## Timeline

| Phase                      | Duration        | Dependencies |
| -------------------------- | --------------- | ------------ |
| Phase 1: Core Integration  | 2-3 hours       | None         |
| Phase 2: Input Enhancement | 1-2 hours       | Phase 1      |
| Phase 3: Feedback System   | 3-4 hours       | Phase 2      |
| Phase 4: Action Buttons    | 3-4 hours       | Phase 3      |
| Phase 5: Polish & Testing  | 2-3 hours       | Phase 4      |
| **Total**                  | **11-16 hours** | -            |

**Target Completion**: 2-3 working days

---

## Questions & Decisions

### Open Questions

1. Should votes be user-specific or allow one vote per user per message?
   - **Decision Needed**: Clarify vote uniqueness constraints
2. Should we show vote counts to users?
   - **Recommendation**: No for MVP (privacy), consider for admin dashboard

3. Should regenerate create a new message or replace the existing one?
   - **Recommendation**: Create new message (preserve history)

4. Should action buttons always be visible or only on hover?
   - **Recommendation**: Only on hover for cleaner UI

### Resolved Decisions

- ✅ Use AI Elements (approved by user)
- ✅ Vote table schema already exists (no migration needed)
- ✅ Larger chat area (550x700px approved in request)
- ✅ Feature branch created (`feature/ai-elements-chat-ui`)

---

## Appendix

### Component Comparison

| Feature         | Current                  | With AI Elements             |
| --------------- | ------------------------ | ---------------------------- |
| Message Display | Custom div + styling     | `Message` + `MessageContent` |
| Markdown        | `Streamdown`             | `MessageResponse` (enhanced) |
| Auto-scroll     | Manual useEffect         | Built-in `Conversation`      |
| Empty State     | Manual div               | `ConversationEmptyState`     |
| Input           | Custom textarea + button | `PromptInput` + components   |
| Code Blocks     | Basic rendering          | Enhanced `CodeBlock`         |
| Streaming       | Custom loading dots      | Built-in status handling     |

### References

- [AI Elements Documentation](https://ai-sdk.dev/elements/overview)
- [AI Elements GitHub](https://github.com/vercel/ai-elements)
- [AI SDK Documentation](https://ai-sdk.dev/docs/introduction)
- [Vercel Academy - AI Elements](https://vercel.com/academy/ai-sdk/ai-elements)
- [Existing Chat Schema](/src/lib/db/schema/chat.ts)
- [Existing Queries](/src/lib/db/queries/chats.ts)

---

## Approval

**Ready for Review**: Yes  
**Reviewer**: @microdotmatrix  
**Next Steps**: Upon approval, begin Phase 1 implementation

---

_This PRD is a living document and will be updated as requirements evolve or decisions are made._
