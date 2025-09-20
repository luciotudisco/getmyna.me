/**
 * A generic cache entry with a TTL.
 */
export interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

/**
 * A simple in-memory cache with per-entry TTL support.
 */
export class TTLCache<T> {
    private store = new Map<string, CacheEntry<T>>();

    /**
     * Clears the cache.
     */
    clear(): void {
        this.store.clear();
    }

    /**
     * Deletes a key from the cache.
     * @param key - The key to delete.
     */
    delete(key: string): void {
        this.store.delete(key);
    }

    /**
     * Retrieves a value from the cache.
     * @param key - The key to retrieve.
     * @returns The value, or undefined if it has expired.
     */
    get(key: string): T | undefined {
        const entry = this.store.get(key);
        if (!entry) {
            return undefined;
        }
        if (Date.now() >= entry.expiresAt) {
            this.store.delete(key);
            return undefined;
        }
        return entry.value;
    }

    /**
     * Checks if a key exists in the cache.
     * @param key - The key to check.
     * @returns True if the key exists, false otherwise.
     */
    has(key: string): boolean {
        return this.get(key) !== undefined;
    }

    /**
     * Sets a value in the cache.
     * @param key - The key to set.
     * @param value - The value to set.
     * @param ttlMs - The time-to-live in milliseconds.
     */
    set(key: string, value: T, ttlMs: number): void {
        const expiresAt = Date.now() + ttlMs;
        this.store.set(key, { value, expiresAt });
    }
}
