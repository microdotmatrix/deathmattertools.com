# PRD: Consolidate Obituary Edit and View Routes

**Status:** Draft  
**Priority:** High  
**Estimated Effort:** 12-15 hours  
**Created:** Oct 22, 2025

---

## Executive Summary

Merge the separate edit (`/[entryId]/obituaries/[id]`) and view (`/[entryId]/obituaries/[id]/view`) routes into a single unified route that provides role-based experiences. Replace the overlapping sidebar with a floating chat bubble for AI editing functionality (owner-only), while maintaining commenting capabilities for organization members.

---

## Current State Analysis

### Route Structure
```
/[entryId]/obituaries/[id]          - Edit route (AI chat sidebar)
/[entryId]/obituaries/[id]/view     - View route (comments + commenting settings)
```

### Key Components

**Edit Route (`[id]/page.tsx`)**
- Uses `SidebarProvider` with 40rem width sidebar
- Contains `ObituarySidebar` with AI chat interface
- Shows `ObituaryViewer` component
- Chat functionality for content editing
- Only accessible to entry owners

**View Route (`[id]/view/page.tsx`)**
- Two-column layout (obituary + comments panel)
- Contains `ObituaryViewerWithComments` (text-anchored comments)
- `ObituaryComments` panel with threading
- `OrganizationCommentingSettings` for access control
- Accessible to organization members (with permissions)

### Problems

1. **Navigation Friction:** Users must switch between routes for editing vs. viewing/commenting
2. **Redundant Code:** Two separate pages displaying the same obituary content
3. **Poor UX:** Sidebar overlaps content and covers footer (40rem width)
4. **Confusing Permissions:** Not clear which route is for what role
5. **Inconsistent Layout:** Different layouts create cognitive overhead

---

## Goals & Requirements

### Primary Goals
1. Single source of truth for obituary viewing/editing
2. Cleaner, non-overlapping UI for AI chat
3. Clear role-based feature access
4. Maintain all existing functionality (comments, AI editing, settings)

### User Stories

**As an entry owner, I want to:**
- Edit obituary content via AI chat without sidebar overlap
- View and moderate comments on the same page
- Manage commenting settings inline
- Have a clean, professional layout

**As an organization member, I want to:**
- View obituaries and leave comments
- See text-anchored comment indicators
- Not be confused by owner-only features

### Success Criteria
- Single route handles both editing and viewing
- Chat UI doesn't overlap content
- Comments work identically to current view route
- Role-based features are hidden appropriately
- No functionality loss in migration

---

## Proposed Solution

### Architecture

#### Single Route: `/[entryId]/obituaries/[id]/page.tsx`

**Role-Based Rendering:**
```
┌─────────────────────────────────────────────────┐
│  Owner View                                      │
│  ┌──────────────────┬────────────────────────┐  │
│  │  Obituary +      │  Comments Panel        │  │
│  │  Text Anchors    │  - Thread view         │  │
│  │                  │  - Moderation          │  │
│  │                  │  Settings Card         │  │
│  └──────────────────┴────────────────────────┘  │
│  [Floating Chat Bubble - Bottom Right]          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Org Member View                                 │
│  ┌──────────────────┬────────────────────────┐  │
│  │  Obituary +      │  Comments Panel        │  │
│  │  Text Anchors    │  - Thread view         │  │
│  │                  │  - Add comments        │  │
│  │                  │                        │  │
│  └──────────────────┴────────────────────────┘  │
│  [No Chat Bubble]                                │
└─────────────────────────────────────────────────┘
```

### Component Changes

#### 1. New: `FloatingChatBubble` Component
**Purpose:** Replace sidebar with non-intrusive chat interface

**Features:**
- Fixed position at bottom-right corner
- Expandable/collapsible panel
- Smooth animations (slide up/fade)
- Maintains chat history across collapse
- Z-index above content but below modals

**Props:**
```typescript
interface FloatingChatBubbleProps {
  documentId: string;
  initialChat?: Chat | null;
  initialMessages?: Message[];
  position?: "bottom-right" | "bottom-left";
  defaultExpanded?: boolean;
}
```

**States:**
- Collapsed: Small circular button with icon (e.g., sparkles/chat icon)
- Expanded: Panel ~400px wide × 500px tall
- Minimized indicator when AI is responding

**Visual Design:**
```
Collapsed:
┌──────────┐
│   ✨🤖   │  <- Floating button
└──────────┘

Expanded:
┌─────────────────────────┐
│ AI Editing Assistant  × │
├─────────────────────────┤
│                         │
│  Chat messages...       │
│                         │
├─────────────────────────┤
│ [Input field]      [→]  │
└─────────────────────────┘
```

#### 2. Modified: Main Page Component

**Structure:**
```tsx
/[entryId]/obituaries/[id]/page.tsx

export default async function ObituaryPage({ params }) {
  // Auth & access checks
  const access = await getDocumentWithAccess(...);
  const entryAccess = await getEntryWithAccess(...);
  
  // Role-based data fetching
  const isOwner = access.role === "owner";
  const canComment = access.canComment;
  
  // Fetch comments (for all roles with access)
  const comments = await listDocumentComments(...);
  
  // Fetch chat data (owner only)
  const chatData = isOwner 
    ? await getChatByDocumentId(...)
    : null;
  
  return (
    <main className="container mx-auto px-4 py-6">
      <Header {...} />
      
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        {/* Left Column - Obituary Content */}
        <ObituaryContentSection
          document={access.document}
          canComment={canComment}
        />
        
        {/* Right Column - Comments & Settings */}
        <CommentsSection
          documentId={access.document.id}
          comments={comments}
          canComment={canComment}
          canModerate={isOwner}
          settings={isOwner ? <CommentingSettings /> : null}
        />
      </div>
      
      {/* Owner-only Chat Bubble */}
      {isOwner && (
        <FloatingChatBubble
          documentId={access.document.id}
          initialChat={chatData.chat}
          initialMessages={chatData.messages}
        />
      )}
    </main>
  );
}
```

#### 3. Reused Components
- `ObituaryViewerWithComments` - Text-anchored viewing
- `ObituaryComments` - Comments panel
- `OrganizationCommentingSettings` - Settings card
- Existing comment-related components

#### 4. Removed Components
- `ObituarySidebar` - Replaced by `FloatingChatBubble`
- Current `SidebarProvider` setup
- `ObituaryViewer` (non-comment version) - Use comment version universally

---

## Technical Implementation

### Phase 1: Create FloatingChatBubble Component (3-4 hours)

**Tasks:**
1. Create `src/components/sections/obituaries/floating-chat-bubble.tsx`
2. Extract chat logic from `sidebar.tsx`
3. Implement expandable/collapsible states
4. Add smooth animations using Framer Motion or CSS transitions
5. Style with Tailwind (consistent with design system)
6. Handle responsive behavior (mobile: full-screen overlay?)

**Key Implementation Details:**
```tsx
"use client";

export function FloatingChatBubble({ ... }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadIndicator, setUnreadIndicator] = useState(false);
  
  // Chat logic from sidebar
  const { messages, sendMessage, ... } = useChat({ ... });
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded ? (
        <ChatPanel onClose={() => setIsExpanded(false)} />
      ) : (
        <TriggerButton onClick={() => setIsExpanded(true)} />
      )}
    </div>
  );
}
```

### Phase 2: Consolidate Route Logic (4-5 hours)

**Tasks:**
1. Merge access control logic from both routes
2. Combine data fetching (comments + chat)
3. Create unified layout with role-based rendering
4. Implement header with proper navigation
5. Port commenting settings for owners
6. Add role badges and metadata display

**Data Fetching Strategy:**
```typescript
// Fetch document access first
const access = await getDocumentWithAccess({ documentId, userId, orgId });

// Fetch entry access
const entryAccess = await getEntryWithAccess(entryId);

// Parallel fetch based on role
const [comments, chatData, user] = await Promise.all([
  listDocumentComments({ documentId, documentCreatedAt }),
  access.role === "owner" 
    ? getChatByDocumentId({ documentId, userId })
    : Promise.resolve(null),
  clerkClient.users.getUser(userId),
]);
```

### Phase 3: Update Navigation & Cleanup (2-3 hours)

**Tasks:**
1. Update all links pointing to `/view` route to main route
2. Add redirects from old `/view` route to new consolidated route
3. Remove `view/page.tsx` file
4. Update breadcrumbs/navigation components
5. Clean up unused imports

**Redirect Implementation:**
```tsx
// In /[entryId]/obituaries/[id]/view/page.tsx
export default async function ViewRedirect({ params }) {
  const { entryId, id } = await params;
  redirect(`/${entryId}/obituaries/${id}`);
}
```

### Phase 4: Testing & Refinement (2-3 hours)

**Test Cases:**
1. Owner can access AI chat bubble
2. Org members cannot see chat bubble
3. Comments work for permitted users
4. Text-anchored comments display correctly
5. Commenting settings only visible to owners
6. Mobile responsiveness
7. Chat state persists across expand/collapse
8. Navigation links work correctly

---

## UI/UX Specifications

### Floating Chat Bubble

**Trigger Button (Collapsed):**
- Size: 56px × 56px circle
- Background: Primary gradient or solid primary color
- Icon: Sparkles (✨) or chat bubble
- Shadow: `shadow-lg` for depth
- Hover: Slight scale increase (1.05)
- Pulse animation when AI responds

**Expanded Panel:**
- Width: 400px (desktop), 100vw - 32px (mobile)
- Height: 560px (desktop), 80vh (mobile)
- Position: Bottom-right, 24px offset from edges
- Border radius: 16px
- Shadow: `shadow-2xl`
- Header: Title + close button
- Body: Scrollable chat messages
- Footer: Fixed input field

**Animations:**
- Expand: Slide up from button + fade in (300ms ease-out)
- Collapse: Slide down to button + fade out (250ms ease-in)
- Message appearance: Fade + slide from bottom

### Layout

**Desktop (≥1024px):**
```
┌─────────────────────────────────────────────────┐
│  [Back] [Badge] [Created Date] [Edit if owner]  │
├─────────────────┬───────────────────────────────┤
│                 │                               │
│  Obituary       │  Comments Panel               │
│  Content        │  - Anchor indicators          │
│  (2fr)          │  - Thread view                │
│                 │  - Settings (owner)           │
│  (1fr)          │                               │
└─────────────────┴───────────────────────────────┘
                                   [Chat Bubble 🤖]
```

**Mobile (<1024px):**
- Stack layout (obituary → comments)
- Chat bubble expands to full-screen modal
- Sticky header with close button

### Accessibility

- Chat bubble trigger: `aria-label="Open AI editing assistant"`
- Keyboard navigation: Tab to trigger, Enter/Space to open
- Focus trap when expanded
- Escape key to close
- Screen reader announcements for AI responses

---

## Access Control Matrix

| Feature | Owner | Org Member (Can Comment) | Org Member (No Comment) |
|---------|-------|--------------------------|-------------------------|
| View obituary | ✅ | ✅ | ✅ |
| AI chat bubble | ✅ | ❌ | ❌ |
| Add comments | ✅ | ✅ | ❌ |
| View comments | ✅ | ✅ | ✅ |
| Moderate comments | ✅ | ❌ | ❌ |
| Commenting settings | ✅ | ❌ | ❌ |
| Edit obituary link | ✅ | ❌ | ❌ |

---

## Migration Plan

### Step-by-step

1. **Create feature branch:** ✅ `feature/consolidate-obituary-routes`
2. **Build FloatingChatBubble component**
   - Extract logic from sidebar
   - Implement UI with states
   - Test chat functionality
3. **Update main route**
   - Merge logic from view route
   - Integrate FloatingChatBubble
   - Implement role-based rendering
4. **Add redirects**
   - Convert view route to redirect
   - Update all navigation links
5. **Testing**
   - Manual testing across roles
   - Verify comments functionality
   - Check mobile responsiveness
6. **Deploy & Monitor**
   - Merge to main
   - Monitor for issues
   - Gather user feedback

### Rollback Plan

If critical issues arise:
1. Revert main route changes
2. Restore view route functionality
3. Fix issues in feature branch
4. Re-test before re-deployment

---

## Dependencies & Constraints

### Technical Dependencies
- Existing comment system (must remain functional)
- AI chat API (`/api/create`)
- Clerk authentication and org management
- Database schema (no changes needed)

### Design Constraints
- Must work on mobile and desktop
- Cannot break existing text-anchored comments
- Must maintain current permission model
- Should follow existing design system

### Performance Considerations
- Chat history should lazy-load if extensive
- Comments should paginate if count exceeds threshold
- Animations should not block interactions
- Floating bubble should not impact page scroll

---

## Future Enhancements

### Post-MVP Ideas
1. **Drag-and-drop chat positioning:** Let users move bubble
2. **Chat templates:** Quick prompts for common edits
3. **Notification system:** Alert when org members comment
4. **Version history:** Track obituary changes from chat edits
5. **Collaborative editing:** Real-time indicator when multiple users viewing
6. **Export chat transcript:** Download AI conversation

---

## Open Questions

1. **Mobile chat UX:** Full-screen modal or keep compact panel?
   - **Recommendation:** Full-screen for better usability
   
2. **Chat history limit:** Should we limit message count in expanded view?
   - **Recommendation:** Show last 50 messages, with "Load more" option
   
3. **Notification badge:** Show unread AI responses when collapsed?
   - **Recommendation:** Yes, with small red dot indicator
   
4. **Keyboard shortcut:** Add hotkey to toggle chat (e.g., Cmd+K)?
   - **Recommendation:** Nice-to-have, not MVP

---

## Appendix

### File Structure Changes

**Remove:**
```
src/app/[entryId]/obituaries/[id]/view/page.tsx
```

**Create:**
```
src/components/sections/obituaries/floating-chat-bubble.tsx
src/components/sections/obituaries/obituary-content-section.tsx (optional wrapper)
src/components/sections/obituaries/comments-section.tsx (optional wrapper)
```

**Modify:**
```
src/app/[entryId]/obituaries/[id]/page.tsx (major refactor)
```

### Component Responsibility

**FloatingChatBubble:**
- Chat state management
- Message display/sending
- Expand/collapse animations
- Owner-only visibility enforcement

**ObituaryPage:**
- Access control
- Data fetching orchestration
- Layout composition
- Role-based rendering

**CommentsSection:**
- Comment threading
- Moderation controls
- Settings card (conditional)

---

## Timeline Estimate

| Phase | Duration | Milestones |
|-------|----------|------------|
| Phase 1: FloatingChatBubble | 3-4 hours | Component functional, styled |
| Phase 2: Route Consolidation | 4-5 hours | Single route working, all features present |
| Phase 3: Navigation/Cleanup | 2-3 hours | Old route removed, links updated |
| Phase 4: Testing | 2-3 hours | All test cases passing |
| **Total** | **12-15 hours** | Ready for production |

---

## Conclusion

This consolidation will significantly improve UX by:
- Reducing navigation friction between editing and viewing
- Providing a cleaner, less intrusive AI chat interface
- Maintaining all current functionality (comments, settings, AI editing)
- Creating a single, intuitive experience for all user roles

The floating chat bubble pattern is modern, familiar (similar to customer support widgets), and doesn't interfere with content consumption. Role-based rendering ensures appropriate feature access without confusion.
