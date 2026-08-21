import { markRedisUnavailable, redisAvailable, redisClient } from "../config/redis";

/**
 * Helper utility to pause execution for lock retry delays
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Attempt to acquire a distributed lock for a specific product ID.
 * Utilizes Redis atomic SET with EX (expiry) and NX (set if not exists) parameters.
 * 
 * @param productId Target product ID to lock
 * @param ttlSeconds Lock expiration time in seconds (to prevent deadlocks)
 * @param retryAttempts Number of retry attempts if lock is held
 * @param retryDelayMs Wait time in milliseconds between retries
 * @returns Boolean representing successful lock acquisition
 */
export const acquireLock = async (
  productId: string,
  ttlSeconds: number = 5,
  retryAttempts: number = 5,
  retryDelayMs: number = 100
): Promise<boolean> => {
  if (!redisAvailable || !redisClient) return true;
  const lockKey = `lock:product:${productId}`;

  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      // Atomic write: SETNX + EX
      const result = await redisClient.set(lockKey, "locked", "EX", ttlSeconds, "NX");

      if (result === "OK") {
        console.log(`[Redis Lock] ACQUIRED for product ${productId} (Attempt ${attempt})`);
        return true;
      }
    } catch {
      markRedisUnavailable();
      return true;
    }

    // Wait before retrying
    if (attempt < retryAttempts) {
      console.log(`[Redis Lock] Key held for product ${productId}. Retrying in ${retryDelayMs}ms... (Attempt ${attempt}/${retryAttempts})`);
      await sleep(retryDelayMs);
    }
  }

  console.warn(`[Redis Lock] FAILED to acquire lock for product ${productId} after ${retryAttempts} attempts.`);
  return false;
};

/**
 * Release a previously acquired distributed lock for a specific product ID.
 * @param productId Target product ID to unlock
 */
export const releaseLock = async (productId: string): Promise<void> => {
  if (!redisAvailable || !redisClient) return;
  const lockKey = `lock:product:${productId}`;
  try {
    await redisClient.del(lockKey);
    console.log(`[Redis Lock] RELEASED for product ${productId}`);
  } catch {
    markRedisUnavailable();
  }
};
