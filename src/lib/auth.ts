import { SessionPayload } from "./types";

export const SESSION_COOKIE_NAME = "family_gallery_session";
export const DEFAULT_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * Constant-time string comparison to prevent timing attacks.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }

  const aLen = a.length;
  const bLen = b.length;
  let diff = aLen ^ bLen;

  for (let i = 0; i < aLen; i++) {
    const bChar = i < bLen ? b.charCodeAt(i) : 0;
    diff |= a.charCodeAt(i) ^ bChar;
  }

  return diff === 0;
}

/**
 * Validates the user-submitted family access code against the server environment secret.
 * Comparison is done in constant-time.
 */
export function verifyFamilyAccessCode(inputCode: string): boolean {
  const secretCode = process.env.FAMILY_ACCESS_CODE;
  if (!secretCode || !inputCode) {
    return false;
  }
  return timingSafeEqual(inputCode.trim(), secretCode.trim());
}

/**
 * Helper to get CryptoKey for HMAC-SHA256 from secret string using Web Crypto API.
 */
async function getHmacKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret) as unknown as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Base64URL encode utility.
 */
function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Base64URL decode utility.
 */
function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Creates a cryptographically signed session token using Web Crypto HMAC-SHA256.
 */
export async function createSessionToken(
  maxAgeSeconds: number = DEFAULT_SESSION_MAX_AGE
): Promise<string> {
  const secret =
    process.env.SESSION_SECRET ||
    "fallback-dev-secret-family-album-change-in-production-12345";
  const now = Date.now();
  const payload: SessionPayload = {
    authenticated: true,
    createdAt: now,
    expiresAt: now + maxAgeSeconds * 1000,
  };

  const payloadString = JSON.stringify(payload);
  const encoder = new TextEncoder();
  const payloadBytes = encoder.encode(payloadString);
  const payloadB64 = base64UrlEncode(payloadBytes);

  const key = await getHmacKey(secret);
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadB64) as unknown as BufferSource
  );
  const signatureB64 = base64UrlEncode(signatureBuffer);

  return `${payloadB64}.${signatureB64}`;
}

/**
 * Verifies a signed session token. Returns the payload if valid and unexpired, or null otherwise.
 */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [payloadB64, signatureB64] = parts;
  const secret =
    process.env.SESSION_SECRET ||
    "fallback-dev-secret-family-album-change-in-production-12345";

  try {
    const key = await getHmacKey(secret);
    const encoder = new TextEncoder();
    const dataToVerify = encoder.encode(payloadB64);
    const signatureBytes = base64UrlDecode(signatureB64);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as unknown as BufferSource,
      dataToVerify as unknown as BufferSource
    );

    if (!isValid) {
      return null;
    }

    const payloadBytes = base64UrlDecode(payloadB64);
    const decoder = new TextDecoder();
    const payload: SessionPayload = JSON.parse(decoder.decode(payloadBytes));

    // Verify payload schema and expiration
    if (!payload.authenticated || typeof payload.expiresAt !== "number") {
      return null;
    }

    if (Date.now() > payload.expiresAt) {
      // Session has expired
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Returns cookie options appropriate for production (HttpOnly, Secure, SameSite).
 */
export function getSessionCookieOptions(maxAgeSeconds: number = DEFAULT_SESSION_MAX_AGE) {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
