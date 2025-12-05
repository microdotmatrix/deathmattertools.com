# PRD: Obituary Export Utilities

## Overview

Add utility buttons to the `ObituaryViewerWithComments` component enabling users to copy, print, and export obituary content to PDF. These actions should work on the rendered obituary text in read-only view mode.

## User Stories

1. **As a user**, I want to copy the obituary text to my clipboard so I can paste it into emails, documents, or other applications.
2. **As a user**, I want to print the obituary directly from the browser so I can have a physical copy for memorial services.
3. **As a user**, I want to save the obituary as a PDF file so I can share it digitally or archive it offline.

## Scope

### In Scope

- Copy to clipboard button with success/error feedback
- Print button triggering browser print dialog
- Save to PDF button generating a downloadable PDF file
- Buttons visible only in read-only view mode (not during editing)
- Toast notifications for user feedback
- Loading states for PDF generation

### Out of Scope

- Custom print templates/themes
- PDF customization options (margins, fonts, headers)
- Batch export of multiple obituaries
- Cloud storage integration

## Technical Approach

### 1. Copy to Clipboard

**Implementation**: Native Clipboard API (no external dependencies)

```typescript
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(content);
    toast.success("Obituary copied to clipboard");
  } catch {
    toast.error("Failed to copy to clipboard");
  }
};
```

**Rationale**:

- Native API has excellent browser support (97%+ on caniuse)
- Zero dependencies
- Asynchronous with proper error handling

### 2. Print

**Implementation**: Native `window.print()` with CSS media queries

```css
@media print {
  /* Hide non-essential UI elements */
  .print-hidden {
    display: none !important;
  }

  /* Ensure content fits page */
  .print-content {
    width: 100%;
    max-width: none;
    margin: 0;
    padding: 20px;
  }
}
```

**Alternative Considered**: `react-to-print` library

- Pros: More control, custom print targets
- Cons: Additional dependency, overkill for this use case

**Rationale**:

- Native API is sufficient for printing a single content area
- CSS media queries provide adequate styling control
- No additional bundle size

### 3. Save to PDF

**Implementation**: `html2pdf.js` library

```bash
pnpm add html2pdf.js
```

**Why html2pdf.js**:

- Client-side only (no server required)
- Combines `html2canvas` + `jsPDF` under the hood
- Good quality output with configurable options
- ~250KB gzipped (acceptable for on-demand dynamic import)
- 80.1 benchmark score, High reputation

**Configuration**:

```typescript
const options = {
  margin: [0.5, 0.5, 0.5, 0.5], // inches
  filename: `${entryName}-obituary.pdf`,
  image: { type: "jpeg", quality: 0.95 },
  html2canvas: {
    scale: 2,
    useCORS: true,
    logging: false,
  },
  jsPDF: {
    unit: "in",
    format: "letter",
    orientation: "portrait",
  },
};
```

**Dynamic Import**: Load only when user clicks "Save PDF" to minimize initial bundle:

```typescript
const handleSavePDF = async () => {
  const html2pdf = (await import("html2pdf.js")).default;
  // Generate PDF...
};
```

## UI Design

### Button Placement

Buttons should appear as an action bar above the obituary content in read-only view:

```
┌────────────────────────────────────────────────┐
│  [📋 Copy]  [🖨️ Print]  [📄 Save PDF]          │
├────────────────────────────────────────────────┤
│                                                │
│              Obituary Content                  │
│                                                │
└────────────────────────────────────────────────┘
│               [Open Editor]                    │
```

### Button States

- **Default**: Icon + label, outline variant
- **Loading** (PDF only): Spinner + "Generating..."
- **Disabled**: When editing mode is active

### Feedback

- **Copy**: Toast "Obituary copied to clipboard" ✓
- **Print**: Browser print dialog opens (no toast needed)
- **PDF**:
  - Loading toast "Generating PDF..."
  - Success: File downloads, toast "PDF saved successfully"
  - Error: Toast "Failed to generate PDF"

## Component Structure

```
ObituaryViewerWithComments
├── ExportActionsBar (new component)
│   ├── CopyButton
│   ├── PrintButton
│   └── SavePDFButton
├── ObituaryViewerSimple (existing, needs ref for PDF)
└── ObituaryEditorInline (existing)
```

### Props Flow

```typescript
interface ExportActionsBarProps {
  content: string; // Markdown content for copy
  contentRef: RefObject<HTMLDivElement>; // DOM ref for PDF
  entryName?: string; // For PDF filename
  disabled?: boolean; // Disable during edit mode
}
```

## Implementation Plan

### Phase 1: Copy Button

1. Add `ExportActionsBar` component skeleton
2. Implement copy functionality with Clipboard API
3. Add toast feedback
4. **Testing**: Verify clipboard contains correct text

### Phase 2: Print Button

1. Add print button to action bar
2. Add print-specific CSS media queries
3. Ensure obituary content prints cleanly
4. **Testing**: Verify print preview shows content correctly

### Phase 3: Save PDF Button

1. Install `html2pdf.js` dependency
2. Add ref to `ObituaryViewerSimple` for DOM access
3. Implement dynamic import and PDF generation
4. Add loading state and error handling
5. **Testing**: Verify PDF renders correctly, downloads properly

### Phase 4: Polish

1. Add keyboard shortcuts (optional)
2. Ensure buttons hidden during edit mode
3. Add `aria-label` for accessibility
4. Test on mobile browsers

## Dependencies

| Package     | Version | Size (gzip) | Purpose        |
| ----------- | ------- | ----------- | -------------- |
| html2pdf.js | ^0.10.x | ~250KB      | PDF generation |

**Note**: Copy and Print use native APIs with zero additional dependencies.

## Acceptance Criteria

- [ ] Copy button copies plain text obituary content to clipboard
- [ ] Copy shows success toast on completion
- [ ] Print button opens browser print dialog
- [ ] Print shows only obituary content (no UI chrome)
- [ ] PDF button generates downloadable PDF file
- [ ] PDF filename includes entry name (e.g., "john-doe-obituary.pdf")
- [ ] PDF shows loading state during generation
- [ ] All buttons disabled during edit mode
- [ ] All buttons accessible (keyboard navigable, labeled)
- [ ] Works on Chrome, Firefox, Safari, Edge

## Risks & Mitigations

| Risk                          | Impact | Mitigation                                 |
| ----------------------------- | ------ | ------------------------------------------ |
| html2pdf.js bundle size       | Medium | Dynamic import, load on demand             |
| PDF rendering quality         | Medium | Configure scale: 2 for retina              |
| Clipboard API browser support | Low    | Fallback to legacy `execCommand` if needed |
| Print styling inconsistencies | Low    | Test across browsers, use standard CSS     |

## Questions - Resolved

1. **Include entry metadata in PDF header?** → Yes, include basic metadata
2. **Add Share button?** → Yes, as UI placeholder (implementation TBD)
3. **PDF generation client-side or server-side?** → Client-side
4. **PDF formatting requirements?** → Clean, professional, maximum readability. Include attribution/link to Death Matter Tools (deathmattertools.com)

---

**Status**: Implemented  
**Author**: AI Assistant  
**Date**: December 5, 2025
