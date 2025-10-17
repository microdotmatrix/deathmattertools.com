# PRD: Quotes & Scripture Integration Tools

**Version:** 1.0  
**Created:** 2025-01-17  
**Status:** Planning  
**Priority:** High

---

## Executive Summary

Integrate quote search (Stands4.com, axioms) and scripture lookup (Bible, Quran) tools into the UI, allowing users to search, save, and associate meaningful quotes and religious texts with memorial entries. Saved items can be incorporated into generated obituaries and memorial images, enriching the personalization and spiritual significance of each memorial.

---

## Problem Statement

### Current State
- Quote and scripture API functions exist in `/src/lib/api/quotes.ts` and `/src/lib/api/scripture.ts`
- Database schema exists (`SavedQuotesTable`) with entry and user relationships
- **No UI** to search or browse quotes/scriptures
- **No integration** with obituary generation or memorial image creation
- **No user workflow** for discovering, saving, and managing inspirational content

### User Pain Points
1. Users must manually search external sources for meaningful quotes/verses
2. No centralized library of saved inspirational content per entry
3. Cannot easily incorporate quotes into generated obituaries
4. Lack of faith-appropriate scripture lookup for religious families
5. No filtering or categorization of saved content

### Opportunity
Enable users to discover, save, and seamlessly integrate meaningful quotes and scripture into their memorial content, enhancing emotional resonance and personalization.

---

## Objectives

### Primary Goals
1. Create search UI for quotes (by keyword/author) and scripture (by keyword/faith)
2. Enable users to save quotes/scripture associated with specific entries
3. Display saved content in entry detail views
4. Integrate saved content into obituary generation workflow
5. Enable quote/scripture selection for memorial image overlays

### Success Metrics
- Users can search and save quotes/scripture in <30 seconds
- 60%+ of entries have at least one saved quote or scripture
- Saved content successfully appears in generated obituaries
- Clear visual distinction between quotes and scripture
- Support for Christianity, Islam, and secular/philosophical quotes

---

## User Stories

### As a User Creating a Memorial
- **I want to** search for meaningful quotes related to my loved one's life
- **So that** I can capture their philosophy and values
- **Acceptance:** Search by keyword or author, filter by length, save to entry

### As a Religious Family Member
- **I want to** find specific Bible verses or Quran passages
- **So that** I can honor my loved one's faith in their memorial
- **Acceptance:** Search by keyword, filter by faith tradition (Christianity/Islam), see book/chapter references

### As a User Generating an Obituary
- **I want to** see my saved quotes and select which to include
- **So that** the AI-generated obituary reflects the person's wisdom and beliefs
- **Acceptance:** View saved quotes during generation, toggle selection, AI incorporates selected content naturally

### As a User Creating Memorial Images
- **I want to** overlay a favorite quote or verse on a memorial image
- **So that** the image conveys a deeper message
- **Acceptance:** Select from saved quotes, adjust text positioning, preview before generating

---

## Technical Architecture

### Database Schema Review

#### Existing Table: `saved_quotes`
```typescript
export const SavedQuotesTable = pgTable("saved_quotes", {
  id: serial("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  entryId: text("entry_id")
    .notNull()
    .references(() => EntryTable.id, { onDelete: "cascade" }),
  quote: text("quote").notNull(),
  citation: text("citation"), // author for quotes, reference for scripture
  source: text("source"), // "Stands4.com", "Bible", "Quran", "ZenQuotes"
  length: varchar("length", { enum: ["short", "medium", "long"] })
    .notNull()
    .default("medium"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});
```

**Schema Assessment:** ✅ Current schema is adequate but should be enhanced

#### Recommended Schema Improvements
```typescript
export const SavedQuotesTable = pgTable("saved_quotes", {
  id: serial("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  entryId: text("entry_id")
    .notNull()
    .references(() => EntryTable.id, { onDelete: "cascade" }),
  
  // Core content
  quote: text("quote").notNull(),
  citation: text("citation"), // author for quotes, reference for scripture
  source: text("source"), // "Stands4.com", "Bible", "Quran", "ZenQuotes"
  
  // Enhanced categorization
  type: text("type").notNull().default("quote"), // "quote" | "scripture" | "axiom"
  faith: text("faith"), // "Christianity" | "Islam" | null for secular quotes
  book: text("book"), // For scripture: book name (e.g., "Genesis", "Al-Fatiha")
  reference: text("reference"), // For scripture: full reference (e.g., "Genesis 1:1")
  
  length: varchar("length", { enum: ["short", "medium", "long"] })
    .notNull()
    .default("medium"),
  
  // Usage tracking
  usedInObituary: boolean("used_in_obituary").default(false),
  usedInImage: boolean("used_in_image").default(false),
  
  // Metadata
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
}, (table) => ({
  entryIdIdx: index("saved_quotes_entry_id_idx").on(table.entryId),
  typeIdx: index("saved_quotes_type_idx").on(table.type),
  faithIdx: index("saved_quotes_faith_idx").on(table.faith),
}));
```

---

## Implementation Strategy

For full implementation details including:
- API Layer Enhancement
- Data Layer (Queries & Mutations)
- Component Architecture
- Integration Points
- Phase-by-Phase Breakdown (21-27 hours total)
- Security & Performance Considerations

See the detailed sections in this document starting at line 200.

---

## Quick Reference

### Key Files to Create/Modify

**Database:**
- `/src/lib/db/schema/quotes.ts` - Enhance schema
- `/src/lib/db/queries/quotes.ts` - Implement queries
- `/src/lib/db/mutations/quotes.ts` - Implement server actions

**API:**
- `/src/lib/api/saved-content.ts` - NEW: Unified search wrapper

**Components:**
- `/src/components/quotes-scripture/search-dialog.tsx` - NEW
- `/src/components/quotes-scripture/search-form.tsx` - NEW
- `/src/components/quotes-scripture/search-results.tsx` - NEW
- `/src/components/quotes-scripture/search-result-card.tsx` - NEW
- `/src/components/quotes-scripture/saved-quotes-list.tsx` - NEW
- `/src/components/quotes-scripture/saved-quote-card.tsx` - NEW
- `/src/components/quotes-scripture/quote-selector.tsx` - NEW (Phase 4)
- `/src/components/quotes-scripture/quote-overlay-editor.tsx` - NEW (Phase 5)

**Integration:**
- Entry detail page - Add `SavedQuotesList` component
- Obituary generation - Add quote selection and prompt integration
- Image generation - Add quote overlay editor

### Implementation Phases Summary

1. **Phase 1 (4-5h):** Database migration, queries, mutations, API wrapper
2. **Phase 2 (5-6h):** Search dialog, form, results, result cards
3. **Phase 3 (4-5h):** Saved quotes list, cards, entry integration
4. **Phase 4 (3-4h):** Obituary generation integration
5. **Phase 5 (3-4h):** Memorial image overlay integration
6. **Phase 6 (2-3h):** Polish, testing, documentation

**Total:** 21-27 hours

---

## Next Steps for Review

1. **Approve Schema Changes:** Confirm enhanced `saved_quotes` table structure
2. **Approve Component Architecture:** Review proposed component hierarchy
3. **Approve Integration Strategy:** Confirm obituary and image integration approach
4. **Set Priority:** Determine which phases to implement first (recommend 1-3 for MVP)
5. **Allocate Resources:** Assign implementation timeline

Once approved, proceed with Phase 1 (Database & Data Layer) implementation.
