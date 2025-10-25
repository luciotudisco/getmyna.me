import { GET } from '@/app/api/tlds/route';
import { TLD, TLDType } from '@/models/tld';
import { tldRepository } from '@/services/tld-repository';

jest.mock('@/services/tld-repository');
const mockTldRepository = tldRepository as jest.Mocked<typeof tldRepository>;

describe('/api/tlds', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return all TLDs when repository succeeds', async () => {
        const mockTLDs: TLD[] = [
            {
                name: 'com',
                punycodeName: 'com',
                type: TLDType.GENERIC,
                description: 'Commercial',
                pricing: {},
            },
            {
                name: 'org',
                punycodeName: 'org',
                type: TLDType.GENERIC,
                description: 'Organization',
                pricing: {},
            },
            {
                name: 'uk',
                punycodeName: 'uk',
                type: TLDType.COUNTRY_CODE,
                description: 'United Kingdom',
                pricing: {},
            },
        ];
        mockTldRepository.list.mockResolvedValue(mockTLDs);

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({ tlds: mockTLDs });
        expect(mockTldRepository.list).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no TLDs exist', async () => {
        mockTldRepository.list.mockResolvedValue([]);

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({ tlds: [] });
    });

    it('should return 500 when request fails', async () => {
        const mockError = new Error('Database connection failed');
        mockTldRepository.list.mockRejectedValue(mockError);

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(500);
        expect(responseData).toEqual({ error: 'Internal server error' });
    });
});
