# Text-Anchored Comments - Quick Reference

**Full PRD:** `prd-text-anchored-comments.md`  
**Status:** Planning  
**Effort:** 15-20 hours  
**Priority:** Medium

---

## 🎯 What We're Building

Allow users to **select specific text** in obituaries and **anchor comments** to that selection. Visual **colored indicators** show where comments are attached.

---

## 💡 Key Features

### For Users
✅ Select text to add focused comments  
✅ See colored dots where comments exist  
✅ Click dots to read associated comments  
✅ Each user gets unique color  
✅ Navigate between annotations  

### Technical
✅ Stores text position + quote + context  
✅ Robust anchor restoration (handles text edits)  
✅ Backward compatible with existing comments  
✅ Mobile-friendly text selection  
✅ Performance optimized  

---

## 📊 Data Model Changes

```typescript
// Extend existing document_comment table
{
  anchorStart: number | null;      // Character offset
  anchorEnd: number | null;        // Character offset
  anchorText: string | null;       // Selected text
  anchorPrefix: string | null;     // Context before
  anchorSuffix: string | null;     // Context after
  anchorValid: boolean;            // Still valid?
  anchorStatus: "pending" | "approved" | "denied";  // Moderation
}
```

**IMPORTANT:** Annotations never modify the original obituary text. 
They are pure UI overlays with references to positions.

---

## 🏗️ Architecture

```
Selection → Toolbar → Comment Form → Server Action → Database
                                           ↓
Text Content ← Indicators ← Position Calc ← Comments
```

**Components:**
- `AnnotatableText` - Renders text with indicators
- `SelectionToolbar` - Appears on text selection
- `AnnotationIndicator` - Colored dots
- `AnchoredCommentForm` - Enhanced comment form

---

## 📝 Implementation Phases

### Phase 1: Database (4-5 hours)
Migration + schema + queries + actions

### Phase 2: Selection (4-5 hours)
Capture text selection + extract anchor data

### Phase 3: Indicators (3-4 hours)
Visual dots + positioning + tooltips

### Phase 4: UI (3-4 hours)
Toolbar + enhanced form + anchor preview

### Phase 5: Integration (2-3 hours)
Wire everything + navigation + polish

---

## 🎨 Visual Design

### Indicators
```
Text with annotations •🔵 more text •🟢 final •🟡 text.
                      ↑          ↑          ↑
                   User A    User B    User C
```

### Selection Toolbar
```
        ┌─────────────────┐
        │ 💬 Add Comment │
        └────────┬────────┘
                 ↓
        Selected text here
```

### Comment with Anchor
```
┌────────────────────────────────┐
│ 🟦 John • 2h ago               │
│ 📌 "In loving memory..." [→]   │
├────────────────────────────────┤
│ This section is beautiful.     │
└────────────────────────────────┘
```

---

## 🧪 Testing Priority

### Must Test
- Text selection capture
- Anchor restoration
- Indicator positioning
- Mobile text selection
- Backward compatibility

### Edge Cases
- Unicode characters
- Very long obituaries
- Text edited after anchoring
- Overlapping annotations
- RTL text (if needed)

---

## ⚠️ Key Risks

### 1. Text Edits Break Anchors
**Solution:** Multi-layer matching (position + quote + fuzzy)

### 2. Performance Issues
**Solution:** Virtualization + memoization + batching

### 3. Mobile UX
**Solution:** Touch-friendly UI + progressive enhancement

---

## 📚 Research Summary

### Libraries Evaluated
- **react-text-annotate**: Token-based (not suitable)
- **annotation-model**: W3C compliant (outdated)
- **Decision**: Custom implementation

### Standards Used
- W3C Web Annotation Data Model
- Browser Selection API
- ARIA accessibility

### Key Insights from Research
✅ Use `window.getSelection()` for capture  
✅ Store multiple identifiers for robustness  
✅ Client components for interactivity  
✅ Server components for initial content  
✅ Character offsets for positioning  

---

## 🚀 Quick Start (When Ready)

### 1. Database
```bash
pnpm db:generate  # Generate migration
pnpm db:push      # Apply to dev DB
```

### 2. Install Dependencies
```bash
# None needed - using native APIs
```

### 3. Create Components
```
src/components/annotations/
├── annotation-indicator.tsx
├── annotatable-text.tsx
├── selection-toolbar.tsx
└── anchored-comment-form.tsx
```

### 4. Add Utilities
```
src/lib/annotations/
├── extract-anchor.ts
├── restore-selection.ts
├── calculate-positions.ts
└── user-colors.ts
```

---

## 🎯 Success Metrics

**Adoption:**
- 30%+ of comments anchored within 1 month
- 5+ comments per obituary average

**Quality:**
- 95%+ anchor validity rate
- <3s to create anchored comment

**Technical:**
- <100ms indicator render time
- No visible layout shift

---

## 📋 Checklist

Before starting:
- [ ] PRD reviewed and approved
- [ ] Technical feasibility confirmed
- [ ] Design mockups created
- [ ] Development branch ready

Phase 1:
- [ ] Migration created
- [ ] Schema updated
- [ ] Queries extended
- [ ] Actions updated

Phase 2:
- [ ] Selection hook
- [ ] Anchor extraction
- [ ] Offset calculations
- [ ] Unit tests

Phase 3:
- [ ] Indicator component
- [ ] Position algorithm
- [ ] Text rendering
- [ ] Tooltips

Phase 4:
- [ ] Selection toolbar
- [ ] Enhanced form
- [ ] Anchor preview
- [ ] Remove anchor

Phase 5:
- [ ] Integration complete
- [ ] Navigation working
- [ ] Highlighting working
- [ ] All tests passing

---

## 💬 Questions & Answers

**Q: Why not use existing libraries?**  
A: Token-based libraries don't fit our use case. Custom solution gives better control.

**Q: What if text is edited after anchoring?**  
A: Multi-layer restoration (position → quote → fuzzy) handles most cases. Invalid anchors are marked.

**Q: How are colors assigned?**  
A: Deterministic hash of user ID ensures consistent colors.

**Q: Mobile support?**  
A: Yes, with touch-friendly UI and progressive enhancement.

**Q: Backward compatible?**  
A: Yes, anchor fields are nullable. Old comments work unchanged.

---

**Quick Reference Version:** 1.0  
**For Full Details:** See `prd-text-anchored-comments.md`  
**Status:** Planning Phase
