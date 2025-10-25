import { GET } from '@/app/api/tlds/count/route';
import { tldRepository } from '@/services/tld-repository';

jest.mock('@/services/tld-repository');
const mockTldRepository = tldRepository as jest.Mocked<typeof tldRepository>;

describe('/api/tlds/count', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET', () => {
        it('should return TLD count when repository succeeds', async () => {
            const mockCount = 1500;
            mockTldRepository.count.mockResolvedValue(mockCount);

            const response = await GET();
            const responseData = await response.json();

            expect(response.status).toBe(200);
            expect(responseData).toEqual({ count: mockCount });
            expect(mockTldRepository.count).toHaveBeenCalledTimes(1);
        });

        it('should throw 500 when request fails', async () => {
            const mockError = new Error('Database connection failed');
            mockTldRepository.count.mockRejectedValue(mockError);

            const response = await GET();
            const responseData = await response.json();

            expect(response.status).toBe(500);
            expect(responseData).toEqual({ error: 'Internal server error' });
        });
    });
});
