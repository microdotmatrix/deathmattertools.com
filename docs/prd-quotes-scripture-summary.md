# PRD Summary: Quotes & Scripture Integration Tools

**Version:** 1.0  
**Status:** Planning  
**Priority:** High  
**Estimated Time:** 21-27 hours

---

## Overview

Integrate quote search (Stands4.com, axioms) and scripture lookup (Bible, Quran) into the UI. Users can search, save, and associate meaningful quotes and religious texts with memorial entries, then incorporate them into generated obituaries and memorial images.

---

## Core Features

### 1. Search & Discovery
- **Quote Search:** By keyword or author (Stands4.com, ZenQuotes)
- **Scripture Search:** By keyword with faith filter (Bible/Quran)
- **Filtering:** Length (short/medium/long), source, author
- **UI:** Modal dialog with search form and results display

### 2. Save & Manage
- **Save to Entry:** Associate quotes/scripture with specific entries
- **View Saved:** Display all saved content on entry detail page
- **Delete:** Remove saved quotes
- **Usage Tracking:** Mark which quotes used in obituary/images

### 3. Integration
- **Obituary Generation:** Select saved quotes to include in AI-generated obituary
- **Memorial Images:** Overlay quotes on memorial images with positioning controls
- **Entry Context:** Saved quotes inform AI about person's values/beliefs

---

## Database Schema Enhancement

### Current Table: `saved_quotes`
Already exists with basic structure. Needs enhancement:

**Add columns:**
- `type`: "quote" | "scripture" | "axiom"
- `faith`: "Christianity" | "Islam" | null
- `book`: Scripture book name
- `reference`: Full scripture reference
- `usedInObituary`: boolean
- `usedInImage`: boolean

**Add indexes:**
- `type`, `faith`, `entryId`

---

## API Layer

### Existing
- `/src/lib/api/quotes.ts` - Quote search (currently mock data)
- `/src/lib/api/scripture.ts` - Bible & Quran search

### New
- `/src/lib/api/saved-content.ts` - Unified search wrapper
- `/src/lib/db/queries/quotes.ts` - Database queries
- `/src/lib/db/mutations/quotes.ts` - Server actions

---

## Component Architecture

```
/src/components/quotes-scripture/
├── search-dialog.tsx              # Main search modal
├── search-form.tsx                # Search input with filters
├── search-results.tsx             # Display results
├── search-result-card.tsx         # Result card with save button
├── saved-quotes-list.tsx          # Display saved quotes (RSC)
├── saved-quote-card.tsx           # Saved quote with actions
├── quote-selector.tsx             # Multi-select for obituary
└── quote-overlay-editor.tsx       # Quote positioning for images
```

---

## Implementation Phases

### Phase 1: Database & Data Layer (4-5h)
- Migrate schema with new columns
- Implement queries and mutations
- Create unified API wrapper
- Zod validation schemas

### Phase 2: Core Search UI (5-6h)
- SearchDialog component
- SearchForm with filters
- SearchResults display
- SearchResultCard with save

### Phase 3: Saved Content Management (4-5h)
- SavedQuotesList (RSC)
- SavedQuoteCard with actions
- Entry page integration
- Empty states

### Phase 4: Obituary Generation Integration (3-4h)
- QuoteSelector component
- Modify generation prompts
- Usage tracking
- Test AI incorporation

### Phase 5: Memorial Image Integration (3-4h)
- QuoteOverlayEditor component
- Text positioning controls
- Preview functionality
- Save with overlay

### Phase 6: Polish & Testing (2-3h)
- Responsive design
- Accessibility
- E2E testing
- Documentation

---

## Technical Stack Alignment

### Next.js 15 + RSC
- ✅ Server Components for saved quotes list
- ✅ Client Components for search and interactions
- ✅ Server Actions with "use server" directive
- ✅ React `cache()` for query memoization
- ✅ `revalidatePath()` after mutations

### Clerk Auth
- ✅ `auth()` in server actions
- ✅ User ownership verification
- ✅ Organization context support

### Drizzle ORM
- ✅ Schema with relations
- ✅ Type-safe queries
- ✅ Migration with drizzle-kit
- ✅ Neon Postgres serverless

---

## Key User Flows

### Flow 1: Search & Save Quote
1. User clicks "Add Quote" on entry page
2. Search dialog opens
3. User enters keyword, selects "Quotes"
4. Results display with author and source
5. User clicks "Save" on desired quote
6. Quote appears in saved quotes list

### Flow 2: Search & Save Scripture
1. User clicks "Add Quote" on entry page
2. Search dialog opens
3. User enters keyword, selects "Scripture"
4. User selects faith tradition (Christianity/Islam)
5. Results display with book and reference
6. User clicks "Save" on desired verse
7. Scripture appears in saved quotes list

### Flow 3: Generate Obituary with Quotes
1. User navigates to obituary generation
2. System displays saved quotes for entry
3. User selects which quotes to include
4. AI generates obituary incorporating selected quotes
5. Usage marked as `usedInObituary: true`

### Flow 4: Add Quote to Memorial Image
1. User creates memorial image
2. Click "Add Quote Overlay"
3. Select from saved quotes
4. Adjust text position and styling
5. Preview and save image

---

## Success Metrics

### Must-Have (MVP)
- Search quotes and scripture
- Save content to entries
- Display saved content
- Integrate into obituary generation
- Support Christianity and Islam

### Should-Have
- Quote overlay on images
- Usage tracking
- Mobile responsive
- Error handling

### Nice-to-Have
- Advanced filters
- Bulk management
- Quote previews

---

## Security & Performance

### Security
- Clerk auth on all mutations
- User ownership verification
- Zod validation
- Environment variables for API keys

### Performance
- React `cache()` for queries
- Lazy load search dialog
- Paginated results (50/page)
- Database indexes on key columns

---

## Next Steps

1. Review and approve PRD
2. Create database migration
3. Implement data layer (Phase 1)
4. Build search UI (Phase 2)
5. Iterate through remaining phases

Full PRD: `docs/prd-quotes-scripture-tools.md`
