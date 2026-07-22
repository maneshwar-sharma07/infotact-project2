/**
 * Generic cache-aside helper function that wraps database operations with caching and performance logging.
 * @param key Unique cache key string
 * @param fetchFunction Database fetch fallback function to run on cache miss
 * @param ttlSeconds Base Time-To-Live in seconds (default: 600s / 10 mins)
 * @returns The resolved data (either cached or fresh)
 */
export declare const getOrSetCache: <T>(key: string, fetchFunction: () => Promise<T>, ttlSeconds?: number) => Promise<T>;
export declare const invalidateCatalogCache: () => Promise<void>;
//# sourceMappingURL=cache.d.ts.map