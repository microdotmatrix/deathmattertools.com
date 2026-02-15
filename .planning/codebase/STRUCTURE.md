# Codebase Structure

**Analysis Date:** 2026-02-14

## Directory Layout

```
src/
├── app/                        # Next.js App Router pages and API routes
│   ├── (auth)/                 # Authentication routes (sign-in, sign-up)
│   ├── api/                    # API routes (webhooks, uploads, streaming)
│   ├── dashboard/              # User dashboard pages
│   ├── [entryId]/              # Entry detail dynamic routes
│   │   ├── survey/             # Pre-need survey pages
│   │   ├── images/             # Memorial image pages
│   │   └── obituaries/         # Obituary pages
│   ├── survey/                 # Public survey landing pages
│   ├── share/                  # Shared document viewing (public)
│   ├── layout.tsx              # Root layout with auth provider
│   └── page.tsx                # Marketing homepage
├── components/                 # React components (mostly server)
│   ├── sections/               # Feature-specific sections (entries, documents, etc.)
│   ├── ui/                     # Shadcn/Radix primitive components
│   ├── layout/                 # Layout components (header, sidebar, footer)
│   ├── annotations/            # Comment and text anchoring UI
│   ├── ai-elements/            # AI assistant UI components
│   ├── organization/           # Organization management UI
│   └── [other]/                # Utility components
├── lib/                        # Business logic and utilities
│   ├── db/                     # Database layer (Drizzle ORM)
│   │   ├── schema/             # Table definitions
│   │   ├── queries/            # Read operations
│   │   ├── mutations/          # Write operations
│   │   ├── index.ts            # DB instance export
│   │   └── utils.ts            # Custom Drizzle setup
│   ├── ai/                     # AI/LLM integration
│   ├── annotations/            # Text anchoring system
│   ├── auth/                   # Authentication utilities
│   ├── services/               # Third-party integrations
│   ├── state.ts                # Jotai atoms for client state
│   ├── cache.ts                # Cache tag helpers
│   ├── config.ts               # App configuration and metadata
│   ├── utils.ts                # Utility functions
│   └── [other]/                # Other helpers
├── actions/                    # Server actions (form handlers)
├── hooks/                      # Custom React hooks
└── env/                        # Environment variable validation
```

## Directory Purposes

**src/app/**
- Purpose: Next.js App Router pages and API routes
- Contains: Page components, layout files, API route handlers
- Key files: `layout.tsx` (root), `page.tsx` (homepage), `dashboard/page.tsx` (main app)

**src/app/(auth)/**
- Purpose: Authentication routes
- Contains: Sign-in and sign-up pages (Clerk-managed)
- Key files: `sign-in/[[...sign-in]]/page.tsx`, `sign-up/[[...sign-up]]/page.tsx`

**src/app/api/**
- Purpose: API routes for webhooks, uploads, and streaming
- Contains: HTTP handlers and webhook receivers
- Key files:
  - `create/route.ts` - Chat streaming for obituary revision
  - `uploadthing/route.ts` - File upload handler
  - `webhooks/clerk/route.ts` - User sync from Clerk

**src/app/dashboard/**
- Purpose: User workspace dashboard
- Contains: Entry list, statistics, settings pages
- Key files: `page.tsx` (main dashboard), `feedback/page.tsx`, `settings/page.tsx`

**src/app/[entryId]/**
- Purpose: Entry detail pages and nested resources
- Contains: Entry overview, obituary editor, images, survey
- Dynamic segment: `[entryId]` matches entry UUID
- Key files: `page.tsx` (entry detail), `layout.tsx` (entry sidebar)

**src/app/survey/**
- Purpose: Public pre-need survey forms
- Contains: Multi-step survey pages for guests
- Key files: `[token]/page.tsx` (survey form), `[token]/thank-you/page.tsx` (confirmation)

**src/app/share/**
- Purpose: Shared document viewing (public, no auth required)
- Contains: Share link resolution and document viewer
- Key files: `i/[token]/page.tsx` (image share), `d/[token]/page.tsx` (document share)

**src/components/sections/**
- Purpose: Feature-specific component collections
- Contains: UI sections for dashboard, entries, documents, feedback
- Subdirectories by feature: `dashboard/`, `entries/`, `obituaries/`, `memorials/`, etc.

**src/components/ui/**
- Purpose: Reusable UI primitives from Shadcn/Radix
- Contains: Button, Card, Dialog, Badge, etc.
- Pattern: Copy-paste from Shadcn registry, minimal local customization

**src/components/layout/**
- Purpose: Application layout containers
- Contains: Header, Footer, Sidebar, Dashboard shell
- Key files: `header.tsx`, `footer.tsx`, `dashboard-shell.tsx`

**src/components/annotations/**
- Purpose: Comment and text anchoring UI
- Contains: Comment forms, anchor badges, position indicators
- Key files: `annotatable-text.tsx`, `selection-toolbar.tsx`, `enhanced-comment-card.tsx`

**src/lib/db/**
- Purpose: Drizzle ORM database abstraction layer
- Contains: Type-safe queries and mutations
- Key files:
  - `schema/` - Table definitions (entries.ts, documents.ts, etc.)
  - `queries/` - Read operations (get*, fetched with caching)
  - `mutations/` - Write operations (create*, update*, delete*)
  - `index.ts` - Drizzle instance export

**src/lib/db/schema/**
- Purpose: PostgreSQL table definitions
- Contains: Drizzle table schemas with relations
- Key files by domain:
  - `entries.ts` - EntryTable, EntryDetailsTable
  - `documents.ts` - DocumentTable, DocumentCommentTable
  - `pre-need-survey.ts` - Survey tables and responses
  - `users.ts` - UserTable, UserUploadTable
  - `media.ts` - UserGeneratedImageTable
  - `quotes.ts` - SavedQuotesTable
  - `chat.ts` - ChatTable, MessageTable

**src/lib/db/queries/**
- Purpose: Read-only database operations
- Contains: Functions prefixed `get*` returning entities or null
- Pattern: Wrapped in `"use cache"` for Next.js caching
- Key files:
  - `entries.ts` - Entry access control and listing
  - `documents.ts` - Document retrieval
  - `comments.ts` - Comment queries
  - `pre-need-survey.ts` - Survey lookup

**src/lib/db/mutations/**
- Purpose: Write operations to database
- Contains: Functions prefixed `create*`, `update*`, `delete*`
- Pattern: Call mutations from server actions, invalidate cache after
- Key files:
  - `entries.ts` - Create/update entries
  - `documents.ts` - Save documents
  - `comments.ts` - Comment CRUD
  - `pre-need-survey.ts` - Survey operations

**src/lib/ai/**
- Purpose: LLM integration and prompt engineering
- Contains: Model selection, prompts, streaming utilities
- Key files:
  - `models.ts` - Provider config (OpenAI, Anthropic, OpenRouter)
  - `prompts.ts` - System and user prompts
  - `few-shot-examples.ts` - Example obituaries for few-shot learning
  - `providers.ts` - LLM provider setup
  - `comment-formatter.ts` - Format comments for AI context

**src/lib/annotations/**
- Purpose: Text anchoring and comment positioning
- Contains: Anchor extraction, validation, position calculation
- Key files:
  - `extract-anchor.ts` - Capture anchor data on text selection
  - `position-calculator.ts` - Recalculate positions when document changes
  - `calculate-positions.ts` - UI positioning for rendered comments
  - `user-colors.ts` - Assign colors to comment authors

**src/lib/auth/**
- Purpose: Authentication and authorization utilities
- Contains: Role checking, guest token generation
- Key files:
  - `organization-roles.ts` - Role checking functions
  - `guest-token.ts` - Guest access tokens for surveys

**src/lib/services/**
- Purpose: Third-party service integrations
- Contains: SDK/client initialization
- Key files:
  - `uploadthing.ts` - File upload service
  - `placid.ts` - Dynamic image generation
  - `placid-canvas.ts` - Canvas template management

**src/lib/state.ts**
- Purpose: Client-side state management with Jotai
- Contains: Atom definitions and hooks
- Atoms: `createFormAtom`, `entryImageAtom`, `isEditingObituaryAtom`, etc.

**src/lib/cache.ts**
- Purpose: Cache tag helpers for Next.js 16 Cache Components
- Contains: Tag generator functions
- Usage: `cacheTag(entryListTag(userId))` in cached queries

**src/lib/config.ts**
- Purpose: Application configuration and constants
- Contains: App metadata, navigation links, color scheme
- Exported: `meta` object with title, description, URL, colors

**src/lib/utils.ts**
- Purpose: Utility functions and helpers
- Contains: `cn()` for Tailwind merge, `action()` for server action validation
- Key exports: `ActionState` type, `action()` wrapper, URL helpers

**src/lib/document-status/**
- Purpose: Document workflow status configuration
- Contains: Status definitions, UI config (icons, labels, colors)
- Key files:
  - `config.ts` - Status display configuration
  - `types.ts` - Status type definitions

**src/lib/entry-feedback/**
- Purpose: Entry field feedback system
- Contains: Feedback target definitions (which entry fields are feedbackable)
- Key files: `targets.ts` - Feedback categories

**src/actions/**
- Purpose: Server actions for form submission and mutations
- Contains: Validated form handlers with auth and permission checks
- Pattern:
  - `"use server"` directive at top
  - Zod validation with `action()` helper
  - Clerk auth check
  - Permission check via `getEntryWithAccess()`
  - Database mutation
  - Cache invalidation via `revalidateTag()`
  - Return `{ success: true }` or `{ error: string }`
- Key files:
  - `entries.ts` - Entry CRUD
  - `documents.ts` - Document operations
  - `comments.ts` - Comment CRUD with moderation
  - `pre-need-survey.ts` - Survey operations
  - `obituaries.ts` - Obituary generation and updates

**src/hooks/**
- Purpose: Custom React hooks for client-side logic
- Contains: Hooks for image handling, event listeners, state management
- Key files:
  - `use-mounted.ts` - Check if component is mounted (hydration)
  - `use-mobile.ts` - Media query for mobile detection
  - `use-text-selection.ts` - Get selected text for comments
  - `use-upload-cleanup.ts` - Manage upload cleanup

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx` - Root layout with AuthProvider, AppContext
- `src/app/page.tsx` - Marketing homepage
- `src/app/dashboard/page.tsx` - Main application dashboard

**Configuration:**
- `src/lib/config.ts` - App metadata, navigation links
- `src/lib/env/server.ts` - Server-side environment validation
- `src/lib/env/client.ts` - Client-side environment exports
- `next.config.ts` - Next.js and Turbopack configuration

**Core Logic:**
- `src/lib/db/` - All database queries and mutations
- `src/lib/ai/` - LLM prompts and model selection
- `src/lib/annotations/` - Text anchoring algorithms
- `src/actions/` - Form submission handlers

**Testing:**
- Not detected - No test files found in codebase

## Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `Header.tsx`, `CreateForm.tsx`)
- Utilities: `kebab-case.ts` (e.g., `extract-anchor.ts`, `position-calculator.ts`)
- Pages: `page.tsx` or `[dynamic].tsx` (Next.js convention)
- API routes: `route.ts` (Next.js convention)
- Server actions: `*Action` suffix (e.g., `createEntryAction`, `updateCommentAction`)

**Directories:**
- Feature sections: kebab-case, plural (e.g., `entries/`, `obituaries/`, `documents/`)
- Utility modules: kebab-case (e.g., `annotations/`, `ai-elements/`)
- Database layers: `schema/`, `queries/`, `mutations/` (by operation type)

**Functions:**
- Queries: `get*` prefix (e.g., `getEntries()`, `getDocumentById()`)
- Mutations: `create*`, `update*`, `delete*` (e.g., `createEntry()`, `updateDocument()`)
- Hooks: `use*` prefix (e.g., `useMounted()`, `useEntryImage()`)
- Utilities: camelCase (e.g., `cn()`, `sanitizeText()`)

**Types:**
- Entities from schema: `Entry`, `Document`, `User` (PascalCase, no suffix)
- Component props: `*Props` suffix (e.g., `HeaderProps`)
- Action state: `*ActionState` suffix (e.g., `CommentActionState`)
- API responses: `*Response` suffix (e.g., `CreateEntryResponse`)

**Constants:**
- UPPERCASE_SNAKE_CASE (e.g., `DEFAULT_OBITUARY_LENGTH`, `DOCUMENT_STATUSES`)
- Stored in config files or near usage

## Where to Add New Code

**New Feature Component:**
- Implementation: `src/components/sections/[feature]/[component].tsx`
- Server component by default, `'use client'` only when needed
- Example: `src/components/sections/obituaries/viewer.tsx`

**New Database Table:**
- Schema: `src/lib/db/schema/[domain].ts`
- Queries: `src/lib/db/queries/[domain].ts` with `get*` functions
- Mutations: `src/lib/db/mutations/[domain].ts` with `create*/update*/delete*` functions
- Type exports: From `*Table.$inferSelect` and `*Table.$inferInsert`

**New Server Action:**
- Location: `src/actions/[domain].ts`
- Pattern:
  ```typescript
  "use server";

  type ActionState = { error?: string; success?: boolean; };

  const schema = z.object({ /* validation */ });

  export async function myAction(
    _prevState: ActionState,
    formData: FormData
  ): Promise<ActionState> {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) return { error: "Invalid input" };

    const entry = await getEntryWithAccess(id);
    if (!entry.access.canEdit) return { error: "Forbidden" };

    try {
      await mutation(result.data);
      revalidateTag(cacheTag);
      return { success: true };
    } catch (error) {
      console.error("Error:", error);
      return { error: "Failed to perform action" };
    }
  }
  ```

**New API Route:**
- Location: `src/app/api/[path]/route.ts`
- Pattern: Export `POST`, `GET`, etc. async functions
- Validation: Use Zod, return error responses with status codes
- Auth: Call `await auth()` and check `userId`

**New Page:**
- Location: `src/app/[route]/page.tsx`
- Pattern: Export default async component, use `Suspense` for async data
- Metadata: Export `const metadata: Metadata = { ... }`

**New Utility Function:**
- Location:
  - If domain-specific: `src/lib/[domain]/[function-name].ts`
  - If general: `src/lib/utils.ts` or `src/lib/helpers.ts`
- Export: Named exports, use descriptive names

**New Hook:**
- Location: `src/hooks/use-[name].ts`
- Pattern: Custom logic for repeated client-side behavior
- Example: `src/hooks/use-text-selection.ts`

**New Jotai Atom:**
- Location: `src/lib/state.ts`
- Pattern: Define atom and useAtom-like hook wrapper
- Export: Both atom and hook for easier consumption

## Special Directories

**src/app/[entryId]/**
- Purpose: Dynamic route for entry detail pages
- Dynamic segment: `[entryId]` captures UUID from URL
- Layout: `layout.tsx` wraps all nested routes with entry sidebar
- Nested routes:
  - `page.tsx` - Entry overview
  - `obituaries/[id]/page.tsx` - Obituary viewer
  - `images/page.tsx` - Image gallery
  - `survey/page.tsx` - Survey section

**src/lib/db/schema/**
- Generated: No (hand-written Drizzle schemas)
- Committed: Yes
- Purpose: Single source of truth for database structure

**src/.opencode/**, **src/.agent/**, **src/.claude/**, **src/.cursor/**
- Purpose: Development tool configurations (Claude, Cursor, etc.)
- Generated: Yes (by tools)
- Committed: Yes (some config files)
- Excluded from build: Yes

**src/.next/**, **src/.pnpm-store/**
- Purpose: Build artifacts and package cache
- Generated: Yes
- Committed: No (in .gitignore)

---

*Structure analysis: 2026-02-14*
