# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Death Matter Tools is a Next.js 16 full-stack application for AI-assisted obituary and eulogy generation. It's a memorial content creation platform with document management, commenting/moderation, feedback systems, and multi-user collaboration.

**Stack:** Next.js 16 (App Router + Turbopack), React 19, TypeScript, PostgreSQL (Neon), Drizzle ORM, Clerk Auth, Jotai state management, Tailwind CSS v4, Vercel AI SDK (multi-provider).

## Development Commands

```bash
pnpm dev              # Start dev server with Turbopack
pnpm build            # Production build with Turbopack
pnpm start            # Start production server
pnpm lint             # Run Biome linter
pnpm db:push          # Push schema changes to database
pnpm db:generate      # Generate Drizzle migration files
pnpm db:migrate       # Run database migrations
pnpm db:studio        # Open Drizzle Studio (database GUI)
pnpm analyze          # Analyze bundle size (ANALYZE=true)
```

**Code Quality:** This project uses Ultracite (Biome preset). Run `npx ultracite fix` to auto-format code. See `.cursor/rules/ultracite.mdc` for coding standards.

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth routes (sign-in/sign-up)
│   ├── api/               # API routes (webhooks, uploads)
│   ├── dashboard/         # User dashboard
│   └── [entryId]/         # Entry detail pages
├── components/            # React components
│   ├── sections/          # Feature sections (entries, documents, comments)
│   ├── ui/               # Shadcn/Radix UI components
│   └── layout/           # Layout components (header, sidebar, footer)
├── lib/                   # Core business logic
│   ├── db/               # Database layer (schema, queries, mutations)
│   ├── ai/               # AI/LLM integration
│   ├── auth/             # Auth utilities
│   └── services/         # Third-party service configs
├── actions/               # Server actions (form handlers)
└── hooks/                 # Custom React hooks
```

### Database Architecture (Drizzle ORM)

**Location:** `/src/lib/db/`

- **Schema:** `/schema/` - Table definitions with Drizzle relations
- **Queries:** `/queries/` - Read operations (prefixed with `get*`)
- **Mutations:** `/mutations/` - Write operations (`create*`, `update*`, `delete*`)

**Key Tables:**
- `entry` - Memorial/person records
- `document` - Obituaries/eulogies with versioning
- `document_comment` - Comments with text anchoring system
- `document_comment_status` - Comment moderation workflow
- `entry_feedback` - Targeted feedback on entry fields
- `chat` - AI conversation history
- `media` - File uploads
- `quotes` - Saved quotes/scripture

**Design Patterns:**
- Composite primary keys `(id, createdAt)` for temporal tracking
- Foreign keys with CASCADE delete
- Status enums for workflows (document status, comment moderation)
- Text anchor system: `anchorStart`, `anchorEnd`, `anchorText`, `anchorPrefix`, `anchorSuffix` fields

### Authentication & Authorization

**Provider:** Clerk (`@clerk/nextjs`)

**Pattern:**
```typescript
// Server-side auth
const { userId, orgId } = await auth();

// Check permissions
const entry = await getEntryWithAccess(entryId);
if (!entry.access.canEdit) throw new Error("Unauthorized");
```

**Access Control:** Every query uses `getEntryWithAccess()` to return access flags: `canView`, `canEdit`, `canComment`, `canDelete`.

**Multi-tenancy:** Organization ID (`orgId`) filters data for team/family collaboration.

### State Management

**Client State:** Jotai atoms in `/src/lib/state.ts`

**Key Atoms:**
- `createFormAtom` - New entry form visibility
- `entryImageAtom` - Uploaded entry image
- `isEditingObituaryAtom` - Obituary editor state
- `obituaryUpdateProcessingAtom` - AI generation status

**Usage:**
```typescript
import { useAtom } from "jotai";
import { myAtom } from "@/lib/state";

const [value, setValue] = useAtom(myAtom);
```

### Caching Strategy

**Next.js 16 Cache Components** configured in `next.config.ts`:

- `dashboard` - Short cache (1m stale, 30s revalidate)
- `content` - Moderate cache (5m stale, 1m revalidate)
- `realtime` - Very short cache (30s stale, 15s revalidate)
- `static` - Long cache (1h stale, 30m revalidate)

**Cache Tags:** Defined in `/lib/cache.ts` for granular invalidation:
```typescript
// In server component
'use cache'
cacheLife('dashboard')
cacheTag(entryListTag(userId))

// Invalidate after mutation
revalidateTag(documentTag(docId));
```

### Server Actions

**Location:** `/src/actions/`

**Pattern:**
```typescript
"use server"

export async function myAction(
  _prevState: State,
  formData: FormData
): Promise<State> {
  // 1. Auth check
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  // 2. Validate input
  const result = schema.safeParse(formData);
  if (!result.success) return { error: "Invalid input" };

  // 3. Permission check
  const entry = await getEntryWithAccess(id);
  if (!entry.access.canEdit) return { error: "Forbidden" };

  // 4. Execute mutation
  await updateEntry(id, result.data);

  // 5. Invalidate cache
  revalidateTag(entryTag(id));

  return { success: true };
}
```

**Forms:** Use `useActionState` hook for progressive enhancement.

### AI Integration

**Location:** `/src/lib/ai/`

**Providers:** Configured in `models.ts`:
- OpenAI: `gpt-4o-mini`
- Anthropic: `claude-3-5-sonnet-20240620`
- OpenRouter: `google/gemini-2.5-pro`
- Custom presets: `@preset/obituary-writer`

**Generation Flow:**
1. User submits form with entry data
2. `generateObituary()` action constructs prompt
3. Selects few-shot examples based on tone/style
4. Streams text via `streamText()` with word-chunking
5. Saves completed document with token usage

**Few-Shot Learning:** Examples in `/lib/ai/few-shot-examples.ts` reduce context tokens.

**Prompts:** System prompts in `/lib/ai/prompts.ts` for generation and revision.

### Document Workflow

**Status Flow:**
```
draft → awaiting_review → needs_revisions → approved → published
```

**Configuration:** `/lib/document-status/config.ts` defines icons, labels, variants for each status.

**Comment Moderation:**
- Comments start as `pending`
- Org admins approve/deny via `updateDocumentCommentStatus()`
- Text anchoring system tracks comment position in document
- Anchor validity tracked separately (`anchorValid`, `anchorStatus`)

### Text Anchoring System

Comments are anchored to specific document text via:
- `anchorStart` / `anchorEnd` - Character positions
- `anchorText` - Exact text being commented on
- `anchorPrefix` / `anchorSuffix` - Surrounding context
- `anchorValid` - Boolean tracking if anchor still matches

**Extraction:** `/lib/annotations/extract-anchor.ts`
**Positioning:** `/lib/annotations/position-calculator.ts`

## Important Technical Details

### Environment Variables

All environment variables validated in `/src/lib/env/server.ts` using T3 Env:

```
DATABASE_URL           # Neon PostgreSQL
CLERK_SECRET_KEY       # Clerk authentication
ANTHROPIC_API_KEY      # Claude AI
OPENAI_API_KEY         # OpenAI
OPENROUTER_API_KEY     # Multi-provider LLM
UPLOADTHING_TOKEN      # File uploads
PLACID_PRIVATE_TOKEN   # Image generation
RESEND_API_KEY         # Email service
ARCJET_KEY             # Rate limiting
```

### Performance Optimizations

- **Turbopack:** Faster dev/build (`--turbopack` flag)
- **React Compiler:** Automatic memoization (`reactCompiler: true`)
- **Component Caching:** `cacheComponents: true` in config
- **Package Import Optimization:** lucide-react, date-fns, motion auto-optimized
- **Lightning CSS:** Faster CSS processing
- **Streaming:** Obituary generation uses word-level streaming

### Type Safety

- **Strict TypeScript:** `strict: true`, `strictNullChecks: true`
- **Zod Validation:** All forms and API inputs validated
- **Drizzle Inference:** `$inferSelect`, `$inferInsert` for type safety
- **Path Aliases:** `@/*` maps to `src/*`

### Image Handling

**Services:**
- UploadThing for file uploads (`/lib/services/uploadthing.ts`)
- Placid for dynamic image generation
- Allowed remote sources: Unsplash, Cloudinary, AWS, DigitalOcean, Google

**Database:**
- `media` table for uploaded files
- `user_generated_image` for AI-generated images

## Key Patterns & Conventions

### Naming Conventions

- **Server Actions:** `*Action` suffix, always `"use server"`
- **Query Functions:** `get*` prefix in `/lib/db/queries/`
- **Mutation Functions:** `create*`, `update*`, `delete*` in `/lib/db/mutations/`
- **Atoms:** `*Atom` suffix with `use*` hook wrapper
- **Components:** PascalCase, default export
- **Types:** PascalCase interfaces, `*Props` for component props

### Error Handling

- **Forms:** Return `{ error: string }` state object
- **Actions:** Try-catch with console.error logging
- **Queries:** Return `null` for not found, throw on errors
- **Validation:** Zod `safeParse()` for safe parsing

### Component Architecture

- **Server Components:** Default in `/app` directory
- **Client Components:** Mark with `'use client'` when needed for interactivity
- **Suspense Boundaries:** Wrap async components for loading states
- **Form Submission:** Use server actions instead of API routes

## Data Flow Examples

### Entry Creation
1. Form submitted to `createEntryAction()`
2. Zod validation
3. `createEntry()` mutation inserts record
4. Cache invalidated with `revalidateTag(entryListTag(userId))`
5. Redirect to entry page

### Obituary Generation
1. Form submitted to `generateObituary()`
2. Entry + quotes fetched with access check
3. Prompt constructed with few-shot examples
4. `streamText()` streams response (word-chunking)
5. Client receives stream via `createStreamableValue()`
6. Completed document saved via `saveDocument()`
7. Quote usage tracked

### Comment Creation & Moderation
1. User selects text (creates anchor)
2. `createCommentAction()` extracts anchor data
3. Comment inserted with `status='pending'`
4. Org admin reviews and calls `updateDocumentCommentStatus()`
5. Anchor status updated separately
6. Comment visibility controlled by status

## Integration Points

- **Clerk:** User auth & organization management
- **Neon:** Serverless PostgreSQL database
- **OpenRouter:** Unified LLM provider interface
- **UploadThing:** File upload & storage
- **Placid:** Dynamic image generation for social cards
- **Resend:** Email notifications
- **Arcjet:** Rate limiting & security

## Notable Architectural Decisions

1. **Server Actions Over API Routes:** Better DX, automatic form handling, progressive enhancement
2. **Composite Primary Keys:** `(id, createdAt)` enables temporal tracking
3. **Jotai for State:** Lightweight atoms avoid Context prop drilling
4. **Multi-Provider AI:** Supports multiple LLM providers for flexibility
5. **Text Anchoring:** Precise comment positioning that survives document edits
6. **Moderation Queue:** Comments require approval for quality control
7. **Separate Query/Mutation Layers:** Clear read/write separation
8. **Status Enums:** Type-safe workflow tracking
