# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Death Matter Tools is a Next.js 16 application providing AI-assisted content generation for memorial services, including obituary writing, quote generation, and memorial image creation. Built with Next.js App Router, Drizzle ORM, Clerk authentication, and integrated AI capabilities (Anthropic Claude, OpenAI, OpenRouter).

## Development Commands

### Package Manager
Use `pnpm` as the package manager (v10.17.1+).

### Core Commands
- **Development**: `pnpm dev` (with Turbopack)
- **Build**: `pnpm build` (with Turbopack)
- **Production**: `pnpm start`
- **Linting**: `pnpm lint` or `npx ultracite fix`
- **Check Code**: `npx ultracite check`

### Database (Drizzle ORM)
- **Push Schema**: `pnpm db:push` (sync schema to database without migrations)
- **Generate Migration**: `pnpm db:generate` (create migration files from schema changes)
- **Run Migrations**: `pnpm db:migrate` (apply migrations to database)
- **Drizzle Studio**: `pnpm db:studio` (GUI for database inspection)

Database schema files are in `src/lib/db/schema/`, migrations in `src/lib/db/migrations/`.

### Bundle Analysis
`pnpm analyze` - Analyze bundle size with Webpack analyzer

## Architecture

### Tech Stack
- **Framework**: Next.js 16.0.7 (App Router) with React 19.2.0
- **Database**: NeonDB (serverless PostgreSQL) with Drizzle ORM 0.44.7
- **Authentication**: Clerk
- **AI Integration**: Vercel AI SDK with Anthropic, OpenAI, and OpenRouter providers
- **File Uploads**: UploadThing
- **Email**: Resend with React Email
- **State Management**: Jotai
- **Styling**: Tailwind CSS 4.1.17 with shadcn/ui components
- **Code Quality**: Ultracite (Biome preset) for formatting and linting
- **Security**: Arcjet for rate limiting and protection

### Directory Structure

```
src/
├── actions/           # Server Actions (comments, documents, entries, etc.)
├── app/              # Next.js App Router pages and API routes
│   ├── (auth)/       # Authentication pages (sign-in, sign-up)
│   ├── [entryId]/    # Dynamic entry detail pages
│   ├── api/          # API route handlers
│   │   ├── create/   # Content creation endpoints
│   │   ├── image/    # Image generation endpoints
│   │   ├── votes/    # Voting system
│   │   └── webhooks/ # Webhook handlers (Clerk, etc.)
│   ├── dashboard/    # User dashboard and settings
│   └── (routes)      # Static routes (pricing, privacy, terms, contact)
├── components/
│   ├── ai-elements/   # AI-powered UI components
│   ├── annotations/   # Text annotation/selection components
│   ├── auth/          # Authentication components (Clerk wrapper)
│   ├── dialogs/       # Modal dialogs
│   ├── elements/      # Reusable UI elements
│   ├── forms/         # Form components
│   ├── layout/        # Header, Footer, navigation
│   ├── sections/      # Page sections (dashboard, entries, home, etc.)
│   ├── theme/         # Theme provider (next-themes)
│   └── ui/            # shadcn/ui components
├── hooks/            # Custom React hooks
├── lib/
│   ├── ai/           # AI integration (actions, prompts, models, examples)
│   ├── annotations/  # Text selection and annotation utilities
│   ├── api/          # External API integrations (quotes, scripture, email)
│   ├── auth/         # Organization roles and permissions
│   ├── db/
│   │   ├── schema/   # Drizzle schema definitions
│   │   ├── queries/  # Database read operations
│   │   └── mutations/# Database write operations
│   ├── env/          # Environment variable validation (client/server)
│   ├── services/     # Third-party service integrations (UploadThing)
│   ├── cache.ts      # Cache tag utilities for Next.js 16 caching
│   ├── config.ts     # App configuration and metadata
│   └── utils.ts      # Utility functions
└── types/            # TypeScript type definitions
```

### Key Patterns

#### Database Access Layer
- **Queries**: Read operations in `src/lib/db/queries/` using `"server-only"` directive
- **Mutations**: Write operations in `src/lib/db/mutations/`
- **Server Actions**: User-facing actions in `src/actions/`
- Use Drizzle's query builder; avoid raw SQL unless necessary
- Database instance: `db` from `src/lib/db/index.ts`

#### Caching Strategy (Next.js 16)
The app uses Next.js 16's new caching system with `"use cache"` directive and `cacheLife()` profiles defined in `next.config.ts`:
- **dashboard**: User-specific data (stale: 60s, revalidate: 30s, expire: 5m)
- **content**: Entry/document pages (stale: 5m, revalidate: 1m, expire: 1h)
- **realtime**: Comments/interactive features (stale: 30s, revalidate: 15s, expire: 2m)
- **static**: Semi-static content (stale: 1h, revalidate: 30m, expire: 1d)

Use cache tags from `src/lib/cache.ts` for targeted revalidation:
```ts
import { cacheLife, cacheTag } from 'next/cache';
import { entryListTag } from '@/lib/cache';

async function getEntries(userId: string) {
  'use cache'
  cacheLife('dashboard')
  cacheTag(entryListTag(userId))
  // ...fetch data
}
```

Legacy `unstable_cache` wrapper is deprecated; migrate to `"use cache"` directive.

#### AI Integration
- AI actions in `src/lib/ai/actions.ts` use Vercel AI SDK's `streamText()`
- Models configured in `src/lib/ai/models.ts`
- System prompts and few-shot examples in `src/lib/ai/prompts.ts` and `src/lib/ai/few-shot-examples.ts`
- Server actions return `createStreamableValue()` for streaming responses
- Use `smoothStream()` for better UX with streaming text

#### Authentication & Authorization
- Clerk handles authentication (configured in `src/components/auth/provider.tsx`)
- Organization roles defined in `src/lib/auth/organization-roles.ts`
- Use `auth()` from `@clerk/nextjs/server` in Server Components and Server Actions
- User data synced to database via Clerk webhooks (`src/app/api/webhooks/clerk/`)

#### Environment Variables
- Server env validated with Zod in `src/lib/env/server.ts` using `@t3-oss/env-nextjs`
- Client env in `src/lib/env/client.ts` (currently empty but structured for future use)
- Required vars: DATABASE_URL, BASE_URL, UPLOADTHING_TOKEN, API keys for AI services, Arcjet, Resend

#### Database Schema
Key tables:
- **users**: Synced from Clerk
- **entries**: Memorial entries (person being memorialized)
- **entry_details**: Extended information for entries
- **documents**: Generated obituaries and other documents
- **user_generated_images**: AI-generated memorial images
- **saved_quotes**: User-saved quotes/scriptures
- **chat**, **messages**, **votes**: Chat system and voting
- **entry_feedback**, **system_feedback**: User feedback

Schema uses table name prefixing (configured via `DATABASE_PREFIX` env var).

#### Component Patterns
- Use React Server Components by default
- Client Components marked with `"use client"` directive
- Server Actions for mutations (marked with `"use server"`)
- shadcn/ui components in `src/components/ui/`
- Form components use React 19 features (ref as prop instead of forwardRef)

## Code Quality Standards

This project uses **Ultracite** (Biome-based formatter/linter) for code quality. Key principles from `.cursor/rules/ultracite.mdc`:

### Type Safety
- Explicit types for function parameters/return values
- Prefer `unknown` over `any`
- Use const assertions (`as const`) for immutable values
- Leverage TypeScript's type narrowing

### Modern JavaScript/TypeScript
- Arrow functions for callbacks
- `for...of` loops over `.forEach()` and indexed `for`
- Optional chaining (`?.`) and nullish coalescing (`??`)
- Template literals over string concatenation
- Destructuring for assignments
- `const` by default, `let` only when needed, never `var`

### React Best Practices
- Function components (no class components)
- Hooks at top level only, never conditionally
- Correct dependency arrays in hooks
- Use `key` prop with unique IDs (not array indices)
- Nest children between tags (not as props)
- Don't define components inside components
- Use semantic HTML and ARIA for accessibility

### Next.js Specific
- Use Next.js `<Image>` component (not `<img>`)
- Server Components for async data fetching (not async Client Components)
- Metadata API for head elements (App Router)

### Performance
- Avoid spread in loop accumulators
- Top-level regex literals
- Specific imports over namespace imports
- Avoid barrel files (index re-exports)

### Security
- `rel="noopener"` with `target="_blank"`
- Avoid `dangerouslySetInnerHTML`, `eval()`, direct `document.cookie`
- Validate/sanitize user input

Run `npx ultracite fix` before committing to auto-fix issues.

## Next.js 16 Features

This project uses cutting-edge Next.js 16 features:
- **React Compiler**: Enabled (`reactCompiler: true`)
- **Component Caching**: Enabled (`cacheComponents: true`)
- **View Transitions**: Experimental API enabled
- **Lightning CSS**: Faster CSS processing
- **Auth Interrupts**: For authentication flows
- **Optimized Package Imports**: For lucide-react, date-fns, radix-ui, motion

TypeScript build errors are currently ignored (`ignoreBuildErrors: true`) - address this if working on production deployment.

## Common Tasks

### Creating New Database Tables
1. Add schema in `src/lib/db/schema/[table-name].ts`
2. Export from `src/lib/db/schema/index.ts`
3. Run `pnpm db:generate` to create migration
4. Run `pnpm db:push` or `pnpm db:migrate` to apply

### Adding New Server Actions
1. Create in `src/actions/[feature-name].ts` with `"use server"` directive
2. Use `auth()` for authentication
3. Validate inputs with Zod schemas
4. Use cache tag revalidation from `src/lib/cache.ts`

### Adding AI Features
1. Define prompts in `src/lib/ai/prompts.ts`
2. Add few-shot examples in `src/lib/ai/few-shot-examples.ts` if needed
3. Create server action in `src/lib/ai/actions.ts` using `streamText()`
4. Return `createStreamableValue()` for streaming to client

### Adding New Routes
- Pages: Add to `src/app/[route]/page.tsx`
- API routes: Add to `src/app/api/[route]/route.ts`
- Dynamic routes: Use `[param]` folder naming

### Working with Forms
- Use Server Actions for form submission
- Validate with Zod schemas
- Progressive enhancement (works without JS)
- Use `useFormStatus()` hook from `react-dom` for pending states
