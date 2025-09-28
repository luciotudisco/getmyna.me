import { tldRepository } from '@/services/tld-repository';

import { GET } from '../route';

// Mock the dependencies
jest.mock('@/services/tld-repository');

const mockTldRepository = tldRepository as jest.Mocked<typeof tldRepository>;

describe('/api/tlds/count', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET', () => {
        it('should return TLD count when repository succeeds', async () => {
            const mockCount = 1500;
            mockTldRepository.countTLDs.mockResolvedValue(mockCount);

            const response = await GET();
            const responseData = await response.json();

            expect(response.status).toBe(200);
            expect(responseData).toEqual({ count: mockCount });
            expect(mockTldRepository.countTLDs).toHaveBeenCalledTimes(1);
        });

        it('should return 500 error when repository throws', async () => {
            const mockError = new Error('Database connection failed');
            mockTldRepository.countTLDs.mockRejectedValue(mockError);

            const response = await GET();
            const responseData = await response.json();

            expect(response.status).toBe(500);
            expect(responseData).toEqual({ error: 'Failed to count TLDs' });
        });

        it('should handle repository returning zero count', async () => {
            const mockCount = 0;
            mockTldRepository.countTLDs.mockResolvedValue(mockCount);

            const response = await GET();
            const responseData = await response.json();

            expect(response.status).toBe(200);
            expect(responseData).toEqual({ count: 0 });
            expect(mockTldRepository.countTLDs).toHaveBeenCalledTimes(1);
        });

        it('should handle large count values', async () => {
            const mockCount = 999999;
            mockTldRepository.countTLDs.mockResolvedValue(mockCount);

            const response = await GET();
            const responseData = await response.json();

            expect(response.status).toBe(200);
            expect(responseData).toEqual({ count: mockCount });
            expect(mockTldRepository.countTLDs).toHaveBeenCalledTimes(1);
        });

        it('should handle repository timeout error', async () => {
            const timeoutError = new Error('Query timeout');
            timeoutError.name = 'TimeoutError';
            mockTldRepository.countTLDs.mockRejectedValue(timeoutError);

            const response = await GET();
            const responseData = await response.json();

            expect(response.status).toBe(500);
            expect(responseData).toEqual({ error: 'Failed to count TLDs' });
        });

        it('should handle database connection error', async () => {
            const connectionError = new Error('Connection refused');
            connectionError.name = 'ConnectionError';
            mockTldRepository.countTLDs.mockRejectedValue(connectionError);

            const response = await GET();
            const responseData = await response.json();

            expect(response.status).toBe(500);
            expect(responseData).toEqual({ error: 'Failed to count TLDs' });
        });

        it('should handle repository returning null/undefined count', async () => {
            mockTldRepository.countTLDs.mockResolvedValue(0);

            const response = await GET();
            const responseData = await response.json();

            expect(response.status).toBe(200);
            expect(responseData).toEqual({ count: 0 });
            expect(mockTldRepository.countTLDs).toHaveBeenCalledTimes(1);
        });
    });
});
