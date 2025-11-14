# PRD Summary: AI Elements Chat UI Enhancement

**Branch**: `feature/ai-elements-chat-ui`  
**Status**: Draft for Review  
**Estimated Effort**: 11-16 hours (2-3 days)

---

## Overview

Upgrade the floating chat bubble AI assistant by integrating Vercel's AI Elements component library, expanding the chat area, and adding user feedback and action buttons.

---

## Key Changes

### 1. AI Elements Integration

- Replace custom components with production-ready AI Elements
- Install via: `pnpm dlx ai-elements@latest`
- Use `Conversation`, `Message`, `MessageResponse`, `PromptInput` components

### 2. Enlarged Chat Area

- **Current**: 400x560px
- **New**: 550x700px
- 37.5% wider, 25% taller for better readability

### 3. User Feedback System

- Thumbs up/down voting on AI responses
- Persists to existing `Vote` table
- Only shown on completed AI messages
- Optimistic UI updates

### 4. Action Buttons

- **Copy**: Copy message to clipboard
- **Regenerate**: Re-send last user message
- **Apply**: Apply suggestions to obituary
- Hover-to-reveal for clean UI

---

## Components to Create

```
New Files:
├── components/ai/message-feedback.tsx       # Vote UI component
├── components/ai/message-actions.tsx        # Action buttons
├── lib/db/mutations/votes.ts                # Vote database operations
└── app/api/votes/route.ts                   # Vote API endpoint

Updated Files:
├── components/sections/obituaries/floating-chat-bubble.tsx
└── lib/db/queries/chats.ts (add getVoteByMessage)

Auto-Generated:
└── components/ai-elements/**                # AI Elements components
```

---

## Implementation Phases

| Phase | Focus                                | Duration |
| ----- | ------------------------------------ | -------- |
| 1     | AI Elements setup & core integration | 2-3h     |
| 2     | Input enhancement                    | 1-2h     |
| 3     | User feedback system                 | 3-4h     |
| 4     | Action buttons                       | 3-4h     |
| 5     | Polish & testing                     | 2-3h     |

---

## Component Structure

```
FloatingChatBubble (Enhanced)
├── Header
├── Info Banner
├── Conversation (NEW - AI Elements)
│   └── ConversationContent
│       ├── ConversationEmptyState
│       └── Messages
│           └── Message
│               ├── MessageContent
│               │   └── MessageResponse
│               └── MessageActions (NEW)
│                   ├── MessageFeedback (👍👎)
│                   ├── CopyButton
│                   ├── RegenerateButton
│                   └── ApplyButton
└── PromptInput (AI Elements)
    ├── PromptInputTextarea
    └── PromptInputSubmit
```

---

## Database Schema (Existing)

```typescript
// Vote table already exists - no migration needed
VoteTable {
  chatId: uuid (FK -> ChatTable.id)
  messageId: uuid (FK -> MessageTable.id)
  isUpvoted: boolean
  PRIMARY KEY (chatId, messageId)
}
```

---

## API Endpoints (New)

### POST /api/votes

```typescript
Request: {
  (chatId, messageId, isUpvoted);
}
Response: {
  (success, vote);
}
```

### DELETE /api/votes

```typescript
Request: {
  (chatId, messageId);
}
Response: {
  success;
}
```

---

## Success Criteria

### Must Have ✓

- AI Elements integrated
- Chat enlarged to 550x700px
- Vote system functional
- Copy/regenerate buttons working
- No performance regression
- All existing features preserved

### Should Have

- Apply suggestions feature
- Enhanced markdown rendering
- Loading states
- Error handling

### Nice to Have (Future)

- Message threading
- Tool displays
- Reasoning displays
- Export conversations

---

## Key Benefits

1. **Better UX**: Professional AI-native components, larger chat area
2. **User Feedback**: Understand response quality through votes
3. **Enhanced Interaction**: Quick actions (copy, regenerate, apply)
4. **Maintainability**: Less custom code, more standard components
5. **Future-Proof**: Easy to add advanced features (tools, reasoning)

---

## Risks & Mitigations

| Risk                  | Impact | Mitigation                          |
| --------------------- | ------ | ----------------------------------- |
| Version compatibility | High   | Lock versions, maintain fallbacks   |
| Performance issues    | Medium | Profile & optimize                  |
| Vote race conditions  | Low    | Optimistic updates, DB constraints  |
| Mobile responsiveness | Medium | Existing patterns, thorough testing |

---

## Questions for Review

1. **Vote Privacy**: Should we show vote counts to users? (Recommendation: No for MVP)
2. **Regenerate Behavior**: Create new message or replace existing? (Recommendation: New message)
3. **Action Button Visibility**: Always visible or on-hover? (Recommendation: On-hover)
4. **Apply Feature Scope**: Which types of suggestions should show Apply button?

---

## Next Steps

1. **Review this PRD** - Provide feedback on approach
2. **Answer open questions** - Clarify remaining decisions
3. **Approve to proceed** - Begin Phase 1 implementation
4. **Iterative development** - Review after each phase

---

## References

- [Full PRD](./prd-ai-elements-chat-ui.md)
- [AI Elements Docs](https://ai-sdk.dev/elements/overview)
- [AI Elements GitHub](https://github.com/vercel/ai-elements)
- [Current Component](/src/components/sections/obituaries/floating-chat-bubble.tsx)
- [Vote Schema](/src/lib/db/schema/chat.ts)
