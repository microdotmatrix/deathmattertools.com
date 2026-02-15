# Technology Stack

**Analysis Date:** 2026-02-14

## Languages

**Primary:**
- TypeScript 5.9.3 - All source code (`src/` directory), strict mode with strict null checks enabled

**Secondary:**
- JavaScript - Package scripts and configuration files
- HTML - Via JSX/TSX components in React

## Runtime

**Environment:**
- Node.js - No specific version pinned in `.nvmrc`, relies on package manager configuration
- Edge Runtime support via Next.js 16 App Router

**Package Manager:**
- pnpm 10.26.1 - Specified in `package.json` packageManager field
- Lockfile: Present (pnpm-lock.yaml inferred)

## Frameworks

**Core:**
- Next.js 16.1.3 - Full-stack web framework with App Router, Turbopack support
- React 19.2.3 - UI library, component framework
- React DOM 19.2.3 - DOM rendering

**Data Layer:**
- Drizzle ORM 0.44.7 - TypeScript ORM for PostgreSQL
- Drizzle Kit 0.31.8 - Migration and schema management CLI

**Styling:**
- Tailwind CSS 4.1.18 - Utility-first CSS framework
- @tailwindcss/postcss 4.1.18 - PostCSS integration
- Lightning CSS - Experimental faster CSS processing (via Next.js config)

**UI Components:**
- Radix UI (latest) - Unstyled, accessible component primitives
- shadcn/ui - Custom components built on Radix UI (imported via class-variance-authority)
- Lucide React 0.525.0 - Icon library (optimized imports enabled)

**Testing:**
- Biome 2.3.11 - Linter and formatter (Ultracite preset)
- Ultracite 7.0.11 - Opinionated code quality preset on top of Biome

**Build/Dev:**
- Turbopack - Next.js bundler (enabled for `dev` and `build` via `--turbopack` flag)
- React Compiler (babel-plugin-react-compiler 1.0.0) - Automatic memoization (enabled in next.config.ts)
- @next/bundle-analyzer 16.1.1 - Bundle size analysis (conditionally enabled via ANALYZE env)

## Key Dependencies

**Critical:**
- @clerk/nextjs 6.36.7 - Authentication and user/organization management
- @t3-oss/env-nextjs 0.13.10 - Environment variable validation
- Zod 4.3.5 - Schema validation library

**AI & LLM:**
- ai 5.0.121 - Vercel AI SDK for LLM integration
- @ai-sdk/anthropic 2.0.57 - Anthropic Claude provider
- @ai-sdk/openai 2.0.89 - OpenAI provider
- @ai-sdk/react 2.0.123 - React hooks for streaming
- @ai-sdk/rsc 1.0.123 - React Server Components streaming
- @openrouter/ai-sdk-provider 1.5.4 - Multi-provider LLM abstraction

**State Management:**
- Jotai 2.16.2 - Lightweight atom-based state management

**Database & Storage:**
- @neondatabase/serverless 1.0.2 - Neon PostgreSQL serverless driver
- uploadthing 7.7.4 - File upload and storage service
- @uploadthing/react 7.3.3 - React components for UploadThing

**Email & Notifications:**
- Resend 6.7.0 - Email service for transactional emails

**Document & Content:**
- @tiptap/react 3.15.3 - Rich text editor framework
- @tiptap/starter-kit 3.15.3 - Editor extensions (bold, italic, headings, etc.)
- @tiptap/pm 3.15.3 - ProseMirror state management
- html2canvas 1.4.1 - HTML to canvas rendering for screenshots
- html2pdf.js 0.12.1 - PDF generation from HTML
- jspdf 3.0.4 - PDF document generation
- Shiki 3.21.0 - Syntax highlighting library
- Streamdown 1.6.11 - Markdown parsing and streaming
- react-image-crop 11.0.10 - Image cropping component

**Security & Rate Limiting:**
- @arcjet/next 1.0.0-beta.15 - DDoS/bot protection and rate limiting
- @arcjet/inspect 1.0.0-beta.15 - Arcjet debugging utilities
- bcryptjs 3.0.3 - Password hashing
- jose 6.1.3 - JWT signing and verification for guest tokens

**UI/UX:**
- Motion 12.26.2 - Animation library
- Sonner 2.0.7 - Toast notifications
- Vaul 1.1.2 - Drawer component
- Embla Carousel React 8.6.0 - Carousel/slider component
- @xyflow/react 12.10.0 - Workflow/graph visualization (imported but may be unused)
- react-dropzone 14.3.8 - File drag-and-drop
- input-otp 1.4.2 - OTP input component
- react-day-picker 9.13.0 - Date picker
- react-use-measure 2.1.7 - DOM measurement hook
- use-stick-to-bottom 1.1.1 - Scroll behavior utility
- cmdk 1.1.1 - Command palette component

**Utilities:**
- date-fns 4.1.0 - Date formatting and manipulation (optimized imports enabled)
- nanoid 5.1.6 - Unique ID generator
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.4.0 - Tailwind class merging
- class-variance-authority 0.7.1 - Component variant system
- Prettier 3.7.4 - Code formatter (also installed as dev dependency)
- next-themes 0.4.6 - Dark mode theme management
- tokenlens 1.3.1 - Token counting utility
- dotenv 17.2.3 - Environment variable loading
- @react-email/components 0.5.7 - Email component library

**Type Definitions:**
- @types/react 19.2.2 - React type definitions
- @types/react-dom 19.2.1 - React DOM type definitions
- @types/node 24.10.8 - Node.js type definitions
- @types/bcryptjs 3.0.0 - bcryptjs types
- @types/react-dropzone 5.1.0 - react-dropzone types
- @types/pg 8.16.0 - PostgreSQL client types (for Drizzle)

**Infrastructure:**
- server-only 0.0.1 - Ensures code only runs on server
- @radix-ui/react-use-controllable-state 1.2.2 - Controlled component utilities
- @clerk/themes 2.4.47 - Clerk UI theme customization
- @iconify-icon/react 3.0.3 - Icon library integration
- @iconify/react 6.0.2 - Icon set support

## Configuration

**Environment:**
- Environment variables defined in `src/lib/env/server.ts` using T3 Env pattern
- Validation: Zod schema for all server-side environment variables
- Required vars: `DATABASE_URL`, `CLERK_SECRET_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `OPENROUTER_API_KEY`, `UPLOADTHING_TOKEN`, `PLACID_PRIVATE_TOKEN`, `RESEND_API_KEY`, `ARCJET_KEY`, `PEXELS_API_KEY`, `SHARE_LINK_SECRET`, `STANDS4_UID`, `STANDS4_TOKENID`, optional: `CRON_SECRET`

**Build:**
- `next.config.ts` - Next.js configuration with:
  - React Compiler enabled (`reactCompiler: true`)
  - Component caching (`cacheComponents: true`)
  - Cache life configuration with 4 tiers: `dashboard` (1m stale/30s revalidate), `content` (5m stale/1m revalidate), `realtime` (30s stale/15s revalidate), `static` (1h stale/30m revalidate)
  - Lightning CSS enabled (`useLightningcss: true`)
  - Package import optimization for `lucide-react`, `date-fns`, `motion`
  - Remote image patterns configured for Unsplash, Cloudinary, AWS, DigitalOcean, Google, UploadThing, Placid, Pexels
  - Image caching: 1 hour minimum TTL
  - Experimental view transitions and auth interrupts enabled

- `tsconfig.json` - TypeScript configuration with:
  - Target: ES2017
  - Module: esnext
  - Strict mode enabled
  - Path alias: `@/*` → `src/*`
  - Incremental compilation enabled

- `.biome.json` or biome config - Code quality via Ultracite preset (details in `.cursor/rules/ultracite.mdc`)

## Platform Requirements

**Development:**
- Node.js (version unspecified, latest LTS recommended)
- pnpm 10.26.1
- PostgreSQL-compatible database (Neon serverless recommended)
- API keys for: Clerk, OpenAI, Anthropic, OpenRouter, UploadThing, Placid, Resend, Arcjet, Stands4, Pexels

**Production:**
- Vercel platform (primary deployment target)
- Neon PostgreSQL (serverless)
- Cloudflare/AWS/DigitalOcean for CDN/image hosting
- External API integrations: Clerk, LLM providers, UploadThing, Placid, Resend, Arcjet

---

*Stack analysis: 2026-02-14*
