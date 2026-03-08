const cache = new Map();

/**
 * Executes a fetch function with an in-memory TTL wrapper.
 * @param {string} key - Unique cache key
 * @param {function} fetchFn - Async function to fetch the data
 * @param {number} ttlMs - Time to live in milliseconds (default: 5 minutes)
 */
export async function withCache(key, fetchFn, ttlMs = 300000) {
    const now = Date.now();
    const cached = cache.get(key);

    if (cached && now < cached.expiry) {
        return cached.data;
    }

    const data = await fetchFn();
    cache.set(key, { data, expiry: now + ttlMs });
    return data;
}

/**
 * Clears keys starting with the provided prefix, or the entire cache if prefix is omitted.
 * @param {string} [prefix]
 */
export function invalidateLocalCache(prefix) {
    if (!prefix) {
        cache.clear();
        return;
    }
    for (const key of cache.keys()) {
        if (key.startsWith(prefix)) {
            cache.delete(key);
        }
    }
}
