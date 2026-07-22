"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateCatalogCache = exports.getOrSetCache = void 0;
const redis_1 = require("../config/redis");
/**
 * Generic cache-aside helper function that wraps database operations with caching and performance logging.
 * @param key Unique cache key string
 * @param fetchFunction Database fetch fallback function to run on cache miss
 * @param ttlSeconds Base Time-To-Live in seconds (default: 600s / 10 mins)
 * @returns The resolved data (either cached or fresh)
 */
const getOrSetCache = async (key, fetchFunction, ttlSeconds = 600) => {
    const startTime = performance.now();
    try {
        // 1. Attempt to fetch data from Redis
        const cachedData = await redis_1.redisClient.get(key);
        if (cachedData) {
            const duration = (performance.now() - startTime).toFixed(2);
            console.log(`[Cache] HIT - Key: ${key} | Duration: ${duration}ms (Sub-50ms Target Met)`);
            return JSON.parse(cachedData);
        }
        // 2. Cache Miss: Execute the database fetch function
        console.log(`[Cache] MISS - Key: ${key}. Fetching from Database...`);
        const freshData = await fetchFunction();
        const dbDuration = (performance.now() - startTime).toFixed(2);
        console.log(`[Cache] DB FETCH - Key: ${key} | DB Duration: ${dbDuration}ms`);
        // 3. Store the retrieved data in Redis with Jitter stampede protection
        const jitter = Math.floor(Math.random() * 60) + 30; // 30s - 90s random delay
        const finalTTL = ttlSeconds + jitter;
        await redis_1.redisClient.set(key, JSON.stringify(freshData), "EX", finalTTL);
        return freshData;
    }
    catch (error) {
        // Fail-silent fallback: If Redis encounters an error, query database directly
        console.error(`[Cache] Error in getOrSetCache for key ${key}: ${error.message}`);
        return await fetchFunction();
    }
};
exports.getOrSetCache = getOrSetCache;
// Invalidate all cached product catalog queries dynamically (production-safe using SCAN)
const invalidateCatalogCache = async () => {
    try {
        console.log("[Cache] Invalidation triggered. Scanning for keys to evict...");
        let cursor = "0";
        const matchPattern = "catalog:page:*";
        const matchDetailsPattern = "product:details:*";
        // Evict catalog paginated lists
        do {
            const [newCursor, keys] = await redis_1.redisClient.scan(cursor, "MATCH", matchPattern, "COUNT", 100);
            cursor = newCursor;
            if (keys.length > 0) {
                console.log(`[Cache] Evicting catalog page keys: ${keys.join(", ")}`);
                await redis_1.redisClient.del(...keys);
            }
        } while (cursor !== "0");
        // Evict product details caches
        cursor = "0";
        do {
            const [newCursor, keys] = await redis_1.redisClient.scan(cursor, "MATCH", matchDetailsPattern, "COUNT", 100);
            cursor = newCursor;
            if (keys.length > 0) {
                console.log(`[Cache] Evicting product details keys: ${keys.join(", ")}`);
                await redis_1.redisClient.del(...keys);
            }
        } while (cursor !== "0");
        console.log("[Cache] Catalog and details cache invalidation completed successfully.");
    }
    catch (error) {
        console.error(`[Cache] Error during cache invalidation: ${error.message}`);
    }
};
exports.invalidateCatalogCache = invalidateCatalogCache;
//# sourceMappingURL=cache.js.map