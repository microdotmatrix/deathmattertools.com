import "server-only";

import * as jose from "jose";
import { env } from "@/lib/env/server";
import { nanoid } from "nanoid";

/**
 * Guest Token Payload
 * Contains the guest's identity information for commenting on shared content.
 */
export interface GuestTokenPayload {
  // Guest commenter ID (from database)
  guestId: string;
  // Guest's email address
  email: string;
  // Guest's display name
  name: string;
  // Share link token this guest accessed
  shareLinkToken: string;
  // Token fingerprint for validation
  fingerprint: string;
}

/**
 * Verified Guest Token Result
 * Returned after successful verification of a guest token.
 */
export interface VerifiedGuestToken extends GuestTokenPayload {
  // When the token was issued
  issuedAt: Date;
  // When the token expires
  expiresAt: Date;
}

// JWT configuration
const JWT_ALGORITHM = "HS256";
const JWT_ISSUER = "deathmattertools";
const JWT_AUDIENCE = "guest-commenter";
// Guest tokens expire after 7 days
const JWT_EXPIRATION = "7d";

/**
 * Get the secret key for JWT signing/verification.
 * Encodes the secret as a Uint8Array for use with jose.
 */
function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(env.SHARE_LINK_SECRET);
}

/**
 * Generate a unique fingerprint for a guest token.
 * This is stored in the database for token lookup/revocation.
 */
export function generateTokenFingerprint(): string {
  return nanoid(16);
}

/**
 * Create a JWT for a guest commenter.
 *
 * @param payload - Guest information to encode in the token
 * @returns Signed JWT string
 */
export async function createGuestToken(
  payload: Omit<GuestTokenPayload, "fingerprint"> & { fingerprint?: string }
): Promise<{ token: string; fingerprint: string }> {
  const fingerprint = payload.fingerprint || generateTokenFingerprint();

  const fullPayload: GuestTokenPayload = {
    ...payload,
    fingerprint,
  };

  const token = await new jose.SignJWT(fullPayload as unknown as jose.JWTPayload)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(JWT_EXPIRATION)
    .setSubject(payload.guestId)
    .sign(getSecretKey());

  return { token, fingerprint };
}

/**
 * Verify a guest commenter JWT and extract the payload.
 *
 * @param token - The JWT to verify
 * @returns Verified token payload or null if invalid
 */
export async function verifyGuestToken(
  token: string
): Promise<VerifiedGuestToken | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getSecretKey(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    // Validate required fields
    const guestId = payload.guestId as string | undefined;
    const email = payload.email as string | undefined;
    const name = payload.name as string | undefined;
    const shareLinkToken = payload.shareLinkToken as string | undefined;
    const fingerprint = payload.fingerprint as string | undefined;

    if (!guestId || !email || !name || !shareLinkToken || !fingerprint) {
      console.error("Guest token missing required fields");
      return null;
    }

    return {
      guestId,
      email,
      name,
      shareLinkToken,
      fingerprint,
      issuedAt: new Date((payload.iat ?? 0) * 1000),
      expiresAt: new Date((payload.exp ?? 0) * 1000),
    };
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      console.log("Guest token expired");
    } else if (error instanceof jose.errors.JWTClaimValidationFailed) {
      console.log("Guest token claim validation failed");
    } else {
      console.error("Guest token verification failed:", error);
    }
    return null;
  }
}

/**
 * Extract the guest token from a cookie value or Authorization header.
 * Supports both "Bearer <token>" format and raw token.
 *
 * @param value - The cookie or header value
 * @returns The extracted token or null
 */
export function extractGuestToken(value: string | null | undefined): string | null {
  if (!value) return null;

  // Handle Bearer token format
  if (value.startsWith("Bearer ")) {
    return value.slice(7);
  }

  // Return raw token
  return value;
}

/**
 * Cookie name for storing guest tokens
 */
export const GUEST_TOKEN_COOKIE = "guest_token";

/**
 * Get cookie options for the guest token.
 * Uses secure cookies in production.
 */
export function getGuestTokenCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    name: GUEST_TOKEN_COOKIE,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  };
}
