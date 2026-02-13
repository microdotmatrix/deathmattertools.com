# Tech Stack Overview

## Project
- **Name:** deathmattertools.com
- **Type:** Next.js web application (App Router)
- **Package Manager:** pnpm 10.26.1
- **Module System:** ESM (`"type": "module"`)

## Runtime
- **Node.js:** see `package.json` (not pinned)
- **TypeScript:** 5.9.3

## Frontend
- **Next.js:** 16.1.3
- **React:** 19.2.3
- **React DOM:** 19.2.3
- **Tailwind CSS:** 4.1.18
- **UI Primitives:** Radix UI
- **Motion:** motion 12.26.2

## Backend / Data
- **Database:** PostgreSQL (Neon)
- **ORM:** Drizzle ORM 0.44.7
- **Migrations/Toolkit:** drizzle-kit 0.31.8

## Auth & Security
- **Auth:** Clerk 6.36.7
- **Auth Themes:** @clerk/themes 2.4.47
- **Edge Protection:** Arcjet 1.0.0-beta.15
- **JWT/JOSE:** jose 6.1.3

## AI / LLM
- **Vercel AI SDK:** ai 5.0.121
- **AI SDK Providers:**
  - @ai-sdk/openai 2.0.89
  - @ai-sdk/anthropic 2.0.57
  - @openrouter/ai-sdk-provider 1.5.4
  - @ai-sdk/react 2.0.123
  - @ai-sdk/rsc 1.0.123

## Email
- **Resend:** 6.7.0
- **React Email:** 0.5.7

## Storage & Uploads
- **UploadThing:** 7.7.4
- **React UploadThing:** 7.3.3

## Editor / Rich Text
- **TipTap:** 3.15.3

## Tooling & Quality
- **Biome:** 2.3.11
- **Ultracite:** 7.0.11
- **Prettier:** 3.7.4

## Notes for AI Assistants
- Use **pnpm** for all package operations.
- Assume **Next.js App Router** and **React 19** conventions.
- Prefer **Drizzle ORM** for database access.
- Prefer **Tailwind CSS v4** for styling.
- Prefer **Clerk** for auth flows.
- Avoid suggesting `npm` or `yarn` unless explicitly requested.

## Source of Truth
- See `package.json` for the canonical dependency list and versions.
