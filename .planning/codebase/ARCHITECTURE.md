# Architecture

**Analysis Date:** 2026-02-14

## Pattern Overview

**Overall:** Full-stack Next.js 16 App Router with server-side rendering, server actions, and Drizzle ORM database layer.

**Key Characteristics:**
- Server Components by default with selective `'use client'` boundaries
- Server Actions (`"use server"`) for form handling and mutations
- Next.js 16 Cache Components with granular cache tagging and revalidation
- Type-safe database queries with Drizzle ORM and inferred types
- Role-based access control with Clerk authentication and organization support
- Jotai atom-based client state management to avoid prop drilling
- Streaming text generation for AI features via Vercel AI SDK
- Text anchoring system for precise comment positioning in documents

## Layers

**Presentation Layer:**
- Purpose: React components for UI rendering
- Location: `src/components/`
- Contains: Layout components, UI primitives (Shadcn/Radix), feature sections, annotations
- Depends on: Client state (Jotai atoms), server queries, auth utilities
- Used by: App Router pages in `src/app/`

**Server Actions & Route Handlers:**
- Purpose: Handle form submissions and HTTP requests
- Location: `src/actions/` and `src/app/api/`
- Contains: Validated form handlers, webhook receivers, streaming endpoints
- Depends on: Database mutations, Clerk auth, cache invalidation
- Used by: Forms and fetch requests from client/server

**Database Layer:**
- Purpose: Structured access to PostgreSQL via Drizzle ORM
- Location: `src/lib/db/`
- Contains:
  - `schema/` - Table definitions with relations
  - `queries/` - Read operations (prefixed `get*`)
  - `mutations/` - Write operations (prefixed `create*`, `update*`, `delete*`)
  - `utils.ts` - Custom Drizzle configuration
- Depends on: Neon PostgreSQL connection
- Used by: Server actions and server components

**Business Logic Layer:**
- Purpose: AI generation, document processing, validation
- Location: `src/lib/ai/`, `src/lib/annotations/`, `src/lib/document-status/`
- Contains: Prompt engineering, text anchoring algorithms, status workflows
- Depends on: Database layer, LLM providers
- Used by: Server actions and components

**Client State Management:**
- Purpose: UI state without prop drilling
- Location: `src/lib/state.ts`
- Contains: Jotai atoms for modals, editor states, async processing flags
- Depends on: Jotai library
- Used by: Client components

**Configuration & Utilities:**
- Purpose: Constants, helpers, type definitions
- Location: `src/lib/config.ts`, `src/lib/helpers.ts`, `src/lib/utils.ts`
- Contains: App metadata, formatting functions, type-safe utilities
- Used by: All layers

## Data Flow

**Entry Creation Flow:**

1. User submits form in `src/components/sections/dashboard/create-form.tsx` (client component)
2. Form data sent to `src/actions/entries.ts` → `createEntryAction` (server action)
3. Action validates with Zod, checks auth via Clerk
4. `src/lib/db/mutations/entries.ts` → `createEntry()` inserts to `EntryTable`
5. Image data validated and stored if present
6. Cache invalidated: `revalidateTag(entryListTag(userId))`
7. Redirect to entry detail page

**Obituary Generation Flow:**

1. User triggers generation in `src/components/sections/obituaries/generate.tsx`
2. Calls server action in `src/actions/obituaries.ts` (or API route)
3. Fetches entry details, saved quotes, AI model preference via database queries
4. `src/lib/ai/prompts.ts` constructs system prompt + few-shot examples
5. `src/lib/ai/models.ts` selects provider (OpenAI, Anthropic, OpenRouter)
6. `streamText()` from Vercel AI SDK streams response with word-level chunking
7. Client receives streamed text via `createStreamableValue()`
8. `src/lib/db/mutations/documents.ts` → `saveDocument()` persists completed obituary
9. Token usage tracked for billing

**Comment Creation & Text Anchoring:**

1. User selects text in document viewer in `src/components/sections/obituaries/obituary-viewer-with-comments.tsx`
2. Anchor data extracted by `src/lib/annotations/extract-anchor.ts`:
   - `anchorStart`, `anchorEnd` - character positions
   - `anchorText` - exact selected text
   - `anchorPrefix`, `anchorSuffix` - surrounding context
3. Form submitted to `src/actions/comments.ts` → `createCommentAction`
4. `src/lib/db/mutations/comments.ts` → `createComment()` with anchor data
5. Comment inserted with `status='pending'` (requires moderation)
6. Organization admin reviews via `src/components/sections/obituaries/comment-content.tsx`
7. Calls `updateDocumentCommentStatus()` to approve/deny
8. Anchor validity checked by `src/lib/annotations/position-calculator.ts` on document edits

**Pre-Need Survey Sharing Flow:**

1. Entry owner creates survey via `src/components/sections/entries/survey-prompt-modal.tsx`
2. Server action `createPreNeedSurveyAction` in `src/actions/pre-need-survey.ts`
3. `src/lib/db/mutations/pre-need-survey.ts` → `createPreNeedSurvey()` generates share token
4. Survey response form at `src/app/survey/[token]/page.tsx` (public route)
5. Guest fills survey fields (optional, many nullable fields)
6. `upsertSurveyResponse()` saves responses progressively
7. Entry owner harvests responses via `src/components/sections/entries/survey-harvest-dialog.tsx`
8. `src/lib/survey-to-entry-mapping.ts` maps survey data to entry details
9. Entry updated with harvested data

**State Management (Client):**

Jotai atoms in `src/lib/state.ts` manage UI state without prop drilling:
- `createFormAtom` - Create entry modal visibility
- `entryImageAtom` - Uploaded entry image URL
- `isEditingObituaryAtom` - Text editor active state (disables AI during editing)
- `obituaryUpdateProcessingAtom` - AI generation in progress
- `prefilledChatMessageAtom` - Message to inject into AI chat
- `expandChatBubbleAtom` - Trigger chat bubble expansion

**Caching Strategy:**

Next.js 16 Cache Components configured in `next.config.ts`:
- `dashboard` - Short (1m stale, 30s revalidate) for entry lists
- `content` - Moderate (5m stale, 1m revalidate) for document content
- `realtime` - Very short (30s stale, 15s revalidate) for comments
- `static` - Long (1h stale, 30m revalidate) for marketing pages

Cache tags defined in `src/lib/cache.ts`:
- User-scoped: `entryListTag(userId)`, `documentsByEntryTag(entryId)`
- Organization-scoped: `orgEntriesTag(orgId)`
- Global: `publicDocumentsTag`

Invalidation on mutation: `revalidateTag(tagName)`

## Key Abstractions

**Entry Access Control:**
- Purpose: Centralize permission checks across all queries
- Examples: `src/lib/db/queries/entries.ts` → `getEntryWithAccess()`
- Pattern: Returns `EntryAccessResult` with `canEdit`, `canView`, `canDelete` flags
- Enforced in: All entry-related mutations and queries

**Document Status Workflow:**
- Purpose: Track document through approval process
- Examples: `src/lib/document-status/config.ts`, `src/lib/db/schema/documents.ts`
- Statuses: `draft` → `awaiting_review` → `needs_revisions` → `approved` → `published`
- Configuration: Icons, labels, CSS variants stored centrally

**Text Anchor System:**
- Purpose: Precise comment positioning that survives document edits
- Modules:
  - `src/lib/annotations/extract-anchor.ts` - Capture anchor on selection
  - `src/lib/annotations/position-calculator.ts` - Recalculate on document change
  - `src/lib/annotations/calculate-positions.ts` - Position comments in UI
- Fields: `anchorStart`, `anchorEnd`, `anchorText`, `anchorPrefix`, `anchorSuffix`, `anchorValid`

**Pre-Need Survey:**
- Purpose: Gather life planning details via shareable forms
- Modules:
  - `src/lib/db/schema/pre-need-survey.ts` - 14 sections covering access, contacts, documents, finances, funeral plans, digital assets, medical wishes, funeral preferences, legacy, media, goals, other info, notes, acknowledgments
  - `src/actions/pre-need-survey.ts` - Server actions for CRUD and status management
  - `src/lib/survey-to-entry-mapping.ts` - Convert survey responses to entry details
- Response tracking: Partial fills supported via nullable fields

**AI Model Selection:**
- Purpose: Support multiple LLM providers
- Location: `src/lib/ai/models.ts`
- Providers: OpenAI (gpt-4o-mini), Anthropic (claude-3-5-sonnet), OpenRouter (google/gemini-2.5-pro)
- Configuration: Fallback chain, token limits per model

**Query/Mutation Separation:**
- Purpose: Clear read/write boundaries
- Pattern:
  - Queries in `src/lib/db/queries/*` prefixed `get*`
  - Mutations in `src/lib/db/mutations/*` prefixed `create*`, `update*`, `delete*`
  - Queries wrapped in `"use cache"` for Next.js caching
  - Mutations invalidate relevant cache tags

## Entry Points

**Web Application:**
- Location: `src/app/layout.tsx`
- Triggers: Next.js server startup
- Responsibilities: Auth provider setup, global styles, header/footer wrapper, Suspense boundaries

**Dashboard:**
- Location: `src/app/dashboard/page.tsx`
- Triggers: User navigates to `/dashboard`
- Responsibilities: Entry list, statistics, create button, Suspense for async data

**Entry Detail:**
- Location: `src/app/[entryId]/page.tsx`
- Triggers: User clicks entry from dashboard
- Responsibilities: Entry sidebar, obituary list, image gallery, survey section

**Obituary Editor:**
- Location: `src/app/[entryId]/obituaries/[id]/page.tsx`
- Triggers: User opens obituary document
- Responsibilities: Render obituary content, comments, AI chat, export options

**Survey Form (Public):**
- Location: `src/app/survey/[token]/page.tsx`
- Triggers: Guest opens share link
- Responsibilities: Multi-step form, progress tracking, response saving

**API Routes:**
- `src/app/api/create/route.ts` - Chat streaming endpoint for obituary revision
- `src/app/api/uploadthing/route.ts` - File upload handler
- `src/app/api/webhooks/clerk/route.ts` - User sync webhook from Clerk

## Error Handling

**Strategy:** Fail safely with user-friendly messages, log technical details.

**Patterns:**

**Form/Action Errors:**
```typescript
// src/lib/utils.ts - action() helper
export function action<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData): Promise<T> => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.message } as T;  // Validation error
    }
    return action(result.data, formData);
  };
}
```

**Server Action Pattern:**
```typescript
// src/actions/comments.ts
export async function createCommentAction(
  _prevState: CommentActionState,
  formData: FormData
): Promise<CommentActionState> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };  // Auth check

  const result = schema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: "Invalid input" };  // Validation

  const entry = await getEntryWithAccess(id);
  if (!entry.access.canComment) return { error: "Forbidden" };  // Permission check

  try {
    await createComment(...);
    return { success: true };
  } catch (error) {
    console.error("Error creating comment:", error);  // Log for debugging
    return { error: "Failed to create comment" };  // User message
  }
}
```

**Database Query Pattern:**
- Read operations return `null` for not found (safe)
- Throw on database errors (unexpected)
- Access control checked before returning data

**HTTP API Errors:**
```typescript
// src/app/api/create/route.ts
if (!document) {
  return new Response("Document not found", { status: 404 });
}
if (chat.userId !== userId) {
  return new Response("Unauthorized", { status: 401 });
}
```

**Error Logging:**
- `console.error()` for unexpected errors (no PII)
- User receives generic "Failed to..." message
- Technical details logged server-side for debugging

## Cross-Cutting Concerns

**Logging:**
- Approach: `console.error()` for errors, `console.log()` for debugging
- Removed in production by Biome linter
- Use for permission checks and unusual flows

**Validation:**
- Framework: Zod for all inputs (forms, API requests)
- Pattern: `schema.safeParse()` with user-friendly error messages
- Applied at: Form submission, API route entry, image data integrity

**Authentication:**
- Provider: Clerk (`@clerk/nextjs`)
- Usage: `const { userId, orgId } = await auth()` in server code
- Organization support: Multi-tenant via `orgId`
- Access control: Every query checks ownership or org membership

**Authorization:**
- Pattern: Access control queries return `canEdit`, `canView`, `canDelete` flags
- Enforced at: Entry level via `getEntryWithAccess(entryId)`
- Roles: `owner`, `org_admin`, `org_member` (defined in `src/lib/auth/organization-roles.ts`)

**Rate Limiting:**
- Provider: Arcjet
- Configured in: `src/lib/env/server.ts`
- Applied to: AI generation routes, uploads

---

*Architecture analysis: 2026-02-14*
