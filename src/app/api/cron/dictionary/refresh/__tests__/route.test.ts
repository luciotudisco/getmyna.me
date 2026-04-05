import axios from 'axios';

import { GET } from '@/app/api/cron/dictionary/refresh/route';

jest.mock('axios');

const mockBrowseObjects = jest.fn();
const mockPartialUpdateObject = jest.fn();
const mockAlgoliaClient = {
    browseObjects: mockBrowseObjects,
    partialUpdateObject: mockPartialUpdateObject,
};

jest.mock('algoliasearch', () => ({
    algoliasearch: jest.fn(() => mockAlgoliaClient),
}));

const mockAxios = axios as jest.Mocked<typeof axios>;

// A date well in the past so entries are always stale
const STALE_DATE = '2024-01-01T00:00:00.000Z';

describe('/api/cron/dictionary/refresh', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should refresh availability for stale entries', async () => {
        const staleEntries = [
            { objectID: 'gat.es', domain: 'gat.es', tld: 'es', word: 'gates', lastUpdated: STALE_DATE },
            { objectID: 'bill.io', domain: 'bill.io', tld: 'io', word: 'billing', lastUpdated: STALE_DATE },
        ];

        mockBrowseObjects.mockImplementation(async ({ aggregator }: { aggregator: (res: any) => Promise<void> }) => {
            await aggregator({ hits: staleEntries, cursor: undefined });
        });
        mockPartialUpdateObject.mockResolvedValue({});

        // gat.es is available (inactive), bill.io is taken (active)
        mockAxios.get
            .mockResolvedValueOnce({ data: { status: [{ status: 'undelegated inactive' }] } })
            .mockResolvedValueOnce({ data: { status: [{ status: 'active' }] } });

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({ message: 'Refreshed stale dictionary entries', count: 2 });

        expect(mockAxios.get).toHaveBeenCalledTimes(2);
        expect(mockAxios.get).toHaveBeenCalledWith('https://domainr.p.rapidapi.com/v2/status', {
            headers: { 'x-rapidapi-key': process.env.RAPID_API_KEY },
            params: { domain: 'gat.es' },
        });
        expect(mockAxios.get).toHaveBeenCalledWith('https://domainr.p.rapidapi.com/v2/status', {
            headers: { 'x-rapidapi-key': process.env.RAPID_API_KEY },
            params: { domain: 'bill.io' },
        });

        expect(mockPartialUpdateObject).toHaveBeenCalledTimes(2);
        expect(mockPartialUpdateObject).toHaveBeenCalledWith(
            expect.objectContaining({
                objectID: 'gat.es',
                attributesToUpdate: expect.objectContaining({ isAvailable: true }),
            }),
        );
        expect(mockPartialUpdateObject).toHaveBeenCalledWith(
            expect.objectContaining({
                objectID: 'bill.io',
                attributesToUpdate: expect.objectContaining({ isAvailable: false }),
            }),
        );
    });

    it('should skip entries where Domainr API call fails and continue with the rest', async () => {
        const staleEntries = [
            { objectID: 'fail.io', domain: 'fail.io', tld: 'io', word: 'fail', lastUpdated: STALE_DATE },
            { objectID: 'ok.es', domain: 'ok.es', tld: 'es', word: 'okay', lastUpdated: STALE_DATE },
        ];

        mockBrowseObjects.mockImplementation(async ({ aggregator }: { aggregator: (res: any) => Promise<void> }) => {
            await aggregator({ hits: staleEntries, cursor: undefined });
        });
        mockPartialUpdateObject.mockResolvedValue({});

        mockAxios.get
            .mockRejectedValueOnce(new Error('API error'))
            .mockResolvedValueOnce({ data: { status: [{ status: 'inactive' }] } });

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({ message: 'Refreshed stale dictionary entries', count: 2 });

        // Only ok.es should be updated
        expect(mockPartialUpdateObject).toHaveBeenCalledTimes(1);
        expect(mockPartialUpdateObject).toHaveBeenCalledWith(
            expect.objectContaining({
                objectID: 'ok.es',
                attributesToUpdate: expect.objectContaining({ isAvailable: true }),
            }),
        );
    });

    it('should handle entries with empty Domainr response as unavailable', async () => {
        const staleEntries = [
            { objectID: 'weird.io', domain: 'weird.io', tld: 'io', word: 'weird', lastUpdated: STALE_DATE },
        ];

        mockBrowseObjects.mockImplementation(async ({ aggregator }: { aggregator: (res: any) => Promise<void> }) => {
            await aggregator({ hits: staleEntries, cursor: undefined });
        });
        mockPartialUpdateObject.mockResolvedValue({});
        mockAxios.get.mockResolvedValueOnce({ data: { status: [] } });

        await GET();

        expect(mockPartialUpdateObject).toHaveBeenCalledWith(
            expect.objectContaining({
                objectID: 'weird.io',
                attributesToUpdate: expect.objectContaining({ isAvailable: false }),
            }),
        );
    });

    it('should return count 0 and make no API calls when there are no stale entries', async () => {
        mockBrowseObjects.mockImplementation(async ({ aggregator }: { aggregator: (res: any) => Promise<void> }) => {
            await aggregator({ hits: [], cursor: undefined });
        });

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({ message: 'Refreshed stale dictionary entries', count: 0 });
        expect(mockAxios.get).not.toHaveBeenCalled();
        expect(mockPartialUpdateObject).not.toHaveBeenCalled();
    });

    it('should return 500 when Algolia browse fails', async () => {
        mockBrowseObjects.mockRejectedValue(new Error('Algolia error'));

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(500);
        expect(responseData).toEqual({ error: 'Internal server error' });
    });
});
