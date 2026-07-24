import { Redis } from "ioredis";
import dotenv from "dotenv";


dotenv.config();

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export let redisAvailable = false;

export const redisClient = new Redis(REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy() {
    return null;
  }
});

(async () => {
  try {
    await redisClient.connect();
    redisAvailable = true;
    console.log("[Redis] Connected successfully.");
  } catch {
    redisAvailable = false;
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