# Product Requirement Document: Multi-Template Memorial Image Generation

## 1. Overview
The goal is to enhance the memorial image creation feature to support multiple Placid templates. Users will select a template (Bookmark, Prayer Card, etc.) and the form will dynamically adjust to collect the necessary information, auto-filling from the Entry data where possible.

## 2. Templates & Inputs

The system will support the following 4 templates, defined in `src/lib/services/placid.ts`.

### Common Inputs (All Templates)
*   **Overlay Color** (`overlay`): Hex color code. User input (Color picker).
*   **Background Image** (`background_image`): URL. User input (Image picker/URL).
*   **Portrait** (`portrait`): Image URL. Defaults to `Entry.image`. User can select from entry uploads.
*   **Name** (`name`): Text. Defaults to `Entry.name`.
*   **Birth Date** (`birth`): Text. Defaults to `Entry.dateOfBirth`.
*   **Death Date** (`death`): Text. Defaults to `Entry.dateOfDeath`.

### Template 1: Bookmark
*   **ID**: `templateIds.bookmark`
*   **Specific Inputs**:
    *   **Epitaph/Excerpt** (`epitaph`): Text. User input (Textarea).

### Template 2: Prayer Card Front
*   **ID**: `templateIds.prayerCardFront`
*   **Specific Inputs**:
    *   **Epitaph** (`epitaph`): Text. User input (Textarea).
    *   **Icon** (`icon`): Image URL. User input (Icon picker/URL).

### Template 3: Prayer Card Back
*   **ID**: `templateIds.prayerCardBack`
*   **Specific Inputs**:
    *   **Service Details** (`service`): Text. Defaults to `EntryDetails.serviceDetails`.
    *   **Prayer Icon** (`icon`): Image URL. User input (reuse Icon picker). maps to `prayer` layer in Placid.

### Template 4: Single Page Memorial
*   **ID**: `templateIds.singlePageMemorial`
*   **Specific Inputs**:
    *   **Obituary Summary** (`obit_summary`): Text. Defaults to `EntryDetails.biographicalSummary`.
    *   **Service Details** (`service`): Text. Defaults to `EntryDetails.serviceDetails`.

## 3. User Experience

1.  **Template Selection**:
    *   User lands on `/create` page.
    *   Top section allows selecting a template (Visual cards or list).
    *   Default selection: "Bookmark" (or first available).

2.  **Dynamic Form**:
    *   Below selection, the form renders fields relevant to the selected template.
    *   Fields are pre-filled with Entry data (Name, Dates, Service Details, etc.).
    *   **Overlay Color**: Simple color picker (preset palette + custom hex).
    *   **Background Image**: Option to use a default texture or upload/link a custom background.

3.  **Submission**:
    *   "Generate Image" button triggers the server action.
    *   Action determines which Placid function to call based on the selected template.
    *   Resulting image is saved to DB and displayed.

## 4. Technical Implementation

### Frontend (`src/components/sections/memorials/create-image.tsx`)
*   **State**:
    *   `selectedTemplate`: string ('bookmark' | 'prayerCardFront' | 'prayerCardBack' | 'singlePageMemorial')
    *   `formData`: Extended state object covering all possible fields.
*   **Components**:
    *   Add `TemplateSelector` component.
    *   Add `ColorPicker` for overlay.
    *   Add `BackgroundSelector` (optional, or simple URL input for now).
    *   Update inputs to show/hide based on `selectedTemplate`.

### Backend (`src/lib/db/mutations/media.ts`)
*   **Action**: `createMemorialImage(formData: PlacidCardRequest, templateKey: string, entryId: string)`
*   **Logic**:
    *   Validate user authentication.
    *   Map `templateKey` to Placid Template UUID.
    *   Switch on `templateKey` to call appropriate generator function (`generateBookmark`, etc.).
    *   Save result to `UserGeneratedImageTable`.

### Schema & Types
*   Ensure `PlacidCardRequest` in `src/lib/services/placid.ts` covers all fields.
*   (It appears to already support most, verify `icon` and `obit_summary`).

## 5. Branching Strategy
*   Feature Branch: `feature/multi-template-images`
