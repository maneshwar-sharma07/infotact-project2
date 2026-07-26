import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const redisClient = new Redis(REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy() {
    return null; // Don't keep retrying
  }
});

(async () => {
  try {
    await redisClient.connect();
    console.log("[Redis] Connected successfully.");
  } catch {
    console.log("[Redis] Redis not available. Running without cache.");
  }
})();

// Optional logging
redisClient.on("ready", () => {
  console.log("[Redis] Ready");
});

redisClient.on("error", () => {
  // Ignore Redis errors during frontend development
  
});