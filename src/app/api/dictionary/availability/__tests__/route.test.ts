// Mock pino logger
import { GET } from '../route';

jest.mock('pino', () => {
    return jest.fn(() => ({
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
    }));
});

// Mock algoliasearch before imports
jest.mock('algoliasearch', () => ({
    algoliasearch: jest.fn(() => ({
        searchForHits: jest.fn(),
    })),
}));

describe('/api/dictionary/availability', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = {
            ...originalEnv,
            NEXT_PUBLIC_ALGOLIA_APP_ID: 'test-app-id',
            ALGOLIA_API_KEY: 'test-api-key',
            NEXT_PUBLIC_ALGOLIA_INDEX_NAME: 'test-index',
        };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should return entries older than 60 days ordered by rank', async () => {
        const { algoliasearch } = await import('algoliasearch');
        const mockSearchForHits = jest.fn().mockResolvedValue({
            results: [
                {
                    hits: [
                        {
                            objectID: 'domain3.com',
                            domain: 'domain3.com',
                            tld: 'com',
                            word: 'domain',
                            rank: 3,
                            lastUpdated: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                        },
                        {
                            objectID: 'domain1.com',
                            domain: 'domain1.com',
                            tld: 'com',
                            word: 'domain',
                            rank: 1,
                            lastUpdated: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
                        },
                        {
                            objectID: 'domain2.com',
                            domain: 'domain2.com',
                            tld: 'com',
                            word: 'domain',
                            rank: 2,
                            lastUpdated: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
                        },
                    ],
                    nbHits: 3,
                    nbPages: 1,
                },
            ],
        });

        (algoliasearch as jest.Mock).mockReturnValue({
            searchForHits: mockSearchForHits,
        });

        const request = new Request('http://localhost/api/dictionary/availability');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.entries).toHaveLength(3);
        // Verify sorting by rank
        expect(data.entries[0].rank).toBe(1);
        expect(data.entries[1].rank).toBe(2);
        expect(data.entries[2].rank).toBe(3);
        expect(data.pagination.nbHits).toBe(3);
    });

    it('should support pagination parameters', async () => {
        const { algoliasearch } = await import('algoliasearch');
        const mockSearchForHits = jest.fn().mockResolvedValue({
            results: [
                {
                    hits: [],
                    nbHits: 0,
                    nbPages: 0,
                },
            ],
        });

        (algoliasearch as jest.Mock).mockReturnValue({
            searchForHits: mockSearchForHits,
        });

        const request = new Request('http://localhost/api/dictionary/availability?page=2&hitsPerPage=50');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(mockSearchForHits).toHaveBeenCalledWith(
            expect.objectContaining({
                requests: expect.arrayContaining([
                    expect.objectContaining({
                        page: 2,
                        hitsPerPage: 50,
                    }),
                ]),
            }),
        );
        expect(data.pagination.page).toBe(2);
        expect(data.pagination.hitsPerPage).toBe(50);
    });

    it('should cap hitsPerPage at 1000', async () => {
        const { algoliasearch } = await import('algoliasearch');
        const mockSearchForHits = jest.fn().mockResolvedValue({
            results: [
                {
                    hits: [],
                    nbHits: 0,
                    nbPages: 0,
                },
            ],
        });

        (algoliasearch as jest.Mock).mockReturnValue({
            searchForHits: mockSearchForHits,
        });

        const request = new Request('http://localhost/api/dictionary/availability?hitsPerPage=5000');
        const response = await GET(request);

        expect(response.status).toBe(200);
        expect(mockSearchForHits).toHaveBeenCalledWith(
            expect.objectContaining({
                requests: expect.arrayContaining([
                    expect.objectContaining({
                        hitsPerPage: 1000,
                    }),
                ]),
            }),
        );
    });

    it('should handle errors gracefully', async () => {
        const { algoliasearch } = await import('algoliasearch');
        (algoliasearch as jest.Mock).mockReturnValue({
            searchForHits: jest.fn().mockRejectedValue(new Error('Algolia error')),
        });

        const request = new Request('http://localhost/api/dictionary/availability');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Internal server error');
    });
});
