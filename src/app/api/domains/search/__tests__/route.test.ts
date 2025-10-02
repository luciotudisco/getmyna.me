import { GET } from '@/app/api/domains/search/route';
import { DomainHacksGenerator } from '@/services/domain-hacks';
import { tldRepository } from '@/services/tld-repository';

jest.mock('@/services/tld-repository');
jest.mock('@/services/domain-hacks');

const mockTldRepository = tldRepository as jest.Mocked<typeof tldRepository>;
const mockDomainHacksGenerator = DomainHacksGenerator as jest.MockedClass<typeof DomainHacksGenerator>;

describe('/api/domains/search', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return domain hacks when repository succeeds', async () => {
        const mockTLDs = [{ name: 'io' }];
        const mockDomainHacks = ['luc.io'];

        mockTldRepository.listTLDs.mockResolvedValue(mockTLDs);
        mockDomainHacksGenerator.prototype.getDomainsHacks.mockReturnValue(mockDomainHacks);

        const request = new Request('https://example.com/api/domains/search?term=lucio');
        const response = await GET(request);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({ domainHacks: mockDomainHacks });
        expect(mockTldRepository.listTLDs).toHaveBeenCalledTimes(1);
        expect(mockDomainHacksGenerator.prototype.getDomainsHacks).toHaveBeenCalledWith('lucio', false);
    });

    it('should handle include_subdomains parameter', async () => {
        const mockTLDs = [{ name: 'io' }];
        const mockDomainHacks = ['luc.io', 'lu.c.io', 'l.uc.io'];

        mockTldRepository.listTLDs.mockResolvedValue(mockTLDs);
        mockDomainHacksGenerator.prototype.getDomainsHacks.mockReturnValue(mockDomainHacks);

        const request = new Request('https://example.com/api/domains/search?term=lucio&include_subdomains=true');
        const response = await GET(request);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({ domainHacks: mockDomainHacks });
        expect(mockDomainHacksGenerator.prototype.getDomainsHacks).toHaveBeenCalledWith('lucio', true);
    });

    it('should handle empty search results', async () => {
        const mockTLDs = [{ name: 'io' }];
        const mockDomainHacks: string[] = [];

        mockTldRepository.listTLDs.mockResolvedValue(mockTLDs);
        mockDomainHacksGenerator.prototype.getDomainsHacks.mockReturnValue(mockDomainHacks);

        const request = new Request('https://example.com/api/domains/search?term=test');
        const response = await GET(request);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({ domainHacks: [] });
        expect(mockDomainHacksGenerator.prototype.getDomainsHacks).toHaveBeenCalledWith('test', false);
    });

    it('should throw 500 when request fails', async () => {
        mockTldRepository.listTLDs.mockRejectedValue(new Error('Database connection failed'));

        const request = new Request('https://example.com/api/domains/search?term=test');
        const response = await GET(request);
        const responseData = await response.json();

        expect(response.status).toBe(500);
        expect(responseData).toEqual({ error: 'Internal server error' });
    });
});
