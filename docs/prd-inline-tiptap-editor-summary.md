# Quick Reference: Inline TipTap Editor

**Feature**: Inline obituary editing with TipTap  
**Branch**: `feature/inline-tiptap-editor`  
**Estimated Time**: 14-19 hours  
**Full PRD**: [prd-inline-tiptap-editor.md](./prd-inline-tiptap-editor.md)

---

## What It Does

Adds inline editing capabilities to obituary view pages, allowing owners to directly edit content using TipTap rich-text editor without leaving the page.

---

## Key Features

✅ **Toggle Edit/View Modes**: Button to switch between reading and editing  
✅ **Inline Layout**: Editor loads in same spot as text display  
✅ **Owner-Only**: Only document owners can edit  
✅ **Save/Cancel**: Explicit controls for persisting or discarding changes  
✅ **Coexists with AI**: Doesn't conflict with AI editing assistant  
✅ **Rich Text Support**: Markdown shortcuts, formatting toolbar

---

## User Flow

### View Mode (Default)
```
[Obituary Text Display]
                        [Edit Button]
```

### Edit Mode
```
[TipTap Editor with Toolbar]
    [Content...]
                [Cancel] [Save]
```

1. User clicks "Edit" → TipTap loads with current content
2. User makes changes using rich-text editor
3. User clicks "Save" → Content persists to database
4. OR user clicks "Cancel" → Changes discarded, return to view mode

---

## Technical Stack

**Editor**: TipTap 3.10.1 (already installed)  
**Extensions**: StarterKit (core editing features)  
**Content Format**: HTML (no change from current system)  
**Integration**: Server action for database updates  
**Constraints**: Client-side only (no SSR)

---

## Implementation Phases

| Phase | Focus | Hours | Key Deliverable |
|-------|-------|-------|-----------------|
| 1 | Core Component | 4-5 | Basic editor with toggle |
| 2 | Database Integration | 3-4 | Working save system |
| 3 | UI Polish | 3-4 | Production-ready interface |
| 4 | Feature Coexistence | 2-3 | AI + comments compatibility |
| 5 | Testing | 2-3 | QA and documentation |

---

## Key Files

### New
- `src/components/sections/obituaries/obituary-editor-inline.tsx`
- `src/actions/obituaries.ts`

### Modified
- `src/components/sections/obituaries/obituary-viewer-with-comments.tsx`
- `src/app/[entryId]/obituaries/[id]/page.tsx` (minor)

---

## Feature Interactions

| Feature | Interaction | Solution |
|---------|-------------|----------|
| **AI Assistant** | Could conflict with manual edits | Disable AI chat during edit mode |
| **Comments** | Text changes invalidate anchors | Disable selection while editing |
| **Viewer Access** | Non-owners shouldn't edit | Check `access.role === "owner"` |

---

## Code Snippets

### Component Structure
```typescript
"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export const ObituaryEditorInline = ({ 
  documentId, 
  initialContent, 
  canEdit,
  entryId 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editable: isEditing,
    immediatelyRender: false,
  });

  // Toggle, Save, Cancel handlers...
  
  return isEditing ? (
    <div>
      <EditorContent editor={editor} />
      <Button onClick={handleSave}>Save</Button>
      <Button onClick={handleCancel}>Cancel</Button>
    </div>
  ) : (
    <div>
      <Response>{content}</Response>
      {canEdit && <Button onClick={handleEdit}>Edit</Button>}
    </div>
  );
};
```

### Server Action
```typescript
"use server";

export async function updateObituaryContent({
  documentId,
  entryId,
  content,
}: {
  documentId: string;
  entryId: string;
  content: string;
}) {
  // Auth check
  // Ownership verification
  // Update using existing updateDocumentContent()
  // Revalidate page
}
```

---

## Success Metrics

✅ Edit mode toggles without layout shift  
✅ Content saves reliably  
✅ No conflicts with AI assistant or comments  
✅ Clear loading/error feedback  
✅ Mobile responsive

---

## Next Steps

1. **Review** this PRD and full document
2. **Approve** to proceed with implementation
3. **Phase 1**: Start with core editor component
4. **Iterate** through phases 2-5

---

For complete details, see [prd-inline-tiptap-editor.md](./prd-inline-tiptap-editor.md)
