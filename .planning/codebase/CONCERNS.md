# Codebase Concerns

**Analysis Date:** 2026-02-14

## Tech Debt

**Disabled Cron Job for Upload Cleanup:**
- Issue: Orphaned file cleanup is completely disabled because Vercel Hobby plan doesn't support cron jobs
- Files: `src/app/api/cron/cleanup-orphaned-uploads/route.ts`
- Impact: Uploaded files that fail validation or are abandoned accumulate in storage, increasing costs and database bloat
- Fix approach: Migrate to Vercel Pro or implement a scheduled task service (AWS Lambda, Render Cron, etc.). When re-enabled, uncomment route and test cleanup logic with expired uploads table

**Incomplete Quote Fetching API:**
- Issue: `TODO: Implement quote fetching functions` - quote API is stubbed but not implemented
- Files: `src/lib/api/quotes.ts`
- Impact: Quote search and retrieval features may fall back to mock data or fail silently
- Fix approach: Implement real API calls to scripture/quote provider (BibleAPI, Quotable, etc.) or remove stub and use mock data consistently

**Missing Validation for Military Service Detection:**
- Issue: Military service is hardcoded to `false` with TODO to detect from entry data
- Files: `src/lib/ai/actions.ts` (line 103)
- Impact: Obituary generation cannot personalize content for veterans; AI may miss military achievements
- Fix approach: Add military-related fields to entry schema and prompt AI to detect from biographical data

**Missing Entry Completeness Validation:**
- Issue: TODO comment indicates advanced validation logic needed before obituary generation
- Files: `src/components/sections/obituaries/generate.tsx` (line 293)
- Impact: Users can attempt to generate obituaries with minimal entry data, wasting token usage
- Fix approach: Implement validation that checks for required fields (name, birth/death dates, location, cause) before allowing generation

**Image Upload Data Inconsistency:**
- Issue: validateImageData() throws errors for partial upload state, but UI may not properly handle these errors
- Files: `src/lib/db/mutations/entries.ts` (lines 24-51)
- Impact: Users see generic error messages; incomplete uploads leave orphaned records
- Fix approach: Add pre-submission validation in UI component and ensure modal properly clears on error

**Missing Replace Button in Dashboard:**
- Issue: TODO comment indicates image replace functionality was planned but not implemented
- Files: `src/components/sections/dashboard/create-form.tsx` (line 176)
- Impact: Users must delete and recreate entries to change images; no in-place replacement
- Fix approach: Implement image replacement handler using UploadThing cleanup and new upload flow

**Unsafe Type Casting in Obituary Generation:**
- Issue: `updateQuoteUsageAction({} as any, formData)` uses `any` type bypass
- Files: `src/lib/ai/actions.ts` (line 148)
- Impact: Type safety is lost; future refactoring of this action could break silently
- Fix approach: Create proper typed wrapper or call action with correct state object type

## Known Bugs

**Code Block HTML Injection Security:**
- Symptoms: `dangerouslySetInnerHTML` used for Shiki-generated HTML; biome lint explicitly bypassed
- Files: `src/components/ai-elements/code-block.tsx` (lines 114, 119)
- Trigger: Any code block rendered from AI-generated obituaries or user-pasted content
- Workaround: Shiki output is pre-sanitized, but vulnerability depends on Shiki maintainer security record
- Note: Properly documented with biome-ignore comment, but monitor for CSS injection via theme data

**localStorage Graceful Degradation:**
- Symptoms: Survey prompt dismissal falls back silently if localStorage unavailable
- Files: `src/components/sections/entries/survey-prompt-modal.tsx` (lines 54)
- Trigger: Private browsing mode, WebWorkers, or localStorage quota exceeded
- Workaround: Users may see survey prompt repeatedly, but no critical feature breaks
- Fix approach: Add toast notification when localStorage fails, provide alternative dismissal (cookie-based)

**Text Anchor Position Drift:**
- Symptoms: Comments may show as "anchor invalid" after document edits, breaking visual positioning
- Files: `src/lib/annotations/`, `src/lib/db/schema/documents.ts` (lines 94-105)
- Trigger: User edits document text, anchor positions shift
- Cause: Character positions become invalid when content changes; `anchorValid` flag isn't updated in real-time
- Workaround: Comments display with warning; anchor data preserved for recovery
- Fix approach: Implement anchor recalculation on text edit, or switch to offset-based anchoring (DOM range API)

**Chat Query N+1 Performance Issue:**
- Symptoms: Each chat retrieval may fetch multiple message sets sequentially
- Files: `src/lib/db/queries/chats.ts` (lines 79-126)
- Trigger: Viewing chat with many messages or loading chat list
- Cause: Message fetching not batched in query
- Fix approach: Load chat + messages in single query with joins and proper pagination

## Security Considerations

**localStorage Usage Without Encryption:**
- Risk: Dismissal keys and user preferences stored unencrypted; could be read via XSS
- Files: `src/components/sections/entries/survey-prompt-modal.tsx`, `src/lib/utils.ts`
- Current mitigation: Keys are non-sensitive (survey dismissal), not auth tokens
- Recommendations: Never store PII or auth data in localStorage; consider sessionStorage for ephemeral prefs; add Content Security Policy to prevent localStorage XSS access

**Placid API Token in Environment:**
- Risk: PLACID_PRIVATE_TOKEN required for all image generation requests; exposed in server-side code
- Files: `src/lib/services/placid.ts`, `.env` (not readable but present)
- Current mitigation: Environment variables isolated to server-only code; T3 Env validation enforces typing
- Recommendations: Rotate token monthly, implement rate limiting on template requests, use Vercel secrets for production

**Missing Request Validation on API Routes:**
- Risk: Cron job routes not fully re-enabled; if re-enabled, CRON_SECRET verification is critical
- Files: `src/app/api/cron/cleanup-orphaned-uploads/route.ts`
- Current mitigation: Route is disabled (commented); Vercel automatically sets CRON_SECRET header
- Recommendations: When re-enabling, add rate limiting, monitor failed auth attempts, log all deletions

**Comment Moderation Status Enum Without Validation:**
- Risk: Comment status can be set to invalid enum values if validation is bypassed
- Files: `src/lib/db/schema/documents.ts` (lines 79-83, 101-105)
- Current mitigation: Zod validation in action handlers, database enum constraints
- Recommendations: Add pre-flight validation in UI before status updates, audit comment status change logs

**Password Hashing for Survey Protection:**
- Risk: Survey passwords hashed with bcryptjs but stored without salt configuration visible
- Files: `src/actions/pre-need-survey.ts`, dependency: bcryptjs@3.0.3
- Current mitigation: bcryptjs handles salt internally; rounds configurable
- Recommendations: Verify bcryptjs is using at least 10 rounds, add password strength meter in UI, log failed survey access attempts

## Performance Bottlenecks

**Large Component Files (1000+ LOC):**
- Problem: Several components exceed 600 lines, increasing complexity and re-render cost
- Files:
  - `src/lib/api/mock.ts` (1642 lines) - Pure data but size
  - `src/components/ai-elements/prompt-input.tsx` (1378 lines) - Complex state management
  - `src/components/sections/entries/details-form.tsx` (1284 lines) - Multi-step form with validation
  - `src/components/sections/obituaries/comments-panel.tsx` (759 lines) - Threaded comments with optimistic updates
- Cause: Features bundled in single components rather than split into smaller ones
- Improvement path:
  - Extract mock data into separate data files with lazy loading
  - Split prompt input into Input, Preview, and Controls subcomponents
  - Break details form into step-based components using composition
  - Extract comment tree building into custom hook

**Text Anchor Calculation Complexity:**
- Problem: Position calculator runs on every render of comments panel; no memoization of anchor positions
- Files: `src/lib/annotations/position-calculator.ts`, `src/lib/annotations/calculate-positions.ts`
- Cause: Comments thread rebuilds anchor positions without caching
- Improvement path: Memoize anchor position calculations per document version, invalidate only on document edits

**AI-Generated Image Processing (html2canvas + jsPDF):**
- Problem: Memorial image generation uses html2canvas (known for performance issues) + jsPDF sequentially
- Files: `src/components/sections/memorials/generate-summary-dialog.tsx` (447 lines)
- Cause: Browser rendering of complex DOM → canvas → PDF
- Improvement path: Consider server-side PDF generation (Puppeteer/Playwright), implement progressive rendering with progress UI

**Placid API Polling:**
- Problem: Template fetching happens synchronously without caching
- Files: `src/lib/services/placid.ts` (lines 49-65, 75-94)
- Cause: Each component fetch refreshes template list from external API
- Improvement path: Cache template metadata with SWR or React Query, invalidate on 1-hour interval

**Database Query Pagination Gaps:**
- Problem: Some queries use `.limit(1)` without explaining why single record expected
- Files: `src/lib/db/queries/chats.ts`, `src/lib/db/queries/organization-details.ts`
- Cause: May indicate missing uniqueness constraints or query intent unclear
- Improvement path: Add database indexes, verify uniqueness constraints, use `.limit(1)` only for true single-entity queries

## Fragile Areas

**Survey Response Completion Percentage Calculation:**
- Files: `src/actions/pre-need-survey.ts` (lines 206-214)
- Why fragile: Counts field presence but not quality; empty string vs null treated as unfilled; doesn't account for conditional sections
- Safe modification: Document calculation logic in comments, add unit tests for edge cases, consider weighted scoring
- Test coverage: No tests for completion percentage logic
- Risk: Users misled about survey progress; no way to verify calculation accuracy

**Comment Tree Building and Threading Logic:**
- Files: `src/components/sections/obituaries/comments-panel.tsx` (lines 78-85)
- Why fragile: Manual tree construction from flat list; no validation that parent IDs exist; orphaned comments silently ignored
- Safe modification: Use robust tree library (e.g., treeify) or database hierarchy, add validation in mutation handlers
- Test coverage: No tests for tree construction with missing parents or cycles
- Risk: Comment threads appear broken; replies disappear silently

**Text Anchor Validity Tracking:**
- Files: `src/lib/db/schema/documents.ts` (lines 94-105)
- Why fragile: `anchorValid` boolean doesn't explain why invalid; no timestamp of when anchor broke; no recovery mechanism
- Safe modification: Expand to include `anchorInvalidReason` enum, add `anchorValidatedAt` timestamp, implement anchor repair UI
- Test coverage: No tests for anchor validation across document edits
- Risk: Users can't fix broken anchors; stale comments block document editing

**Entry Image Upload Cascade:**
- Files: `src/lib/db/mutations/entries.ts` (lines 24-51, 98-120)
- Why fragile: ImageData validation throws but no transaction rollback shown; UploadThing key tracking separate from DB
- Safe modification: Wrap in transaction, add cascade delete tests, verify orphaned uploads cleaned
- Test coverage: No tests for partial image upload failures
- Risk: Image keys deleted without URL cleanup; orphaned UploadThing files

**Survey Status Workflow Enum:**
- Files: `src/lib/db/schema/pre-need-survey.ts` (lines 20-29)
- Why fragile: State machine not enforced; any status can transition to any status; no transition validation
- Safe modification: Add state machine validator, implement guard clauses in status update action
- Test coverage: No tests for invalid state transitions
- Risk: Surveys stuck in invalid states, confusing UI flows

## Scaling Limits

**Pending Uploads Table Without TTL:**
- Current capacity: Unbounded growth of incomplete uploads
- Limit: As cron job is disabled, orphaned uploads accumulate forever
- Scaling path:
  1. Implement background job service (Bull, Temporal, or trigger-based cleanup)
  2. Add TTL index on database (PostgreSQL: DROP after 24 hours)
  3. Monitor pending_uploads table size, alert at 100k+ records

**Composite Primary Key Usage (id, createdAt):**
- Current capacity: Works at current scale but complicates querying
- Limit: Foreign key joins require both columns; indexes must include both; harder to partition
- Scaling path: For <1M records: keep as-is. For larger scale: migrate to single UUID PK + createdAt index, implement partitioning by month

**Chat Message Storage Without Pagination:**
- Current capacity: Single chat can load all messages into memory
- Limit: Chats with 10k+ messages will slow significantly; memory usage unbounded
- Scaling path: Implement cursor-based pagination, compress old messages, archive to separate table

**Organization Data Isolation:**
- Current capacity: organizationId used for filtering but no database-level isolation
- Limit: Admin with access to multiple orgs could SQL-inject to see other orgs
- Scaling path: Implement row-level security (RLS) via database policies, enforce organizationId in all queries at mutation layer

## Dependencies at Risk

**bcryptjs Maintenance Status:**
- Risk: bcryptjs@3.0.3 has limited active maintenance; no recent security audits
- Impact: If vulnerability found, may require rewriting password comparison logic
- Migration plan: Switch to `argon2` (Argon2id, OWASP recommended) or native Node.js `crypto.scrypt()` with async wrapper

**html2canvas Performance:**
- Risk: Known issues with rendering complex DOM; new versions may break memorial image generation
- Impact: Memorial card generation could fail silently or produce truncated images
- Migration plan: Test with Puppeteer/Playwright for server-side rendering, or use simpler canvas library (Canvas.js)

**Shiki (Syntax Highlighter):**
- Risk: Shiki outputs HTML; future versions may change output structure, breaking CSS
- Impact: Code blocks in AI-generated content could display incorrectly
- Migration plan: Pin Shiki version, test CSS against new versions before updating; consider vendor CSS

**Arcjet Rate Limiting (Beta):**
- Risk: Arcjet is 1.0.0-beta.15, not production-grade; API could change
- Impact: Rate limiting may stop working after deployment; customers could abuse endpoints
- Migration plan: Move to production version when available, or switch to Cloudflare Rate Limiting

## Missing Critical Features

**No Audit Logging for Survey Changes:**
- Problem: Survey status changes, client responses, and approvals are not logged
- Blocks: Compliance with regulations requiring change tracking (HIPAA, GDPR)
- Workaround: Currently user ID tracked in statusChangedBy, but no detailed action log

**No Bulk Export for Survey Data:**
- Problem: Surveys must be exported one at a time or viewed individually
- Blocks: Users managing 50+ surveys for an organization; no bulk report generation
- Workaround: Data exportable via database, but no UI for it

**No Survey Template System:**
- Problem: Every survey created from scratch; no way to save custom question sets
- Blocks: Organizations with standard survey formats must recreate manually
- Workaround: None; requires full feature implementation

**No Real-Time Collaboration on Surveys:**
- Problem: Only one user can fill out survey at a time (locking mechanism prevents concurrent edits)
- Blocks: Families with multiple people filling out same survey
- Fix approach: Implement operational transformation or CRDTs for concurrent editing

## Test Coverage Gaps

**Untested Survey Workflow:**
- What's not tested: `createSurveyAction`, `updateSurveyStatusAction`, response completion logic, expiration dates
- Files: `src/actions/pre-need-survey.ts` (entire file), `src/lib/db/mutations/pre-need-survey.ts`
- Risk: Survey creation/deletion, status transitions, and expiration could break without notice
- Priority: **High** - Core feature with user-facing consequences

**No Tests for AI Generation Error Handling:**
- What's not tested: Streaming failures, token limit exceeded, invalid model selection, rate limiting
- Files: `src/lib/ai/actions.ts`, `src/components/sections/obituaries/generate.tsx`
- Risk: AI service outages propagate confusing errors to users
- Priority: **High** - Users blocked from creating content

**No Tests for Comment Anchor Validity:**
- What's not tested: Anchor calculation, validity checking after edits, orphaned anchors, tree building with missing parents
- Files: `src/lib/annotations/`, `src/lib/db/mutations/documents.ts`
- Risk: Comments break silently; users lose feedback
- Priority: **Medium** - Impacts collaboration but not core content

**No Tests for Multi-Tenancy Access Control:**
- What's not tested: Organization boundaries, user role enforcement, cross-org data leakage
- Files: `src/lib/auth/organization-roles.ts`, `src/lib/db/queries/*` (access checks)
- Risk: One user could see another organization's data
- Priority: **High** - Security concern

**No Tests for Image Upload Lifecycle:**
- What's not tested: Upload validation, UploadThing integration, orphaned file cleanup, transaction rollback
- Files: `src/lib/db/mutations/entries.ts`, `src/components/elements/file-uploader.tsx`
- Risk: Orphaned files accumulate; database inconsistency
- Priority: **Medium** - Financial impact from storage bloat

**No Tests for Survey Response Validation:**
- What's not tested: All 150+ schema fields in SurveyResponseSchema, edge cases (empty strings, null, undefined)
- Files: `src/actions/pre-need-survey.ts` (SurveyResponseSchema definition)
- Risk: Invalid data silently accepted or rejected unpredictably
- Priority: **Medium** - Data quality issues

---

*Concerns audit: 2026-02-14*
