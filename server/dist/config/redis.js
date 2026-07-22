"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const ioredis_1 = require("ioredis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
// Initialize the Redis client connection
exports.redisClient = new ioredis_1.Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});
// Listen to connection state events for debug logging
exports.redisClient.on("connect", () => {
    console.log("[Redis] Client attempting connection...");
});
exports.redisClient.on("ready", () => {
    console.log("[Redis] Client connected successfully and ready!");
});
exports.redisClient.on("error", (error) => {
    console.error(`[Redis] Connection Error: ${error.message}`);
});
exports.redisClient.on("close", () => {
    console.log("[Redis] Connection closed.");
});
//# sourceMappingURL=redis.js.map