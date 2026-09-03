import { RateLimitResult } from "./types";

interface RateLimitRecord {
  count: number;
  resetAt: number;
  blockedUntil?: number;
}

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes window
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

// In-memory store for rate limiting failed attempts per IP
const attemptsMap = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically
function cleanupStaleRecords(): void {
  const now = Date.now();
  for (const [ip, record] of attemptsMap.entries()) {
    if (now > record.resetAt && (!record.blockedUntil || now > record.blockedUntil)) {
      attemptsMap.delete(ip);
    }
  }
}

/**
 * Extracts client IP address from standard request headers.
 * Specifically checks Cloudflare 'cf-connecting-ip', 'x-forwarded-for', and 'x-real-ip'.
 */
export function getClientIp(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown-ip";
}

/**
 * Checks if the IP is currently rate-limited/blocked.
 */
export function checkRateLimit(ip: string): RateLimitResult {
  cleanupStaleRecords();
  const now = Date.now();
  const record = attemptsMap.get(ip);

  if (!record) {
    return { isBlocked: false, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if currently in lockout duration
  if (record.blockedUntil && now < record.blockedUntil) {
    const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return {
      isBlocked: true,
      remainingAttempts: 0,
      retryAfterSeconds,
    };
  }

  // Check if window has expired
  if (now > record.resetAt) {
    attemptsMap.delete(ip);
    return { isBlocked: false, remainingAttempts: MAX_ATTEMPTS };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - record.count);
  return {
    isBlocked: record.count >= MAX_ATTEMPTS,
    remainingAttempts: remaining,
  };
}

/**
 * Records a failed attempt for an IP. Returns updated rate limit status.
 */
export function recordFailedAttempt(ip: string): RateLimitResult {
  const now = Date.now();
  const record = attemptsMap.get(ip);

  if (!record || now > record.resetAt) {
    attemptsMap.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return { isBlocked: false, remainingAttempts: MAX_ATTEMPTS - 1 };
  }

  record.count += 1;

  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION_MS;
    const retryAfterSeconds = Math.ceil(BLOCK_DURATION_MS / 1000);
    return {
      isBlocked: true,
      remainingAttempts: 0,
      retryAfterSeconds,
    };
  }

  return {
    isBlocked: false,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - record.count),
  };
}

/**
 * Resets failed attempts for an IP upon successful authentication.
 */
export function resetRateLimit(ip: string): void {
  attemptsMap.delete(ip);
}
