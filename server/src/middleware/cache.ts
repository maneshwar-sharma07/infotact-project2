import type { Request, Response, NextFunction } from "express";
import { redisClient } from "../config/redis.js";

// Reusable middleware to cache paginated product catalog responses
export const cacheCatalog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page || "1";
    const limit = req.query.limit || "20";
    const category = req.query.category || "all";
    const sortBy = req.query.sortBy || "newest";

    // Generate a unique, structured cache key based on query parameters
    const cacheKey = `catalog:page:${page}:limit:${limit}:category:${category}:sort:${sortBy}`;

    // Query Redis cache
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log(`[Cache] HIT - Key: ${cacheKey}`);
      return res.json(JSON.parse(cachedData));
    }

    console.log(`[Cache] MISS - Key: ${cacheKey}. Fetching from MongoDB...`);

    // Override res.json to capture response payload and save it in Redis
    const originalJson = res.json.bind(res);
    res.json = (body: any): Response => {
      if (res.statusCode === 200) {
        // Cache stampede protection: Base TTL (10 mins) + random Jitter (30s to 90s)
        const baseTTL = 600;
        const jitter = Math.floor(Math.random() * 60) + 30;
        const finalTTL = baseTTL + jitter;

        redisClient.set(cacheKey, JSON.stringify(body), "EX", finalTTL).catch((err) => {
          console.error(`[Cache] Error setting key ${cacheKey}: ${err.message}`);
        });
      }
      return originalJson(body);
    };

    next();
  } catch (error) {
    // Fail-silent: If Redis fails, continue to MongoDB to ensure app availability
    console.error(`[Cache] Middleware error: ${(error as Error).message}`);
    next();
  }
};

// Invalidate all cached product catalog queries dynamically (production-safe using SCAN)
export const invalidateCatalogCache = async (): Promise<void> => {
  try {
    console.log("[Cache] Invalidation triggered. Scanning for keys to evict...");
    let cursor = "0";
    const matchPattern = "catalog:page:*";

    do {
      // SCAN is non-blocking and safe for production compared to the KEYS command
      const [newCursor, keys] = await redisClient.scan(cursor, "MATCH", matchPattern, "COUNT", 100);
      cursor = newCursor;

      if (keys.length > 0) {
        console.log(`[Cache] Evicting keys: ${keys.join(", ")}`);
        await redisClient.del(...keys);
      }
    } while (cursor !== "0");

    console.log("[Cache] Catalog cache invalidation completed successfully.");
  } catch (error) {
    console.error(`[Cache] Error during cache invalidation: ${(error as Error).message}`);
  }
};
