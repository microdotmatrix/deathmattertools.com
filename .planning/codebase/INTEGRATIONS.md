# External Integrations

**Analysis Date:** 2026-02-14

## APIs & External Services

**Authentication & Identity:**
- Clerk - User authentication, organization management, multi-tenancy
  - SDK/Client: `@clerk/nextjs` 6.36.7
  - Auth check: `auth()` imported from `@clerk/nextjs/server`
  - Organization context: `orgId` available from auth() result
  - User context: `userId` available from auth() result
  - Theme customization: `@clerk/themes` 2.4.47

**Large Language Models (Multi-Provider):**
- OpenAI - GPT-4O Mini for default generation
  - SDK: `@ai-sdk/openai` 2.0.89
  - Model: `gpt-4o-mini` (configured in `/src/lib/ai/models.ts`)
  - Auth: `OPENAI_API_KEY` environment variable
  - Alt model in providers: `gpt-4o` for chat

- Anthropic - Claude for obituary generation
  - SDK: `@ai-sdk/anthropic` 2.0.57
  - Model: `claude-3-5-sonnet-20240620` (configured in `/src/lib/ai/models.ts`)
  - Auth: `ANTHROPIC_API_KEY` environment variable

- OpenRouter - Multi-provider LLM abstraction
  - SDK: `@openrouter/ai-sdk-provider` 1.5.4
  - Auth: `OPENROUTER_API_KEY` environment variable
  - Models:
    - `google/gemini-2.5-pro` - summarizer and default
    - `@preset/obituary-writer` - custom obituary writer preset
    - `@preset/obituary-assistant` - custom assistant preset
    - `@preset/obituary-generator` - custom generator preset (in providers.ts)

**File Storage & Uploads:**
- UploadThing - File upload management with CDN
  - SDK: `uploadthing` 7.7.4, `@uploadthing/react` 7.3.3
  - Auth: `UPLOADTHING_TOKEN` environment variable
  - Router: `/src/lib/services/uploadthing.ts` exports `uploadRouter` and `utapi`
  - Endpoints:
    - `entryProfileImage` - Profile image uploads (4MB max, image format)
    - `entryGalleryImage` - Gallery images per entry (4MB max, 8 image limit per entry)
  - API Route: `/src/app/api/uploadthing/route.ts`
  - Cleanup: Cron job at `/src/app/api/cron/cleanup-orphaned-uploads/route.ts` deletes orphaned uploads after 2-hour TTL
  - Storage: Files stored at `utfs.io` and `ufs.sh` domains (configured as remote image sources in Next.js)

**Image Generation:**
- Placid - Dynamic image generation for memorial cards and social media
  - SDK: Direct HTTP API calls
  - Auth: `PLACID_PRIVATE_TOKEN` environment variable
  - Service module: `/src/lib/services/placid.ts`
  - API endpoints:
    - `/api/rest/templates` - List templates
    - `/api/rest/templates/{uuid}` - Get template details
    - `/api/rest/images` - Generate image from template
    - `/api/rest/images/{id}` - Poll image generation status
    - `/api/editor/accesstokens` - JWT token for editor access
  - Pre-defined templates: 5 templates with IDs (bookmark, prayer card front/back, single page memorial, thank you card)
  - Features: Text color contrast calculation, rate limiting (3-8 generations per minute)
  - Storage: Generated images stored at `placid-fra.fra1.digitaloceanspaces.com`

**Email Service:**
- Resend - Transactional email delivery
  - SDK: `resend` 6.7.0
  - Auth: `RESEND_API_KEY` environment variable
  - Client: Initialized in `/src/lib/services/resend.ts`
  - Sending config: `RESEND_EMAIL_FROM` and `RESEND_EMAIL_TO` environment variables
  - Components: `@react-email/components` 0.5.7 for building emails

**Security & Rate Limiting:**
- Arcjet - DDoS protection, bot detection, rate limiting
  - SDK: `@arcjet/next` 1.0.0-beta.15
  - Auth: `ARCJET_KEY` environment variable
  - Service: `/src/lib/services/arcjet.ts` exports `aj` instance
  - Rules configured:
    - Shield protection (LIVE mode)
    - Bot detection (LIVE mode, allows search engines, uptime monitors, link preview services)
    - Sliding window rate limit: 100 requests per 60 seconds

**Quote/Scripture Database:**
- Stands4 Quotes API - Scripture and quote lookup (implied by env vars)
  - Auth: `STANDS4_UID` and `STANDS4_TOKENID` environment variables
  - Usage: Likely used in `/src/lib/api/scripture.ts` for quote/scripture lookups

**Image Search (Pexels):**
- Pexels - Stock photo API for image search/selection
  - Auth: `PEXELS_API_KEY` environment variable
  - Usage: Provides free stock images for memorial backgrounds/portraits

## Data Storage

**Primary Database:**
- Neon PostgreSQL - Serverless PostgreSQL
  - Connection: `DATABASE_URL` environment variable (PostgreSQL connection string)
  - Client: `@neondatabase/serverless` 1.0.2 (HTTP driver)
  - ORM: Drizzle ORM 0.44.7 with PostgreSQL dialect
  - Initialization: `/src/lib/db/index.ts` creates db instance via `drizzle(neon(DATABASE_URL))`
  - Schema location: `/src/lib/db/schema/` contains all table definitions
  - Key tables:
    - `entry` - Memorial/person records with composite key (id, createdAt)
    - `document` - Obituaries/eulogies with version history
    - `document_comment` - Comments with text anchoring system
    - `document_comment_status` - Comment moderation workflow
    - `entry_feedback` - Targeted feedback on entry fields
    - `chat` - AI conversation history
    - `media` / `user_generated_image` - File uploads and generated images
    - `quotes` - Saved quotes/scripture
    - `organizations` - Team/family organization records
    - `pre_need_survey` - Pre-need survey responses
    - `page_content` - CMS-style content
  - Migrations: `/src/lib/db/migrations/` contains Drizzle migration files
  - Management: `drizzle-kit` CLI for push/generate/migrate operations

**File Storage:**
- UploadThing - User-uploaded images and documents
  - Hosts at: `utfs.io`, `ufs.sh` domains
  - Database table: `pending_uploads`, `user_uploads` track file metadata

- Placid Storage - Generated memorial images
  - Hosts at: `placid-fra.fra1.digitaloceanspaces.com` (DigitalOcean Spaces)
  - Database table: `user_generated_images` tracks generation status and URLs

**Caching:**
- Next.js 16 Cache Components (configured in `next.config.ts`)
  - Not a separate service, built into Next.js runtime
  - Cache tags: Defined in `/src/lib/cache.ts` for granular invalidation
  - Tiers:
    - `dashboard` - 1 minute stale, 30 second revalidate
    - `content` - 5 minute stale, 1 minute revalidate
    - `realtime` - 30 second stale, 15 second revalidate
    - `static` - 1 hour stale, 30 minute revalidate

## Authentication & Identity

**Auth Provider:**
- Clerk (`@clerk/nextjs` 6.36.7)
  - Implementation: Server-side auth via `auth()` function, webhook-based user sync
  - Auth check pattern: `const { userId, orgId } = await auth()`
  - Multi-tenancy: Supports organizations (teams/families)
  - Features: MFA, OAuth, user metadata
  - Database sync: Clerk → PostgreSQL via webhook at `/src/app/api/webhooks/clerk/route.ts`
  - Webhook events handled: `user.created`, `user.updated`, `user.deleted`

**Guest Access (Limited):**
- JWT tokens via jose library
  - Purpose: Allow guests to view/comment on shared documents without Clerk account
  - Token secret: `SHARE_LINK_SECRET` environment variable (min 32 chars)
  - Implementation: `/src/lib/auth/guest-token.ts`
  - Database: `share_links` table stores guest access tokens and expiration

## Monitoring & Observability

**Error Tracking:**
- Not detected - Relies on application-level error logging

**Logs:**
- Console-based logging (console.error, console.log)
- Webhook logging: Clerk webhook events logged in `/src/app/api/webhooks/clerk/route.ts`
- Error handling: Try-catch blocks with console.error output

**Web Vitals:**
- Endpoint: `/src/app/api/web-vitals/route.ts` (exists but implementation not detailed)

## CI/CD & Deployment

**Hosting:**
- Vercel - Primary deployment platform
  - Configuration: Minimal `vercel.json` (schema validation only)
  - Build: `next build --turbopack` command
  - Start: `next start` command
  - Environment: Variables configured in Vercel dashboard

**Database Migrations:**
- Drizzle Kit - Automated migration management
  - Commands: `pnpm db:push`, `pnpm db:generate`, `pnpm db:migrate`
  - Migrations stored in `/src/lib/db/migrations/`
  - Dialect: PostgreSQL
  - Run on deployment: Drizzle Kit handles schema sync with `db:push`

**Cron Jobs:**
- Vercel Cron - Scheduled tasks
  - Configuration: Defined in `vercel.json` (commented out in recent commits)
  - Example: `/src/app/api/cron/cleanup-orphaned-uploads/route.ts` - Deletes orphaned uploads
  - Auth: `CRON_SECRET` environment variable (16+ chars, optional - Vercel sets automatically)

**Bundle Analysis:**
- @next/bundle-analyzer - Analyze bundle size
  - Usage: `ANALYZE=true pnpm build`
  - Output: Bundle report in `.next/analyze/` directory

## Environment Configuration

**Required env vars:**
```
DATABASE_URL               # Neon PostgreSQL connection string
CLERK_SECRET_KEY          # Clerk webhook/API secret
ANTHROPIC_API_KEY         # Claude API key
OPENAI_API_KEY            # OpenAI API key
OPENROUTER_API_KEY        # OpenRouter unified LLM API key
UPLOADTHING_TOKEN         # UploadThing API token
PLACID_PRIVATE_TOKEN      # Placid image generation API key
RESEND_API_KEY            # Resend email service API key
ARCJET_KEY                # Arcjet rate limiting/security API key
PEXELS_API_KEY            # Pexels stock photo API key
STANDS4_UID               # Stands4 quotes API user ID
STANDS4_TOKENID           # Stands4 quotes API token
SHARE_LINK_SECRET         # JWT secret for guest share links (min 32 chars)
RESEND_EMAIL_FROM         # Email sender address for Resend
RESEND_EMAIL_TO           # Default email recipient for Resend
BASE_URL                  # Base URL for application (http://localhost:3000 in dev)
```

**Optional:**
```
CRON_SECRET               # Vercel cron job authentication (optional - auto-set)
```

**Secrets location:**
- Development: `.env.local` (git-ignored)
- Production: Vercel Environment Variables dashboard
- Validation: All server vars validated in `/src/lib/env/server.ts` with Zod

## Webhooks & Callbacks

**Incoming:**
- Clerk webhook - User events (create, update, delete)
  - Endpoint: `/src/app/api/webhooks/clerk/route.ts`
  - Authentication: Clerk's webhook signature verification via `verifyWebhook()`
  - Payload: User data (id, name, email, imageUrl, timestamps)
  - Action: Upserts or deletes user in PostgreSQL

- UploadThing callback - File upload completion
  - Endpoint: Configured in `/src/lib/services/uploadthing.ts`
  - Handlers: `onUploadComplete()` callbacks create database records for uploaded files
  - Actions: Insert into `pending_uploads` or `user_uploads` tables, invalidate cache

- Placid callback - Image generation status (polling-based)
  - Not webhook-based: Client polls `/api/rest/images/{id}` endpoint for status
  - No incoming webhook required

**Outgoing:**
- Not detected - No outbound webhooks configured

---

*Integration audit: 2026-02-14*
