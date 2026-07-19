import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Initialize the Redis client connection
export const redisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

// Listen to connection state events for debug logging
redisClient.on("connect", () => {
  console.log("[Redis] Client attempting connection...");
});

redisClient.on("ready", () => {
  console.log("[Redis] Client connected successfully and ready!");
});

redisClient.on("error", (error: Error) => {
  console.error(`[Redis] Connection Error: ${error.message}`);
});

redisClient.on("close", () => {
  console.log("[Redis] Connection closed.");
});
