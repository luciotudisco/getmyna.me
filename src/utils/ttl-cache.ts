export interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

/**
 * A simple in-memory cache with per-entry TTL support.
 */
export class TTLCache<T> {
    private store = new Map<string, CacheEntry<T>>();

    clear(): void {
        this.store.clear();
    }

    delete(key: string): void {
        this.store.delete(key);
    }

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

    has(key: string): boolean {
        return this.get(key) !== undefined;
    }

    set(key: string, value: T, ttlMs: number): void {
        const expiresAt = Date.now() + ttlMs;
        this.store.set(key, { value, expiresAt });
    }
}
