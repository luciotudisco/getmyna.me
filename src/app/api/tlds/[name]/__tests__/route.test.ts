import { TLDType } from '@/models/tld';
import { tldRepository } from '@/services/tld-repository';

import { GET } from '../route';

// Mock the tldRepository
jest.mock('@/services/tld-repository', () => ({
    tldRepository: {
        getTLD: jest.fn(),
    },
}));

const mockTldRepository = tldRepository as jest.Mocked<typeof tldRepository>;

describe('/api/tlds/[name]', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET', () => {
        it('should return TLD when found', async () => {
            const mockTld = {
                name: 'com',
                description: 'Commercial',
                type: TLDType.GENERIC,
                yearEstablished: 1985,
            };

            mockTldRepository.getTLD.mockResolvedValue(mockTld);

            const response = await GET({} as any, { params: { name: 'com' } });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({ tld: mockTld });
            expect(mockTldRepository.getTLD).toHaveBeenCalledWith('com');
        });

        it('should return 404 when TLD not found', async () => {
            mockTldRepository.getTLD.mockResolvedValue(null);

            const response = await GET({} as any, { params: { name: 'nonexistent' } });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toEqual({ error: 'TLD not found' });
            expect(mockTldRepository.getTLD).toHaveBeenCalledWith('nonexistent');
        });

        it('should return 400 when name is empty', async () => {
            const response = await GET({} as any, { params: { name: '' } });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({ error: 'TLD name is required' });
            expect(mockTldRepository.getTLD).not.toHaveBeenCalled();
        });

        it('should return 500 when repository throws error', async () => {
            mockTldRepository.getTLD.mockRejectedValue(new Error('Database error'));

            const response = await GET({} as any, { params: { name: 'com' } });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Internal server error' });
        });

        it('should handle punycode TLD names', async () => {
            const mockTld = {
                name: '测试',
                punycodeName: 'xn--0zwm56d',
                description: 'Chinese test domain',
                type: TLDType.GENERIC,
            };

            mockTldRepository.getTLD.mockResolvedValue(mockTld);

            const response = await GET({} as any, { params: { name: 'xn--0zwm56d' } });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({ tld: mockTld });
            expect(mockTldRepository.getTLD).toHaveBeenCalledWith('xn--0zwm56d');
        });
    });
});
