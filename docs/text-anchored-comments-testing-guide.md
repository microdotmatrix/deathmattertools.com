# Text-Anchored Comments - Testing Guide

## ✅ Integration Complete

The text-anchored comments feature is now integrated into the obituary view page!

---

## 🧪 How to Test

### 1. **Text Selection (All Users)**

**As an organization member:**
1. Navigate to an obituary: `/{entryId}/obituaries/{id}/view`
2. **Select any text** in the "Memorial Overview" section
3. You should see a **floating toolbar** appear above the selection
4. The toolbar shows: `[💬 Add Comment] X chars selected`

---

### 2. **Create Anchored Comment (Organization Members)**

1. Select text in the obituary
2. Click **"Add Comment"** in the floating toolbar
3. A comment form should open with:
   - **Anchor preview** showing the selected text
   - Character count badge
   - Context preview (prefix...selection...suffix)
   - Remove anchor button (✕)
4. Type your comment
5. Click **"Add Anchored Comment"** (note the anchor icon)
6. Comment is saved with anchor data

---

### 3. **View Annotation Indicators (All Users)**

Once anchored comments exist:
1. Reload the obituary page
2. You should see **colored dots** (8px circles) inline with the text
3. Each dot indicates an anchored comment at that position
4. Dots are color-coded by user (consistent per user)

**Dot Features:**
- **Hover:** Dot grows to 12px, shows tooltip with count
- **Multiple comments:** Shows count badge (e.g., "2")
- **Status badge:** Shows ✓ (approved) or ✗ (denied) if moderated
- **Click:** Currently navigates (full integration pending)

---

### 4. **Moderation (Document Owners Only)**

**To moderate anchored comments:**
1. Log in as the **document owner**
2. View anchored comments in the comments panel
3. For each anchored comment, you'll see:
   - The comment content
   - Anchor reference (if integrated with enhanced card)
   - **Moderation buttons:**
     - **[✓ Approve]** - Green button
     - **[✗ Deny]** - Red button

4. Click approve or deny
5. Status updates immediately (toast notification)
6. Indicator badge updates (✓ or ✗ appears on dot)

---

## 🎯 What's Working

### ✅ Fully Functional
- Text selection tracking
- Selection toolbar appears on highlight
- Anchor data extraction (position, text, context)
- Database storage of anchors
- Indicator rendering (colored dots)
- Status badges on indicators
- Moderation actions (approve/deny)
- Server-side validation

### ⚠️ Partially Functional
- **Comment display:** Uses existing comment panel (basic)
- **Navigation:** Clicking dots doesn't scroll to comments yet
- **Anchor preview in comments:** Not showing in comment list yet

---

## 🔧 Next Steps (Optional Enhancements)

### To Get Full Features

**Option 1: Enhanced Comment Panel** (Recommended)
Replace the existing `ObituaryComments` component with one that uses `EnhancedCommentCard`:

```tsx
// In comments panel, use:
<EnhancedCommentCard
  comment={comment}
  currentUserId={currentUser.id}
  canModerate={canModerate}
  documentId={documentId}
  onGoToAnchor={() => navigateToAnchor(anchor, containerRef)}
/>
```

**Option 2: Add Click Handler**
Wire up the `onIndicatorClick` prop in the page:

```tsx
<AnnotatableObituaryViewer
  // ... other props
  onIndicatorClick={(commentIds) => {
    // Scroll to comments section
    navigateToFirstComment(commentIds);
  }}
/>
```

---

## 📊 Testing Checklist

### Basic Features
- [ ] Select text → toolbar appears
- [ ] Click "Add Comment" → form opens with anchor
- [ ] Submit comment → saves successfully
- [ ] Reload page → indicator dot appears
- [ ] Hover dot → tooltip shows

### Moderation (Owner)
- [ ] View anchored comment
- [ ] Click "Approve" → status updates
- [ ] Click "Deny" → status updates  
- [ ] Indicator badge changes (✓ or ✗)

### Edge Cases
- [ ] Select text without permission → no toolbar
- [ ] Create regular comment (no selection) → works
- [ ] Multiple comments at same position → count badge shows
- [ ] Edit obituary text → anchors marked invalid (future)

---

## 🐛 Troubleshooting

### "No toolbar appears when selecting text"
- Check you're logged in as an organization member
- Ensure `canComment` is true
- Verify you're selecting within the "Memorial Overview" card

### "No indicators showing"
- Ensure comments with anchors exist in database
- Check `enableAnnotations={true}` is set
- Verify comments have `anchorStart` and `anchorEnd` values

### "Moderation buttons not showing"
- Must be logged in as document owner (`access.role === "owner"`)
- Comment must have anchor data
- Check `canModerate` prop is true

---

## 📝 Database Verification

To verify anchor data is being saved:

```sql
SELECT 
  id,
  content,
  anchor_start,
  anchor_end,
  anchor_text,
  anchor_status,
  anchor_valid
FROM v1_document_comment
WHERE anchor_start IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🎨 Visual Reference

### Selection Toolbar
```
    ┌────────────────────────────┐
    │ [💬 Add Comment] 42 chars  │
    └────────────┬───────────────┘
                 ↓
        Selected text here
```

### Annotation Indicators
```
Text with annotations •🔵 more text •🟢²✓ final text.
                      ↑           ↑
                   Single    Multiple+Approved
```

### Anchor Preview in Form
```
┌────────────────────────────────────────┐
│ 🗗 Anchored to: [23 characters]        │
│ "In loving memory of John..."          │
│ Context: ...and family [selection]...  │
└────────────────────────────────────────┘
```

---

## 🚀 Success Metrics

After testing, you should be able to:
1. ✅ Create anchored comments by selecting text
2. ✅ See visual indicators where comments are anchored
3. ✅ Moderate suggestions as document owner
4. ✅ See status badges on indicators
5. ✅ Use regular comments without anchors (backward compatible)

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify database migration ran successfully
3. Ensure all new files are imported correctly
4. Check that anchor data is in serialized comments

---

**Status:** ✅ Ready for Testing  
**Version:** 1.0  
**Last Updated:** 2025-01-15
