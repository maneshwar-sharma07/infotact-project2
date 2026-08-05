"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = exports.redisAvailable = void 0;
const ioredis_1 = require("ioredis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
exports.redisAvailable = false;
exports.redisClient = new ioredis_1.Redis(REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy() {
        return null;
    }
});
(async () => {
    try {
        await exports.redisClient.connect();
        exports.redisAvailable = true;
        console.log("[Redis] Connected successfully.");
    }
    catch {
        exports.redisAvailable = false;
        console.log("[Redis] Redis not available. Running without cache.");
    }
})();
// Optional logging
exports.redisClient.on("ready", () => {
    console.log("[Redis] Ready");
});
exports.redisClient.on("error", () => {
    // Ignore Redis errors during frontend development
});
//# sourceMappingURL=redis.js.map