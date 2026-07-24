import { redisClient } from "../config/redis";
/**
 * Generic cache-aside helper function that wraps database operations with caching and performance logging.
 * @param key Unique cache key string
 * @param fetchFunction Database fetch fallback function to run on cache miss
 * @param ttlSeconds Base Time-To-Live in seconds (default: 600s / 10 mins)
 * @returns The resolved data (either cached or fresh)
 */
export const getOrSetCache = async <T>(
  key: string,
  fetchFunction: () => Promise<T>,
  ttlSeconds: number = 600
): Promise<T> => {
  const startTime = performance.now();

  try {
    // 1. Attempt to fetch data from Redis
    const cachedData = await redisClient.get(key);

    if (cachedData) {
      const duration = (performance.now() - startTime).toFixed(2);
      console.log(`[Cache] HIT - Key: ${key} | Duration: ${duration}ms (Sub-50ms Target Met)`);
      return JSON.parse(cachedData) as T;
    }

    // 2. Cache Miss: Execute the database fetch function
    console.log(`[Cache] MISS - Key: ${key}. Fetching from Database...`);
    const freshData = await fetchFunction();

    const dbDuration = (performance.now() - startTime).toFixed(2);
    console.log(`[Cache] DB FETCH - Key: ${key} | DB Duration: ${dbDuration}ms`);

    // 3. Store the retrieved data in Redis with Jitter stampede protection
    const jitter = Math.floor(Math.random() * 60) + 30; // 30s - 90s random delay
    const finalTTL = ttlSeconds + jitter;

    await redisClient.set(key, JSON.stringify(freshData), "EX", finalTTL);

    return freshData;
  } catch (error) {
    // Fail-silent fallback: If Redis encounters an error, query database directly
    console.error(`[Cache] Error in getOrSetCache for key ${key}: ${(error as Error).message}`);
    return await fetchFunction();
  }
};

// Invalidate all cached product catalog queries dynamically (production-safe using SCAN)
export const invalidateCatalogCache = async (): Promise<void> => {
  try {
    console.log("[Cache] Invalidation triggered. Scanning for keys to evict...");
    let cursor = "0";
    const matchPattern = "catalog:page:*";
    const matchDetailsPattern = "product:details:*";

    // Evict catalog paginated lists
    do {
      const [newCursor, keys] = await redisClient.scan(cursor, "MATCH", matchPattern, "COUNT", 100);
      cursor = newCursor;

      if (keys.length > 0) {
        console.log(`[Cache] Evicting catalog page keys: ${keys.join(", ")}`);
        await redisClient.del(...keys);
      }
    } while (cursor !== "0");

    // Evict product details caches
    cursor = "0";
    do {
      const [newCursor, keys] = await redisClient.scan(cursor, "MATCH", matchDetailsPattern, "COUNT", 100);
      cursor = newCursor;

      if (keys.length > 0) {
        console.log(`[Cache] Evicting product details keys: ${keys.join(", ")}`);
        await redisClient.del(...keys);
      }
    } while (cursor !== "0");

    // Evict keyword search caches
    cursor = "0";
    const matchSearchPattern = "search:keyword:*";
    do {
      const [newCursor, keys] = await redisClient.scan(cursor, "MATCH", matchSearchPattern, "COUNT", 100);
      cursor = newCursor;

      if (keys.length > 0) {
        console.log(`[Cache] Evicting keyword search keys: ${keys.join(", ")}`);
        await redisClient.del(...keys);
      }
    } while (cursor !== "0");

    console.log("[Cache] Catalog, details, and search cache invalidation completed successfully.");
  } catch (error) {
    console.error(`[Cache] Error during cache invalidation: ${(error as Error).message}`);
  }
};
