import { TLDType } from '@/models/tld';
import { DomainHacksGenerator } from '@/services/domain-hacks';
import { tldRepository } from '@/services/tld-repository';

import { GET } from '../route';

jest.mock('@/services/tld-repository');
jest.mock('@/services/domain-hacks');

const mockTldRepository = tldRepository as jest.Mocked<typeof tldRepository>;
const mockDomainHacksGenerator = DomainHacksGenerator as jest.MockedClass<typeof DomainHacksGenerator>;

describe('/api/domains/search', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET', () => {
        it('should return domain hacks when repository succeeds', async () => {
            const mockTLDs = [
                {
                    name: 'com',
                    punycodeName: 'com',
                    type: TLDType.GENERIC,
                    description: 'Commercial',
                    pricing: undefined,
                },
                {
                    name: 'io',
                    punycodeName: 'io',
                    type: TLDType.GENERIC,
                    description: 'Input/Output',
                    pricing: undefined,
                },
            ];
            const mockDomainHacks = ['test.com', 'test.io'];

            mockTldRepository.listTLDs.mockResolvedValue(mockTLDs);
            mockDomainHacksGenerator.prototype.getDomainsHacks.mockReturnValue(mockDomainHacks);

            const request = new Request('https://example.com/api/domains/search?term=test');
            const response = await GET(request);
            const responseData = await response.json();

            expect(response.status).toBe(200);
            expect(responseData).toEqual({ domainHacks: mockDomainHacks });
            expect(mockTldRepository.listTLDs).toHaveBeenCalledTimes(1);
            expect(mockDomainHacksGenerator).toHaveBeenCalledWith(mockTLDs);
        });

        it('should handle include_subdomains parameter', async () => {
            const mockTLDs = [
                {
                    name: 'com',
                    punycodeName: 'com',
                    type: TLDType.GENERIC,
                    description: 'Commercial',
                    pricing: undefined,
                },
            ];
            const mockDomainHacks = ['test.com', 'sub.test.com'];

            mockTldRepository.listTLDs.mockResolvedValue(mockTLDs);
            mockDomainHacksGenerator.prototype.getDomainsHacks.mockReturnValue(mockDomainHacks);

            const request = new Request('https://example.com/api/domains/search?term=test&include_subdomains=true');
            const response = await GET(request);
            const responseData = await response.json();

            expect(response.status).toBe(200);
            expect(responseData).toEqual({ domainHacks: mockDomainHacks });
            expect(mockDomainHacksGenerator.prototype.getDomainsHacks).toHaveBeenCalledWith('test', true);
        });

        it('should default include_subdomains to false when not provided', async () => {
            const mockTLDs = [
                {
                    name: 'com',
                    punycodeName: 'com',
                    type: TLDType.GENERIC,
                    description: 'Commercial',
                    pricing: undefined,
                },
            ];
            const mockDomainHacks = ['test.com'];

            mockTldRepository.listTLDs.mockResolvedValue(mockTLDs);
            mockDomainHacksGenerator.prototype.getDomainsHacks.mockReturnValue(mockDomainHacks);

            const request = new Request('https://example.com/api/domains/search?term=test');
            const response = await GET(request);

            expect(mockDomainHacksGenerator.prototype.getDomainsHacks).toHaveBeenCalledWith('test', false);
        });

        it('should handle empty term parameter', async () => {
            const mockTLDs = [
                {
                    name: 'com',
                    punycodeName: 'com',
                    type: TLDType.GENERIC,
                    description: 'Commercial',
                    pricing: undefined,
                },
            ];
            const mockDomainHacks: string[] = [];

            mockTldRepository.listTLDs.mockResolvedValue(mockTLDs);
            mockDomainHacksGenerator.prototype.getDomainsHacks.mockReturnValue(mockDomainHacks);

            const request = new Request('https://example.com/api/domains/search');
            const response = await GET(request);
            const responseData = await response.json();

            expect(response.status).toBe(200);
            expect(responseData).toEqual({ domainHacks: [] });
            expect(mockDomainHacksGenerator.prototype.getDomainsHacks).toHaveBeenCalledWith('', false);
        });

        it('should throw error when repository throws', async () => {
            const mockError = new Error('Database connection failed');
            mockTldRepository.listTLDs.mockRejectedValue(mockError);

            const request = new Request('https://example.com/api/domains/search?term=test');

            await expect(GET(request)).rejects.toThrow('Database connection failed');
        });
    });
});
