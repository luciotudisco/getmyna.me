import axios from 'axios';

import { GET } from '@/app/api/cron/dictionary/check_availability/route';

// Mock algoliasearch
const mockPartialUpdateObject = jest.fn();
const mockSearchSingleIndex = jest.fn();
const mockAlgoliaClient = {
    searchSingleIndex: mockSearchSingleIndex,
    partialUpdateObject: mockPartialUpdateObject,
};

jest.mock('algoliasearch', () => ({
    algoliasearch: jest.fn(() => mockAlgoliaClient),
}));

jest.mock('axios');

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('/api/cron/dictionary/check_availability', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Clear all timers before each test
        jest.clearAllTimers();
    });

    it('should successfully check and update availability for entries', async () => {
        const mockEntries = [
            {
                objectID: 'example.com',
                domain: 'example.com',
                isAvailable: true,
                lastUpdated: '2025-01-01T00:00:00.000Z',
            },
            {
                objectID: 'test.io',
                domain: 'test.io',
                isAvailable: false,
                lastUpdated: '2025-01-01T00:00:00.000Z',
            },
        ];

        mockSearchSingleIndex.mockResolvedValue({
            hits: mockEntries,
        });

        // Mock domain status API responses
        mockAxios.get.mockImplementation((url: string, config?: { params?: { domain: string } }) => {
            const domain = config?.params?.domain;
            if (domain === 'example.com') {
                return Promise.resolve({
                    data: {
                        status: [{ status: 'for sale inactive' }],
                    },
                });
            } else if (domain === 'test.io') {
                return Promise.resolve({
                    data: {
                        status: [{ status: 'for sale inactive' }],
                    },
                });
            }
            return Promise.reject(new Error('Unknown domain'));
        });

        mockPartialUpdateObject.mockResolvedValue({});

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.stats.entriesRetrieved).toBe(2);
        expect(responseData.stats.checkedCount).toBe(2);

        // Verify Algolia search was called correctly
        expect(mockSearchSingleIndex).toHaveBeenCalledWith({
            indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME,
            searchParams: {
                query: '',
                hitsPerPage: 100,
                attributesToRetrieve: ['objectID', 'domain', 'isAvailable', 'lastUpdated'],
            },
        });

        // Verify domain status API calls
        expect(mockAxios.get).toHaveBeenCalledTimes(2);
    });

    it('should handle entries with unchanged availability', async () => {
        const mockEntries = [
            {
                objectID: 'unchanged.com',
                domain: 'unchanged.com',
                isAvailable: true,
                lastUpdated: '2025-01-01T00:00:00.000Z',
            },
        ];

        mockSearchSingleIndex.mockResolvedValue({
            hits: mockEntries,
        });

        mockAxios.get.mockResolvedValue({
            data: {
                status: [{ status: 'for sale inactive' }],
            },
        });

        mockPartialUpdateObject.mockResolvedValue({});

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.stats.checkedCount).toBe(1);

        // Should update lastUpdated even if availability didn't change
        expect(mockPartialUpdateObject).toHaveBeenCalledWith(
            expect.objectContaining({
                indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME,
                objectID: 'unchanged.com',
                attributesToUpdate: expect.objectContaining({
                    lastUpdated: expect.any(String),
                }),
            }),
        );
    });

    it('should handle API errors gracefully', async () => {
        const mockEntries = [
            {
                objectID: 'error.com',
                domain: 'error.com',
                isAvailable: true,
                lastUpdated: '2025-01-01T00:00:00.000Z',
            },
        ];

        mockSearchSingleIndex.mockResolvedValue({
            hits: mockEntries,
        });

        mockAxios.get.mockRejectedValue(new Error('API error'));

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.stats.errorCount).toBe(1);
        expect(responseData.stats.checkedCount).toBe(0);
    });

    it('should handle invalid API responses', async () => {
        const mockEntries = [
            {
                objectID: 'invalid.com',
                domain: 'invalid.com',
                isAvailable: true,
                lastUpdated: '2025-01-01T00:00:00.000Z',
            },
        ];

        mockSearchSingleIndex.mockResolvedValue({
            hits: mockEntries,
        });

        // Return invalid response structure
        mockAxios.get.mockResolvedValue({
            data: {
                status: [],
            },
        });

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.stats.errorCount).toBe(1);
        expect(responseData.stats.checkedCount).toBe(0);
    });

    it('should handle Algolia update errors', async () => {
        const mockEntries = [
            {
                objectID: 'update-error.com',
                domain: 'update-error.com',
                isAvailable: false,
                lastUpdated: '2025-01-01T00:00:00.000Z',
            },
        ];

        mockSearchSingleIndex.mockResolvedValue({
            hits: mockEntries,
        });

        mockAxios.get.mockResolvedValue({
            data: {
                status: [{ status: 'for sale inactive' }],
            },
        });

        mockPartialUpdateObject.mockRejectedValue(new Error('Algolia update error'));

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.stats.checkedCount).toBe(1);
        expect(responseData.stats.errorCount).toBe(1);
    });

    it('should handle empty Algolia results', async () => {
        mockSearchSingleIndex.mockResolvedValue({
            hits: [],
        });

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.stats.entriesRetrieved).toBe(0);
        expect(responseData.stats.checkedCount).toBe(0);
        expect(responseData.stats.updatedCount).toBe(0);
        expect(responseData.stats.errorCount).toBe(0);
    });

    it('should return 500 when Algolia search fails', async () => {
        mockSearchSingleIndex.mockRejectedValue(new Error('Algolia search error'));

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(500);
        expect(responseData).toEqual({ error: 'Internal server error' });
    });

    it('should correctly identify available domains', async () => {
        const mockEntries = [
            {
                objectID: 'available.com',
                domain: 'available.com',
                isAvailable: false,
                lastUpdated: '2025-01-01T00:00:00.000Z',
            },
        ];

        mockSearchSingleIndex.mockResolvedValue({
            hits: mockEntries,
        });

        // Return a status that indicates availability (INACTIVE)
        mockAxios.get.mockResolvedValue({
            data: {
                status: [{ status: 'for sale inactive' }],
            },
        });

        mockPartialUpdateObject.mockResolvedValue({});

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.stats.checkedCount).toBe(1);
        expect(responseData.stats.updatedCount).toBe(1);

        // Verify the entry was updated with correct availability
        expect(mockPartialUpdateObject).toHaveBeenCalledWith(
            expect.objectContaining({
                objectID: 'available.com',
                attributesToUpdate: expect.objectContaining({
                    isAvailable: true,
                }),
            }),
        );
    });

    it('should correctly identify unavailable domains', async () => {
        const mockEntries = [
            {
                objectID: 'unavailable.com',
                domain: 'unavailable.com',
                isAvailable: true,
                lastUpdated: '2025-01-01T00:00:00.000Z',
            },
        ];

        mockSearchSingleIndex.mockResolvedValue({
            hits: mockEntries,
        });

        // Return a status that indicates unavailability (ACTIVE)
        mockAxios.get.mockResolvedValue({
            data: {
                status: [{ status: 'active' }],
            },
        });

        mockPartialUpdateObject.mockResolvedValue({});

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.stats.checkedCount).toBe(1);
        expect(responseData.stats.updatedCount).toBe(1);

        // Verify the entry was updated with correct availability
        expect(mockPartialUpdateObject).toHaveBeenCalledWith(
            expect.objectContaining({
                objectID: 'unavailable.com',
                attributesToUpdate: expect.objectContaining({
                    isAvailable: false,
                }),
            }),
        );
    });
});
