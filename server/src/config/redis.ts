import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL;
export let redisAvailable = false;

export const redisClient = new Redis(REDIS_URL ?? "redis://localhost:6379", {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy: () => null
});

const connectRedis = async (): Promise<void> => {
  if (!REDIS_URL) {
    console.log("[Redis] REDIS_URL not configured. Running without cache.");
    return;
  }
  try {
    await redisClient.connect();
    redisAvailable = true;
    console.log("[Redis] Connected successfully.");
  } catch {
    redisAvailable = false;
    console.log("[Redis] Redis not available. Running without cache.");
  }
};

void connectRedis();

redisClient.on("ready", () => {
  redisAvailable = true;
  console.log("[Redis] Ready");
});

redisClient.on("error", () => {
  redisAvailable = false;
});

redisClient.on("end", () => {
  redisAvailable = false;
});

redisClient.on("close", () => {
  redisAvailable = false;
});
