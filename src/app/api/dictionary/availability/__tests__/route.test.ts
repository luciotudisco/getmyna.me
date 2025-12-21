import { algoliasearch } from 'algoliasearch';

import { GET } from '@/app/api/dictionary/availability/route';
import { DictionaryEntry } from '@/models/dictionary';

jest.mock('algoliasearch');

const mockAlgoliaSearch = algoliasearch as jest.MockedFunction<typeof algoliasearch>;

describe('/api/dictionary/availability', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return entries older than 60 days ordered by rank', async () => {
        const now = new Date();
        const fiftyDaysAgo = new Date();
        fiftyDaysAgo.setDate(now.getDate() - 50);
        const sixtyOneDaysAgo = new Date();
        sixtyOneDaysAgo.setDate(now.getDate() - 61);
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(now.getDate() - 90);

        // Mock all entries including recent ones that should be filtered out
        const mockAllEntries: DictionaryEntry[] = [
            {
                objectID: 'test3.com',
                domain: 'test3.com',
                word: 'test3',
                tld: 'com',
                category: 'common',
                rank: 3,
                lastUpdated: ninetyDaysAgo.toISOString(),
                isAvailable: true,
            },
            {
                objectID: 'test1.com',
                domain: 'test1.com',
                word: 'test1',
                tld: 'com',
                category: 'common',
                rank: 1,
                lastUpdated: sixtyOneDaysAgo.toISOString(),
                isAvailable: false,
            },
            {
                objectID: 'test2.com',
                domain: 'test2.com',
                word: 'test2',
                tld: 'com',
                category: 'common',
                rank: 2,
                lastUpdated: ninetyDaysAgo.toISOString(),
                isAvailable: true,
            },
            {
                objectID: 'recent.com',
                domain: 'recent.com',
                word: 'recent',
                tld: 'com',
                category: 'common',
                rank: 4,
                lastUpdated: fiftyDaysAgo.toISOString(),
                isAvailable: true,
            },
        ];

        const mockSearchSingleIndex = jest.fn().mockResolvedValue({
            hits: mockAllEntries,
            nbHits: mockAllEntries.length,
        });

        mockAlgoliaSearch.mockReturnValue({
            searchSingleIndex: mockSearchSingleIndex,
        } as any);

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.count).toBe(3);
        expect(responseData.entries).toHaveLength(3);

        // Verify entries are sorted by rank and recent entry is filtered out
        expect(responseData.entries[0].rank).toBe(1);
        expect(responseData.entries[1].rank).toBe(2);
        expect(responseData.entries[2].rank).toBe(3);
        expect(responseData.entries.find((e: DictionaryEntry) => e.objectID === 'recent.com')).toBeUndefined();

        expect(responseData.cutoffDate).toBeDefined();
        expect(mockSearchSingleIndex).toHaveBeenCalledTimes(1);
    });

    it('should handle empty results', async () => {
        const mockSearchSingleIndex = jest.fn().mockResolvedValue({
            hits: [],
            nbHits: 0,
        });

        mockAlgoliaSearch.mockReturnValue({
            searchSingleIndex: mockSearchSingleIndex,
        } as any);

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.count).toBe(0);
        expect(responseData.entries).toEqual([]);
        expect(responseData.cutoffDate).toBeDefined();
    });

    it('should handle entries without rank field', async () => {
        const sixtyOneDaysAgo = new Date();
        sixtyOneDaysAgo.setDate(new Date().getDate() - 61);

        const mockEntries: DictionaryEntry[] = [
            {
                objectID: 'test2.com',
                domain: 'test2.com',
                word: 'test2',
                tld: 'com',
                category: 'common',
                lastUpdated: sixtyOneDaysAgo.toISOString(),
                isAvailable: true,
            },
            {
                objectID: 'test1.com',
                domain: 'test1.com',
                word: 'test1',
                tld: 'com',
                category: 'common',
                rank: 1,
                lastUpdated: sixtyOneDaysAgo.toISOString(),
                isAvailable: false,
            },
        ];

        const mockSearchSingleIndex = jest.fn().mockResolvedValue({
            hits: mockEntries,
            nbHits: mockEntries.length,
        });

        mockAlgoliaSearch.mockReturnValue({
            searchSingleIndex: mockSearchSingleIndex,
        } as any);

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.count).toBe(2);
        // Entry with rank should come first, entry without rank should come last
        expect(responseData.entries[0].rank).toBe(1);
        expect(responseData.entries[1].rank).toBeUndefined();
    });

    it('should return 500 when Algolia request fails', async () => {
        const mockSearchSingleIndex = jest.fn().mockRejectedValue(new Error('Algolia connection failed'));

        mockAlgoliaSearch.mockReturnValue({
            searchSingleIndex: mockSearchSingleIndex,
        } as any);

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(500);
        expect(responseData).toEqual({ error: 'Internal server error' });
    });
});
