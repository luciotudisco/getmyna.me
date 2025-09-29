import { GET } from '@/app/api/domains/[name]/tld/route';
import { Registrar, TLDType } from '@/models/tld';
import { tldRepository } from '@/services/tld-repository';

jest.mock('@/services/tld-repository');

const mockTldRepository = tldRepository as jest.Mocked<typeof tldRepository>;

describe('/api/domains/[name]/tld', () => {
    const mockDomain = 'example.com';
    const mockCtx = { params: Promise.resolve({ name: mockDomain }) };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET', () => {
        it('should return TLD information when domain is valid and TLD exists', async () => {
            const mockTldInfo = {
                description: 'Commercial domain',
                punycodeName: 'com',
                type: TLDType.GENERIC,
                pricing: { [Registrar.PORKBUN]: { registration: 12.99, renewal: 12.99, currency: 'USD' } },
            };
            mockTldRepository.getTLD.mockResolvedValue(mockTldInfo);

            const request = new Request('https://example.com/api/domains/example.com/tld');
            const response = await GET(request, mockCtx);
            const responseData = await response.json();

            expect(response.status).toBe(200);
            expect(responseData).toEqual({
                description: 'Commercial domain',
                punycodeName: 'com',
                name: 'com',
                type: TLDType.GENERIC,
                pricing: { [Registrar.PORKBUN]: { registration: 12.99, renewal: 12.99, currency: 'USD' } },
            });

            expect(mockTldRepository.getTLD).toHaveBeenCalledWith('com');
        });

        it('should handle subdomain and extract correct TLD', async () => {
            const mockTldInfo = {
                description: 'Commercial domain',
                punycodeName: 'com',
                type: TLDType.GENERIC,
                pricing: { [Registrar.PORKBUN]: { registration: 12.99, renewal: 12.99, currency: 'USD' } },
            };
            const subdomainCtx = { params: Promise.resolve({ name: 'blog.example.com' }) };

            mockTldRepository.getTLD.mockResolvedValue(mockTldInfo);

            const request = new Request('https://example.com/api/domains/blog.example.com/tld');
            const response = await GET(request, subdomainCtx);
            const responseData = await response.json();

            expect(response.status).toBe(200);
            expect(responseData.name).toBe('com');
            expect(mockTldRepository.getTLD).toHaveBeenCalledWith('com');
        });

        it('should handle internationalized domain names', async () => {
            const unicodeDomainCtx = { params: Promise.resolve({ name: 'пример.рф' }) };
            const mockTldInfo = {
                description: 'Russian Federation domain',
                punycodeName: 'xn--p1ai',
                type: TLDType.COUNTRY_CODE,
            };

            mockTldRepository.getTLD.mockResolvedValue(mockTldInfo);

            const request = new Request('https://example.com/api/domains/пример.рф/tld');
            const response = await GET(request, unicodeDomainCtx);
            const responseData = await response.json();

            expect(response.status).toBe(200);
            expect(responseData.name).toBe('рф');
            expect(mockTldRepository.getTLD).toHaveBeenCalledWith('рф');
        });

        it('should return 400 for invalid domain name', async () => {
            const invalidDomainCtx = { params: Promise.resolve({ name: 'invalid-domain' }) };

            const request = new Request('https://example.com/api/domains/invalid-domain/tld');
            const response = await GET(request, invalidDomainCtx);
            const responseData = await response.json();

            expect(response.status).toBe(400);
            expect(responseData).toEqual({ error: "The provided domain 'invalid-domain' is not valid" });

            expect(mockTldRepository.getTLD).not.toHaveBeenCalled();
        });

        it('should return 400 for empty domain name', async () => {
            const emptyDomainCtx = { params: Promise.resolve({ name: '' }) };

            const request = new Request('https://example.com/api/domains//tld');
            const response = await GET(request, emptyDomainCtx);
            const responseData = await response.json();

            expect(response.status).toBe(400);
            expect(responseData).toEqual({
                error: "The provided domain '' is not valid",
            });

            expect(mockTldRepository.getTLD).not.toHaveBeenCalled();
        });

        it('should raise 400 for domain without TLD', async () => {
            const noTldCtx = { params: Promise.resolve({ name: 'localhost' }) };

            const request = new Request('https://example.com/api/domains/localhost/tld');
            const response = await GET(request, noTldCtx);
            const responseData = await response.json();

            expect(response.status).toBe(400);
            expect(responseData).toEqual({ error: "The provided domain 'localhost' is not valid" });
            expect(mockTldRepository.getTLD).not.toHaveBeenCalled();
        });

        it('should raise 404 when TLD info is not found', async () => {
            mockTldRepository.getTLD.mockResolvedValue(null);

            const request = new Request('https://example.com/api/domains/example.com/tld');
            const response = await GET(request, mockCtx);
            const responseData = await response.json();

            expect(response.status).toBe(404);
            expect(responseData).toEqual({ error: "TLD not found for domain 'example.com'" });

            expect(mockTldRepository.getTLD).toHaveBeenCalledWith('com');
        });

        it('should raise 500 when an error occurs', async () => {
            const mockError = new Error('Database connection failed');
            mockTldRepository.getTLD.mockRejectedValue(mockError);

            const request = new Request('https://example.com/api/domains/example.com/tld');
            const response = await GET(request, mockCtx);
            const responseData = await response.json();

            expect(response.status).toBe(500);
            expect(responseData).toEqual({ error: 'Internal server error' });
        });
    });
});
