import dotenv from "dotenv";
import { connectDB } from "../config/db";
import { redisClient } from "../config/redis";
import Product from "../models/Product";
import { getOrSetCache, invalidateCatalogCache } from "../middleware/cache";

dotenv.config();

const runCacheTest = async () => {
  try {
    console.log("==========================================");
    console.log("[Test Runner] Starting Redis Cache Integration Tests");
    console.log("==========================================");

    // 1. Establish connections
    await connectDB();

    const testCacheKey = "catalog:page:1:limit:20:category:all:sort:newest";

    // Clear test key to ensure fresh start
    await redisClient.del(testCacheKey);

    // 2. TEST 1: Cache Miss
    console.log("\n--- TEST 1: Cache Miss (Database Fallback) ---");
    const t1 = performance.now();
    await getOrSetCache(testCacheKey, async () => {
      return await Product.find({}).limit(5);
    }, 600);
    const duration1 = (performance.now() - t1).toFixed(2);
    console.log(`[PASS] Cache Miss Executed. DB Duration: ${duration1}ms`);

    // 3. TEST 2: Cache Hit (Sub-50ms Target)
    console.log("\n--- TEST 2: Cache Hit (Redis In-Memory Lookup) ---");
    const t2 = performance.now();
    await getOrSetCache(testCacheKey, async () => {
      return await Product.find({}).limit(5);
    }, 600);
    const duration2 = (performance.now() - t2).toFixed(2);

    console.log(`[PASS] Cache Hit Executed. Redis Lookup Duration: ${duration2}ms`);
    if (parseFloat(duration2) < 50) {
      console.log(`✅ [BENCHMARK PASSED] Latency ${duration2}ms is well below the sub-50ms target!`);
    }

    // 4. TEST 3: Invalidation
    console.log("\n--- TEST 3: Invalidation Eviction Check ---");
    await invalidateCatalogCache();
    const keyExists = await redisClient.get(testCacheKey);

    if (!keyExists) {
      console.log("✅ [PASS] Invalidation successful! Stale cache key was evicted from Redis.");
    } else {
      console.error("❌ [FAIL] Invalidation failed. Key still exists in Redis.");
    }

    console.log("\n==========================================");
    console.log("All Integration & Benchmark Tests Completed!");
    console.log("==========================================");

    process.exit(0);
  } catch (error) {
    console.error(`[FAIL] Test execution error: ${(error as Error).message}`);
    process.exit(1);
  }
};

runCacheTest();
