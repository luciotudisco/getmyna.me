import { tldRepository } from '@/services/tld-repository';

import { GET } from '../route';

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
    });
});
