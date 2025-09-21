import { TTLCache } from '@/utils/cache';

describe('TTLCache', () => {
    let cache: TTLCache<string>;

    beforeEach(() => {
        cache = new TTLCache<string>();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('set and get', () => {
        it('should store and retrieve a value', () => {
            cache.set('key1', 'value1', 1000);
            expect(cache.get('key1')).toBe('value1');
        });

        it('should store multiple values with different keys', () => {
            cache.set('key1', 'value1', 1000);
            cache.set('key2', 'value2', 1000);

            expect(cache.get('key1')).toBe('value1');
            expect(cache.get('key2')).toBe('value2');
        });

        it('should return undefined for non-existent keys', () => {
            expect(cache.get('nonexistent')).toBeUndefined();
        });

        it('should overwrite existing values', () => {
            cache.set('key1', 'value1', 1000);
            cache.set('key1', 'value2', 1000);

            expect(cache.get('key1')).toBe('value2');
        });
    });

    describe('TTL (Time To Live)', () => {
        it('should return value before expiration', () => {
            cache.set('key1', 'value1', 1000);

            // Advance time by 500ms (before expiration)
            jest.advanceTimersByTime(500);

            expect(cache.get('key1')).toBe('value1');
        });

        it('should return undefined after expiration', () => {
            cache.set('key1', 'value1', 1000);

            // Advance time by 1001ms (after expiration)
            jest.advanceTimersByTime(1001);

            expect(cache.get('key1')).toBeUndefined();
        });

        it('should automatically remove expired entries when accessed', () => {
            cache.set('key1', 'value1', 1000);

            // Advance time past expiration
            jest.advanceTimersByTime(1001);

            // Access the expired key
            cache.get('key1');

            // Verify the entry is actually removed from internal store
            expect((cache as any).store.has('key1')).toBe(false);
        });
    });

    describe('has', () => {
        it('should return true for existing non-expired keys', () => {
            cache.set('key1', 'value1', 1000);

            expect(cache.has('key1')).toBe(true);
        });

        it('should return false for non-existent keys', () => {
            expect(cache.has('nonexistent')).toBe(false);
        });

        it('should return false for expired keys', () => {
            cache.set('key1', 'value1', 1000);

            // Advance time past expiration
            jest.advanceTimersByTime(1001);

            expect(cache.has('key1')).toBe(false);
        });
    });

    describe('delete', () => {
        it('should delete existing keys', () => {
            cache.set('key1', 'value1', 1000);
            cache.delete('key1');

            expect(cache.get('key1')).toBeUndefined();
            expect(cache.has('key1')).toBe(false);
        });

        it('should handle deletion of non-existent keys gracefully', () => {
            cache.delete('nonexistent');

            expect(cache.get('nonexistent')).toBeUndefined();
        });

        it('should only delete the specified key', () => {
            cache.set('key1', 'value1', 1000);
            cache.set('key2', 'value2', 1000);

            cache.delete('key1');

            expect(cache.get('key1')).toBeUndefined();
            expect(cache.get('key2')).toBe('value2');
        });
    });

    describe('clear', () => {
        it('should remove all entries from the cache', () => {
            cache.set('key1', 'value1', 1000);
            cache.set('key2', 'value2', 1000);
            cache.set('key3', 'value3', 1000);

            cache.clear();

            expect(cache.get('key1')).toBeUndefined();
            expect(cache.get('key2')).toBeUndefined();
            expect(cache.get('key3')).toBeUndefined();
            expect(cache.has('key1')).toBe(false);
            expect(cache.has('key2')).toBe(false);
            expect(cache.has('key3')).toBe(false);
        });
    });
});
