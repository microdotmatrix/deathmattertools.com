# Product Requirements Document: Inline TipTap Editor for Obituaries

**Feature**: Inline Markdown Editor for Obituary Content  
**Status**: Draft  
**Created**: 2025-01-11  
**Branch**: `feature/inline-tiptap-editor`

---

## Executive Summary

Enable users to directly edit their generated obituary text inline on the obituary view page (`/[entryId]/obituaries/[id]`) using TipTap, a rich-text editor. The editor will support Markdown, toggle between read-only and edit modes, and integrate seamlessly with existing features like the AI editing assistant and text-anchored comments.

---

## Goals & Objectives

### Primary Goals
1. **Inline Editing**: Allow users to edit obituary content directly in the viewing layout
2. **Mode Toggling**: Provide clear edit/view modes with explicit user control
3. **Feature Coexistence**: Ensure compatibility with AI assistant and commenting features
4. **Data Persistence**: Reliably save user edits to the database

### Success Metrics
- Users can toggle between view and edit modes without layout disruption
- Edited content persists correctly after save
- No conflicts with existing AI assistant or commenting features
- Smooth user experience with clear visual feedback

---

## User Stories

### As an obituary owner, I want to:
1. **View Mode (Default)**: See my obituary in a clean, read-only format
2. **Enter Edit Mode**: Click an "Edit" button to make the text editable
3. **Edit Content**: Make changes using a rich text editor with Markdown support
4. **Save Changes**: Click a "Save" button to persist my edits
5. **Cancel Editing**: Discard changes and return to view mode
6. **Use AI Assistant**: Continue using the AI assistant independently of manual edits

---

## Technical Requirements

### 1. TipTap Integration

#### Packages (Already Installed)
```json
"@tiptap/react": "^3.10.1",
"@tiptap/starter-kit": "^3.10.1",
"@tiptap/pm": "^3.10.1"
```

#### Required Extensions
- **StarterKit**: Core editing functionality (paragraphs, headings, lists, etc.)
- **Markdown**: Support for Markdown syntax input/output
- Optional: **Bold**, **Italic**, **Strike**, **Code**, **Blockquote**, **BulletList**, **OrderedList**

#### Editor Configuration
```typescript
const editor = useEditor({
  extensions: [StarterKit],
  content: initialContent, // HTML/Markdown content from database
  editable: false, // Start in read-only mode
  immediatelyRender: false, // Prevent SSR issues in Next.js
})
```

### 2. Component Architecture

#### New Component: `ObituaryEditorInline`
**Location**: `src/components/sections/obituaries/obituary-editor-inline.tsx`

**Responsibilities**:
- Manage edit/view state toggle
- Initialize TipTap editor with content
- Handle save/cancel actions
- Coordinate with server actions for persistence

**Props Interface**:
```typescript
interface ObituaryEditorInlineProps {
  documentId: string;
  initialContent: string;
  canEdit: boolean; // Only owners can edit
  entryId: string;
}
```

**State Management**:
```typescript
const [isEditing, setIsEditing] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [content, setContent] = useState(initialContent);
```

#### Modified Component: `ObituaryViewerWithComments`
- Replace `ObituaryViewerSimple` with `ObituaryEditorInline` when user is owner
- Pass necessary props for editing capabilities

### 3. Database Integration

#### Server Action: `updateObituaryContent`
**Location**: `src/actions/obituaries.ts` (new file)

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
  const { userId } = await auth();
  
  if (!userId) {
    return { error: "Unauthorized" };
  }

  // Verify ownership
  const access = await getDocumentWithAccess({
    documentId,
    userId,
  });

  if (!access || access.role !== "owner") {
    return { error: "Only owners can edit obituaries" };
  }

  // Update content using existing mutation
  const result = await updateDocumentContent({
    id: documentId,
    entryId,
    content,
    title: access.document.title,
    tokenUsage: access.document.tokenUsage ?? undefined,
  });

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath(`/${entryId}/obituaries/${documentId}`);
  return { success: true };
}
```

### 4. UI/UX Design

#### View Mode (Default)
- Display obituary content in `Response` component (existing markdown renderer)
- Show "Edit" button (only for owners)
- Button location: Top-right of obituary card, next to title

#### Edit Mode
- Replace content display with TipTap editor
- Show toolbar with basic formatting controls
- Display "Save" and "Cancel" buttons
- Button location: Bottom-right of editor area
- Visual indicator: Subtle border/background change to indicate edit mode

#### Loading States
- **Entering Edit Mode**: Brief fade transition
- **Saving**: Disable buttons, show spinner on Save button
- **Success**: Toast notification, transition back to view mode
- **Error**: Toast error message, remain in edit mode

#### Button Designs
```typescript
// Edit Button (View Mode)
<Button
  variant="outline"
  size="sm"
  onClick={handleEnterEditMode}
>
  <Icon icon="mdi:pencil" className="mr-2 size-4" />
  Edit
</Button>

// Save Button (Edit Mode)
<Button
  variant="default"
  size="sm"
  onClick={handleSave}
  disabled={isSaving}
>
  {isSaving ? (
    <Icon icon="mdi:loading" className="mr-2 size-4 animate-spin" />
  ) : (
    <Icon icon="mdi:check" className="mr-2 size-4" />
  )}
  Save
</Button>

// Cancel Button (Edit Mode)
<Button
  variant="ghost"
  size="sm"
  onClick={handleCancel}
  disabled={isSaving}
>
  Cancel
</Button>
```

### 5. Content Format Handling

#### Content Flow
1. **Database → Editor**: HTML content loaded into TipTap
2. **Editor Display**: TipTap renders content with Markdown support
3. **User Edits**: TipTap maintains content as HTML internally
4. **Save → Database**: HTML content persisted (existing format)

#### Markdown Support
- TipTap natively supports Markdown shortcuts during editing
- Content stored as HTML (maintains compatibility with existing system)
- No conversion needed (HTML is already used in `Response` component)

### 6. Feature Coexistence

#### AI Assistant Integration
- **Separate Concern**: AI assistant operates independently via chat interface
- **Update Flow**: When AI updates content, refresh page data
- **Conflict Prevention**: 
  - AI assistant disabled while in edit mode
  - Show toast if AI update occurs during editing: "AI has updated the content. Please refresh to see changes."

#### Text-Anchored Comments
- **View Mode**: Comments system works normally
- **Edit Mode**: Disable text selection for comments
- **Rationale**: Editing changes text positions, invalidating comment anchors
- **Implementation**: Pass `canComment={!isEditing}` to prevent selection

### 7. Error Handling

#### Scenarios & Solutions
1. **Save Failure**: Show error toast, keep user in edit mode with content intact
2. **Network Error**: Retry logic with exponential backoff
3. **Concurrent Edits**: Detect stale content, prompt user to refresh
4. **Unauthorized Access**: Redirect to view mode with error message

### 8. Next.js Considerations

#### Client Component
- Use `"use client"` directive (TipTap requires browser APIs)
- Set `immediatelyRender: false` to prevent SSR hydration mismatches

#### Dynamic Import (Optional)
If bundle size becomes concern:
```typescript
const ObituaryEditorInline = dynamic(
  () => import('@/components/sections/obituaries/obituary-editor-inline'),
  { ssr: false }
);
```

---

## Implementation Phases

### Phase 1: Core Editor Component (4-5 hours)
**Goal**: Basic TipTap editor with view/edit toggle

**Tasks**:
1. Create `ObituaryEditorInline` component
2. Set up TipTap editor with StarterKit
3. Implement edit/view mode toggle
4. Add basic toolbar (Bold, Italic, Lists, Headings)
5. Handle content loading and display
6. Add Save/Cancel buttons with basic handlers

**Deliverable**: Component that can toggle modes and display content

---

### Phase 2: Database Integration (3-4 hours)
**Goal**: Persist edited content to database

**Tasks**:
1. Create `updateObituaryContent` server action
2. Implement save handler with optimistic updates
3. Add error handling and retry logic
4. Implement page revalidation after save
5. Add loading states and spinners
6. Test save/cancel flows

**Deliverable**: Fully functional save system

---

### Phase 3: UI Polish & Integration (3-4 hours)
**Goal**: Professional UI and seamless integration

**Tasks**:
1. Design and implement button layouts
2. Add transitions and animations (fade in/out)
3. Implement toast notifications (success/error)
4. Style TipTap editor to match existing design
5. Add keyboard shortcuts (Cmd+S to save, Esc to cancel)
6. Replace `ObituaryViewerSimple` in parent component
7. Test with existing features (comments, AI assistant)

**Deliverable**: Production-ready UI integrated into page

---

### Phase 4: Feature Coexistence (2-3 hours)
**Goal**: Ensure compatibility with existing features

**Tasks**:
1. Disable AI assistant chat while editing
2. Disable comment selection during edit mode
3. Handle AI updates during editing (conflict detection)
4. Add warning messages for concurrent operations
5. Test all feature interactions
6. Update page layout for owner vs. viewer differences

**Deliverable**: All features work harmoniously

---

### Phase 5: Testing & Documentation (2-3 hours)
**Goal**: Verify quality and document usage

**Tasks**:
1. Manual testing of all edit/save/cancel flows
2. Test error scenarios (network failures, auth issues)
3. Test with different content types and lengths
4. Verify mobile responsiveness
5. Update user documentation
6. Code review and cleanup

**Deliverable**: Tested, documented feature ready for production

---

## Total Estimated Time: 14-19 hours

---

## Key Files to Modify/Create

### New Files
```
src/components/sections/obituaries/obituary-editor-inline.tsx
src/actions/obituaries.ts
```

### Modified Files
```
src/components/sections/obituaries/obituary-viewer-with-comments.tsx
src/app/[entryId]/obituaries/[id]/page.tsx (possibly minor changes)
```

---

## Dependencies & Constraints

### Technical Dependencies
- TipTap packages (already installed)
- Next.js 15+ with App Router
- React 19.2+
- Existing auth system (Clerk)
- Existing database mutations (`updateDocumentContent`)

### Constraints
1. **Owner-Only**: Only document owners can edit (verified via auth)
2. **Inline Layout**: Editor must occupy same space as view content
3. **No Format Change**: Content remains HTML (existing format)
4. **No SSR**: Editor must be client-side only

---

## Open Questions

1. **Markdown Extension**: Should we add the official TipTap Markdown extension for better syntax support?
   - **Recommendation**: Start with StarterKit, add if needed
   
2. **Autosave**: Should we implement autosave (draft) functionality?
   - **Recommendation**: Phase 2 feature (not in initial release)
   
3. **Version History**: Should edits create version snapshots?
   - **Recommendation**: Future enhancement (not in scope)
   
4. **Concurrent Edit Warning**: How to handle if AI updates while user is editing?
   - **Recommendation**: Show warning toast, prompt user to refresh

---

## Risks & Mitigation

### Risk 1: Content Format Incompatibility
**Impact**: High  
**Probability**: Low  
**Mitigation**: TipTap uses HTML (same as existing `Response` component), no conversion needed

### Risk 2: Feature Conflicts (AI Assistant + Editing)
**Impact**: Medium  
**Probability**: Medium  
**Mitigation**: Disable AI chat in edit mode, add clear messaging

### Risk 3: Comment Anchors Invalidation
**Impact**: Medium  
**Probability**: High  
**Mitigation**: Disable commenting during edit mode, document behavior

### Risk 4: Performance (Large Documents)
**Impact**: Low  
**Probability**: Low  
**Mitigation**: TipTap is performant; obituaries are typically small documents

---

## Success Criteria

### Must Have
- ✅ Toggle between view and edit modes
- ✅ Save edited content to database
- ✅ Owner-only access control
- ✅ Inline layout (no navigation/popups)
- ✅ Works alongside AI assistant
- ✅ Clear loading/error states

### Should Have
- ✅ Keyboard shortcuts (Cmd+S, Esc)
- ✅ Toast notifications
- ✅ Smooth transitions
- ✅ Mobile responsive

### Nice to Have
- ⏳ Autosave drafts
- ⏳ Version history
- ⏳ Rich formatting toolbar
- ⏳ Undo/Redo history

---

## Related Documentation

- [TipTap Official Docs](https://tiptap.dev/docs)
- [TipTap React Integration](https://tiptap.dev/docs/editor/getting-started/install/react)
- [Existing PRD: Text-Anchored Comments](./prd-text-anchored-comments.md)
- [Database Mutations](../src/lib/db/mutations/documents.ts)

---

## Approval

**Product Owner**: _[To be signed]_  
**Tech Lead**: _[To be signed]_  
**Date**: _[To be filled]_

---

**Next Steps**: Review this PRD, provide feedback, and approve to begin Phase 1 implementation.
