/**
 * Simple in-memory rate limiter.
 * Uses Redis if available (production), falls back to in-process Map (dev).
 * Limit: 5 attempts per key per 15 minutes.
 */

import { connection } from "./queue";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

// In-memory fallback for dev / when Redis is unavailable
const memStore = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(key: string): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const redisKey = `rl:${key}`;
  const now = Date.now();
  const windowSec = Math.floor(WINDOW_MS / 1000);

  try {
    // Try Redis first
    const multi = connection.multi();
    multi.incr(redisKey);
    multi.pttl(redisKey);
    const results = await multi.exec();

    const count = (results?.[0]?.[1] as number) ?? 1;
    const pttl  = (results?.[1]?.[1] as number) ?? -1;

    // Set expiry on first hit
    if (count === 1 || pttl < 0) {
      await connection.pexpire(redisKey, WINDOW_MS);
    }

    const resetAt = now + (pttl > 0 ? pttl : WINDOW_MS);
    const allowed = count <= MAX_ATTEMPTS;
    return { allowed, remaining: Math.max(0, MAX_ATTEMPTS - count), resetAt };
  } catch {
    // Redis unavailable — use in-memory fallback
    const entry = memStore.get(key);
    if (!entry || now > entry.resetAt) {
      memStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
      return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetAt: now + WINDOW_MS };
    }
    entry.count++;
    const allowed = entry.count <= MAX_ATTEMPTS;
    return { allowed, remaining: Math.max(0, MAX_ATTEMPTS - entry.count), resetAt: entry.resetAt };
  }
}
