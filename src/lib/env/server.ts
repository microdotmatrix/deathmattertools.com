import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BASE_URL: z.string().min(1),
    UPLOADTHING_TOKEN: z.string().min(1),
    ANTHROPIC_API_KEY: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),
    OPENROUTER_API_KEY: z.string().min(1),
    PLACID_PRIVATE_TOKEN: z.string().min(1),
    STANDS4_UID: z.string().min(1),
    STANDS4_TOKENID: z.string().min(1),
    ARCJET_KEY: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    PEXELS_API_KEY: z.string().min(1),
    RESEND_EMAIL_FROM: z.string().min(1),
    RESEND_EMAIL_TO: z.string().min(1),
    // JWT secret for guest commenter tokens (min 32 chars for security)
    SHARE_LINK_SECRET: z.string().min(32),
    // Cron job secret for orphaned upload cleanup (optional - Vercel sets this automatically)
    CRON_SECRET: z.string().min(16).optional(),
  },
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: process.env,
});
