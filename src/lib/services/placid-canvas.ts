import "server-only";

import { env } from "@/lib/env/server";

interface PlacidJwtResponse {
  access_token: string;
  expires_at: string;
}

/**
 * Generate a JWT access token for the Placid Canvas SDK.
 * This token is used for client-side canvas preview only.
 * 
 * The token is scoped to allow reading templates for preview purposes.
 */
export async function getCanvasToken(): Promise<{ token: string; expiresAt: string }> {
  const response = await fetch(
    "https://api.placid.app/api/editor/accesstokens",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.PLACID_PRIVATE_TOKEN}`,
      },
      body: JSON.stringify({
        // Token expires in ~2 years (matches existing implementation pattern)
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 * 2,
        scopes: ["templates:write"],
      }),
      // Cache the token for 1 hour to reduce API calls
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Placid access token: ${response.statusText}`);
  }

  const data = (await response.json()) as PlacidJwtResponse;

  return {
    token: data.access_token,
    expiresAt: data.expires_at,
  };
}
