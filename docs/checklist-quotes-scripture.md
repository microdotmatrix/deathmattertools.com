# Implementation Checklist: Quotes & Scripture Tools

**Reference:** `prd-quotes-scripture-summary.md` | `implementation-quotes-scripture.md`

---

## Phase 1: Database & Data Layer (4-5 hours)

### Schema Migration
- [ ] Add new columns to `SavedQuotesTable`:
  - [ ] `type` (text, default "quote")
  - [ ] `faith` (text, nullable)
  - [ ] `book` (text, nullable)
  - [ ] `reference` (text, nullable)
  - [ ] `usedInObituary` (boolean, default false)
  - [ ] `usedInImage` (boolean, default false)
- [ ] Add indexes on `type`, `faith`, `entryId`
- [ ] Run `pnpm db:generate` to create migration
- [ ] Run `pnpm db:push` to apply migration
- [ ] Verify schema in Drizzle Studio (`pnpm db:studio`)

### Database Queries
- [ ] Create `/src/lib/db/queries/quotes.ts`
- [ ] Implement `getSavedQuotesByEntryId(entryId)`
- [ ] Implement `getSavedQuotesByType(entryId, type)`
- [ ] Implement `isQuoteSaved(userId, entryId, quote)`
- [ ] Add `cache()` wrapper to all queries
- [ ] Add `"server-only"` import

### Server Actions
- [ ] Create `/src/lib/db/mutations/quotes.ts`
- [ ] Add `"use server"` directive
- [ ] Implement `saveQuoteAction` with Zod validation
- [ ] Implement `deleteQuoteAction` with auth check
- [ ] Implement `updateQuoteUsageAction` (optional)
- [ ] Add `revalidatePath()` after mutations
- [ ] Test with Clerk authentication

### API Wrapper
- [ ] Create `/src/lib/api/saved-content.ts`
- [ ] Implement `searchContent(params)` function
- [ ] Integrate with `searchQuotes()` from quotes.ts
- [ ] Integrate with `searchScripture()` from scripture.ts
- [ ] Add `UnifiedSearchResult` type
- [ ] Test search with all types (quote/scripture/all)

---

## Phase 2: Core Search UI (5-6 hours)

### Search Dialog
- [ ] Create `/src/components/quotes-scripture/search-dialog.tsx`
- [ ] Add "use client" directive
- [ ] Implement dialog open/close state
- [ ] Integrate `SearchForm` component
- [ ] Integrate `SearchResults` component
- [ ] Add loading state management
- [ ] Add error handling

### Search Form
- [ ] Create `/src/components/quotes-scripture/search-form.tsx`
- [ ] Add query input field
- [ ] Add type selector (quote/scripture/all)
- [ ] Add faith selector (Christianity/Islam) - conditional
- [ ] Add author input (optional) - conditional
- [ ] Implement form submission
- [ ] Add validation

### Search Results
- [ ] Create `/src/components/quotes-scripture/search-results.tsx`
- [ ] Display results in grid/list
- [ ] Add loading skeleton
- [ ] Add empty state ("No results found")
- [ ] Add pagination (if needed)
- [ ] Map results to `SearchResultCard`

### Search Result Card
- [ ] Create `/src/components/quotes-scripture/search-result-card.tsx`
- [ ] Display quote/scripture text
- [ ] Display citation (author/reference)
- [ ] Display source badge
- [ ] Add "Save" button
- [ ] Implement save action
- [ ] Show success toast
- [ ] Disable if already saved

---

## Phase 3: Saved Content Management (4-5 hours)

### Saved Quotes List
- [ ] Create `/src/components/quotes-scripture/saved-quotes-list.tsx`
- [ ] Make it a Server Component (no "use client")
- [ ] Fetch quotes with `getSavedQuotesByEntryId()`
- [ ] Display in grid layout
- [ ] Add "Add Quote" button
- [ ] Add empty state
- [ ] Map to `SavedQuoteCard` components

### Saved Quote Card
- [ ] Create `/src/components/quotes-scripture/saved-quote-card.tsx`
- [ ] Display quote content
- [ ] Display citation and source
- [ ] Add type badge (quote/scripture)
- [ ] Add delete button with confirmation
- [ ] Add usage indicators (obituary/image)
- [ ] Implement delete action
- [ ] Show success/error toast

### Entry Page Integration
- [ ] Find entry detail page (e.g., `/src/app/[entryId]/page.tsx`)
- [ ] Import `SavedQuotesList`
- [ ] Add section for saved quotes
- [ ] Add search dialog trigger
- [ ] Add dialog state management
- [ ] Test on actual entry page

---

## Phase 4: Obituary Generation Integration (3-4 hours)

### Quote Selector Component
- [ ] Create `/src/components/quotes-scripture/quote-selector.tsx`
- [ ] Display all saved quotes for entry
- [ ] Add checkbox for each quote
- [ ] Track selected quotes
- [ ] Pass selected quotes to parent
- [ ] Add "Select All" / "Deselect All"

### Generation Logic
- [ ] Find obituary generation action/function
- [ ] Fetch saved quotes for entry
- [ ] Filter by selected IDs
- [ ] Format quotes for AI prompt
- [ ] Include in prompt context
- [ ] Update `usedInObituary` after generation
- [ ] Test quote incorporation in output

### Testing
- [ ] Create entry with saved quotes
- [ ] Generate obituary with quotes selected
- [ ] Verify quotes appear naturally in text
- [ ] Test with multiple quotes
- [ ] Test with scripture vs secular quotes

---

## Phase 5: Memorial Image Integration (3-4 hours)

### Quote Overlay Editor
- [ ] Create `/src/components/quotes-scripture/quote-overlay-editor.tsx`
- [ ] Add quote selector dropdown
- [ ] Add text positioning controls
- [ ] Add font size control
- [ ] Add text color picker
- [ ] Add preview canvas
- [ ] Implement overlay rendering

### Image Generation Integration
- [ ] Find image generation flow
- [ ] Add overlay editor to UI
- [ ] Pass selected quote to generation
- [ ] Apply text overlay to image
- [ ] Update `usedInImage` after generation
- [ ] Test with various quotes/images

---

## Phase 6: Polish & Testing (2-3 hours)

### Responsive Design
- [ ] Test on mobile (< 768px)
- [ ] Test on tablet (768-1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Adjust dialog sizes
- [ ] Adjust card layouts
- [ ] Test touch interactions

### Accessibility
- [ ] Add ARIA labels to buttons
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Add focus indicators
- [ ] Check color contrast

### Error Handling
- [ ] Test network failures
- [ ] Test authentication errors
- [ ] Test database errors
- [ ] Add user-friendly error messages
- [ ] Add retry mechanisms

### Documentation
- [ ] Update README if needed
- [ ] Document new API endpoints
- [ ] Document component props
- [ ] Add inline code comments

---

## Testing Scenarios

### Happy Path
- [ ] Search for quotes by keyword
- [ ] Search for scripture by faith
- [ ] Save quote to entry
- [ ] View saved quotes on entry
- [ ] Delete saved quote
- [ ] Generate obituary with quotes
- [ ] Create image with quote overlay

### Edge Cases
- [ ] Empty search results
- [ ] Duplicate quote save attempt
- [ ] Entry with no saved quotes
- [ ] Very long quote text
- [ ] Special characters in quotes
- [ ] Multiple simultaneous saves

### Error Cases
- [ ] Unauthenticated user attempts save
- [ ] Network timeout during search
- [ ] API rate limit reached
- [ ] Database connection failure
- [ ] Invalid entry ID

---

## Deployment Checklist

- [ ] Run database migration in production
- [ ] Verify environment variables:
  - [ ] `BIBLE_API_KEY`
  - [ ] `STANDS4_UID` (if using real API)
  - [ ] `STANDS4_TOKENID` (if using real API)
- [ ] Test in staging environment
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify mobile responsiveness

---

## Rollback Plan

If issues arise:
1. Database rollback: Revert migration (remove new columns)
2. Code rollback: Remove new components/routes
3. Monitor: Check for orphaned data
4. Communicate: Notify users of feature unavailability

---

## Success Metrics (Post-Launch)

Track after 1 week:
- [ ] % of entries with saved quotes
- [ ] Average quotes saved per entry
- [ ] Quote type distribution (quote vs scripture)
- [ ] Faith tradition usage (Christianity vs Islam)
- [ ] Quotes included in generated obituaries
- [ ] User engagement with search feature

---

## Notes

- Phases 1-3 form the MVP (search, save, display)
- Phases 4-5 can be implemented incrementally
- Consider feature flags for gradual rollout
- Monitor API usage for Stands4.com rate limits
- Consider caching API responses for performance
