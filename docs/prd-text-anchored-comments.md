# PRD: Text-Anchored Comments for Obituaries

**Version:** 1.0  
**Date:** 2025-01-15  
**Status:** Planning  
**Priority:** Medium  
**Estimated Effort:** 15-20 hours

---

## 🎯 Executive Summary

Add ability for organization members to anchor comments to specific text selections within obituary content. Users can highlight text, add comments associated with that selection, and view visual indicators (colored dots) showing where comments are anchored.

**Key Benefits:**
- **Precision:** Comments reference specific passages
- **Context:** Readers see exactly what's being discussed  
- **Collaboration:** Multiple users can comment on different sections
- **Visual Clarity:** Colored indicators show annotation locations

---

## 📖 Problem Statement

### Current State
- Comments are at document level only
- No way to reference specific text passages
- Readers must guess what part is being discussed
- Long obituaries make context unclear

### Desired State
- Users select text to anchor comments
- Visual indicators show where comments exist
- Clicking indicators displays associated comments
- Each user has distinct color for their annotations
- Backward compatible with non-anchored comments

---

## 🎯 Goals & Non-Goals

### Goals ✅
- Allow text selection for comment anchoring
- Store selection data (position, quote, context)
- Display visual indicators at anchor points
- Associate user colors with annotations
- Support both anchored and non-anchored comments
- Mobile-friendly text selection

### Non-Goals ❌
- Rich text editing within comments
- Real-time collaborative highlighting
- PDF/image annotation
- Annotation versioning
- Export/import annotations

---

## 🔧 Technical Approach

### Why Custom Solution?

**Researched Options:**
- `react-text-annotate`: Token-based, designed for NLP training
- `annotation-model`: W3C compliant but outdated, not React-friendly

**Our Approach:**
- Use W3C Web Annotation Data Model principles
- Custom implementation optimized for Next.js 15
- Lighter weight, better control

### Selection Capture Strategy

```typescript
interface TextSelection {
  start: number;        // Character offset from container start
  end: number;          // Character offset from container end
  selectedText: string; // Exact text selected
  prefix: string;       // 50 chars before selection
  suffix: string;       // 50 chars after selection
}
```

**Multi-layer restoration:**
1. Try exact position match (fastest)
2. Try text quote with context (most robust)
3. Try fuzzy match (text might have changed)
4. Mark as invalid if all fail

### Color Assignment

```typescript
function getUserColor(userId: string): string {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
  ];
  const hash = hashCode(userId);
  return colors[hash % colors.length];
}
```

---

## 📊 Data Model

### Database Schema Extension

```typescript
// Extend DocumentCommentTable
export const DocumentCommentTable = pgTable(
  "document_comment",
  {
    // ... existing fields ...
    
    // NEW: Annotation fields (nullable for backward compatibility)
    anchorStart: integer("anchor_start"),
    anchorEnd: integer("anchor_end"),
    anchorText: text("anchor_text"),
    anchorPrefix: text("anchor_prefix"),
    anchorSuffix: text("anchor_suffix"),
    anchorValid: boolean("anchor_valid").notNull().default(true),
    
    // NEW: Moderation state for anchored comments
    anchorStatus: text("anchor_status", { 
      enum: ["pending", "approved", "denied"] 
    }).default("pending"),
  }
);
```

**IMPORTANT:** Annotations **never modify** the original obituary text in the database. 
They exist purely as UI overlays with references to text positions.

### TypeScript Types

```typescript
export type AnchorStatus = "pending" | "approved" | "denied";

export interface CommentAnchor {
  start: number;
  end: number;
  text: string;
  prefix: string;
  suffix: string;
  valid: boolean;
  status: AnchorStatus;
}

export interface AnnotationIndicator {
  position: number;
  commentIds: string[];
  userColors: string[];
  statuses: AnchorStatus[];  // For visual differentiation
}
```

---

## 🎨 UI/UX Design

### Visual Indicators

**Design:**
- 8px circular dots
- User's assigned color
- Semi-transparent (0.8 opacity)
- Inline with text
- Stack horizontally if overlapping

**States:**
- Default: 8px dot
- Hover: 12px + tooltip
- Active: Highlighted
- Multiple: Show count badge
- **Approved:** ✓ badge overlay
- **Denied:** ✗ badge overlay
- **Pending:** No badge (clean dot)

### Selection Toolbar

**Appearance:**
- Floats above selected text
- Contains "💬 Add Comment" button
- Smooth fade-in animation
- Dismissible

### Comment Form Enhancement

```
┌────────────────────────────────────────┐
│ 💬 Add Comment                         │
├────────────────────────────────────────┤
│ 📌 Anchored to: "...text..."          │
│ [Remove anchor]                        │
├────────────────────────────────────────┤
│ [Textarea for comment]                 │
│ [Cancel] [Submit Comment]              │
└────────────────────────────────────────┘
```

### Anchored Comments:

```
┌────────────────────────────────────────┐
│ 🟦 John Doe · 2 hours ago  [✓ Approved]│
│ 📌 "In loving memory of..." [Go to ↗] │
├────────────────────────────────────────┤
│ This section is beautifully written.   │
│                                         │
│ [Owner only: Approve ✓] [Deny ✗]      │
└────────────────────────────────────────┘
```

**Moderation Actions (Owner Only):**
- ✓ **Approve** - Mark suggestion as accepted
- ✗ **Deny** - Mark suggestion as rejected
- Default: **Pending** (no status shown)

---

## 📝 Implementation Plan

### Phase 1: Database & Backend (4-5 hours)
- [ ] Create migration adding anchor columns + status
- [ ] Update schema types with AnchorStatus
- [ ] Extend query functions for anchors
- [ ] Update `createCommentAction` to accept anchor data
- [ ] Add `updateAnchorStatusAction` for moderation
- [ ] Ensure backward compatibility

### Phase 2: Text Selection (4-5 hours)
- [ ] Create `useTextSelection` hook
- [ ] Build anchor extraction utilities
- [ ] Implement text offset calculations
- [ ] Add context extraction
- [ ] Write unit tests

### Phase 3: Visual Indicators (3-4 hours)
- [ ] Create `AnnotationIndicator` component
- [ ] Build position calculation algorithm
- [ ] Implement text rendering with indicators
- [ ] Support multiple overlapping indicators
- [ ] Add hover tooltips

### Phase 4: Selection Toolbar & Form (3-4 hours)
- [ ] Create `SelectionToolbar` component
- [ ] Build toolbar positioning logic
- [ ] Enhance comment form for anchors
- [ ] Add anchor preview
- [ ] Implement remove anchor option

### Phase 5: Integration & Polish (2-3 hours)
- [ ] Update `ObituaryViewer` component
- [ ] Add "Go to anchor" navigation
- [ ] Implement temporary text highlighting
- [ ] Handle invalid anchors gracefully
- [ ] Test backward compatibility

---

## 🧪 Testing Strategy

### Key Test Cases
- Text selection and capture
- Anchor restoration with exact match
- Anchor restoration with fuzzy match
- Invalid anchor handling
- Indicator positioning
- Multiple overlapping indicators
- Mobile text selection
- Backward compatibility
- Unicode and special characters
- Long obituaries (5000+ words)

---

## ⚠️ Risks & Mitigations

### Risk 1: Text Editing Breaks Anchors
**Impact:** High | **Probability:** Medium

**Mitigation:**
- Store position + text quote + context
- Use fuzzy matching for moved text
- Mark invalid anchors with UI indication
- Allow users to re-anchor

### Risk 2: Performance with Many Annotations
**Impact:** Medium | **Probability:** Low

**Mitigation:**
- Virtualize indicators in viewport
- Memoize position calculations
- Batch DOM updates
- Paginate if needed

### Risk 3: Mobile UX Challenges
**Impact:** Medium | **Probability:** Medium

**Mitigation:**
- Touch-friendly toolbar
- Alternative long-press input
- Larger tap targets
- Progressive enhancement

---

## 📚 Technical Reference

### Libraries Considered
- **react-text-annotate:** Token-based, NLP focused
- **annotation-model:** W3C compliant, outdated
- **Custom solution:** Best fit for our stack

### Browser APIs Used
- `window.getSelection()` - Text selection
- `Range` API - Selection boundaries
- `TreeWalker` - DOM traversal
- `getBoundingClientRect()` - Positioning

### Standards Referenced
- W3C Web Annotation Data Model
- Web Selection API
- ARIA Accessibility Guidelines

---

## 🚀 Success Metrics

### Adoption
- % of comments with anchors
- Comments per obituary
- Active annotators per document

### Quality
- Anchor validity rate
- Time to create anchored comment
- User satisfaction score

### Technical
- Page load time impact
- Render performance
- Mobile vs desktop usage

---

## 📖 User Stories

### Story 1: Create Anchored Comment
**As an** organization member  
**I want to** select text and add a comment  
**So that** my feedback references the exact passage

### Story 2: View Anchored Comments
**As a** reader  
**I want to** see where comments are anchored  
**So that** I understand context immediately

### Story 3: Navigate Annotations
**As a** reader  
**I want to** jump between annotated sections  
**So that** I can review all feedback efficiently

---

## 🎯 Acceptance Criteria

### MVP Requirements
- [x] Users can select text in obituary
- [x] Selection triggers annotation UI
- [x] Comments save with anchor data
- [x] Visual indicators appear at anchors
- [x] Clicking indicators shows comments
- [x] "Go to anchor" navigation works
- [x] Backward compatible with old comments
- [x] Works on mobile devices

---

## 📋 Next Steps

1. **Review & Approve** this PRD
2. **Create detailed technical spec** for Phase 1
3. **Set up development branch**
4. **Begin Phase 1: Database migration**
5. **Weekly progress reviews**

---

**Document Status:** Draft - Pending Review  
**Review By:** Development Team  
**Approval Required:** Product Owner  
**Target Start Date:** TBD

---

## 📎 Appendices

### Appendix A: Database Migration

```sql
-- Migration: Add anchor columns to document_comment
ALTER TABLE v1_document_comment
ADD COLUMN anchor_start INTEGER,
ADD COLUMN anchor_end INTEGER,
ADD COLUMN anchor_text TEXT,
ADD COLUMN anchor_prefix TEXT,
ADD COLUMN anchor_suffix TEXT,
ADD COLUMN anchor_valid BOOLEAN DEFAULT true NOT NULL;

CREATE INDEX document_comment_anchor_valid_idx 
ON v1_document_comment(anchor_valid);
```

### Appendix B: Color Palette

```typescript
const ANNOTATION_COLORS = {
  blue: '#3B82F6',
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899',
  teal: '#14B8A6',
  orange: '#F97316',
};
```

### Appendix C: Key Algorithms

See implementation plan for detailed pseudocode on:
- Anchor extraction
- Position calculation
- Selection restoration
- Indicator positioning

---

**PRD Version:** 1.0  
**Created:** 2025-01-15  
**Last Updated:** 2025-01-15  
**Status:** Planning Phase
