import { TTLCache } from './ttl-cache';

describe('TTLCache', () => {
    beforeEach(() => {
        jest.useFakeTimers({});
    });

    afterEach(() => {
        jest.useRealTimers({});
    });

    it('retrieves values before TTL expires', () => {
        const cache = new TTLCache<number>();
        cache.set('a', 1, 1000);
        expect(cache.get('a')).toBe(1);
    });

    it('expires values after TTL', () => {
        const cache = new TTLCache<number>();
        cache.set('b', 2, 1000);
        jest.advanceTimersByTime(1001);
        expect(cache.get('b')).toBeUndefined();
    });
});
