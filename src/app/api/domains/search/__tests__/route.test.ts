import { DomainHacksGenerator } from '@/services/domain-hacks';
import { tldRepository } from '@/services/tld-repository';

import { GET } from '../route';

// Mock the dependencies
jest.mock('@/services/domain-hacks');
jest.mock('@/services/tld-repository');

const mockDomainHacksGenerator = DomainHacksGenerator as jest.MockedClass<typeof DomainHacksGenerator>;
const mockTldRepository = tldRepository as jest.Mocked<typeof tldRepository>;

// Helper function to create a mock request
const createMockRequest = (url: string) => {
    return {
        url,
        method: 'GET',
        headers: new Map(),
    } as any;
};

describe('/api/domains/search', () => {
    let mockGetDomainsHacks: jest.Mock;
    let mockListTLDs: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock the TLD repository
        mockListTLDs = jest.fn();
        mockTldRepository.listTLDs = mockListTLDs;

        // Mock the domain hacks generator
        mockGetDomainsHacks = jest.fn();
        mockDomainHacksGenerator.prototype.getDomainsHacks = mockGetDomainsHacks;
    });

    describe('GET', () => {
        it('should return domain hacks for a search term', async () => {
            // Arrange
            const mockTLDs = [
                { name: 'com', punycodeName: 'com', type: 'generic', description: 'Commercial' },
                { name: 'io', punycodeName: 'io', type: 'generic', description: 'Input/Output' },
                { name: 'es', punycodeName: 'es', type: 'country', description: 'Spain' },
            ];
            const mockDomainHacks = ['example.com', 'test.io', 'demo.es'];

            mockListTLDs.mockResolvedValue(mockTLDs);
            mockGetDomainsHacks.mockReturnValue(mockDomainHacks);

            const request = createMockRequest('http://localhost:3000/api/domains/search?term=example');

            // Act
            const response = await GET(request);
            const data = await response.json();

            // Assert
            expect(response.status).toBe(200);
            expect(data).toEqual({ domainHacks: mockDomainHacks });
            expect(mockListTLDs).toHaveBeenCalledTimes(1);
            expect(mockGetDomainsHacks).toHaveBeenCalledWith('example', false);
        });

        it('should handle include_subdomains parameter correctly', async () => {
            // Arrange
            const mockTLDs = [{ name: 'com', punycodeName: 'com', type: 'generic', description: 'Commercial' }];
            const mockDomainHacks = ['example.com', 'sub.example.com'];

            mockListTLDs.mockResolvedValue(mockTLDs);
            mockGetDomainsHacks.mockReturnValue(mockDomainHacks);

            const request = createMockRequest(
                'http://localhost:3000/api/domains/search?term=example&include_subdomains=true',
            );

            // Act
            const response = await GET(request);
            const data = await response.json();

            // Assert
            expect(response.status).toBe(200);
            expect(data).toEqual({ domainHacks: mockDomainHacks });
            expect(mockGetDomainsHacks).toHaveBeenCalledWith('example', true);
        });

        it('should handle empty search term', async () => {
            // Arrange
            const mockTLDs = [{ name: 'com', punycodeName: 'com', type: 'generic', description: 'Commercial' }];
            const mockDomainHacks: string[] = [];

            mockListTLDs.mockResolvedValue(mockTLDs);
            mockGetDomainsHacks.mockReturnValue(mockDomainHacks);

            const request = createMockRequest('http://localhost:3000/api/domains/search?term=');

            // Act
            const response = await GET(request);
            const data = await response.json();

            // Assert
            expect(response.status).toBe(200);
            expect(data).toEqual({ domainHacks: [] });
            expect(mockGetDomainsHacks).toHaveBeenCalledWith('', false);
        });

        it('should handle missing search term parameter', async () => {
            // Arrange
            const mockTLDs = [{ name: 'com', punycodeName: 'com', type: 'generic', description: 'Commercial' }];
            const mockDomainHacks: string[] = [];

            mockListTLDs.mockResolvedValue(mockTLDs);
            mockGetDomainsHacks.mockReturnValue(mockDomainHacks);

            const request = createMockRequest('http://localhost:3000/api/domains/search');

            // Act
            const response = await GET(request);
            const data = await response.json();

            // Assert
            expect(response.status).toBe(200);
            expect(data).toEqual({ domainHacks: [] });
            expect(mockGetDomainsHacks).toHaveBeenCalledWith('', false);
        });

        it('should handle special characters in search term', async () => {
            // Arrange
            const mockTLDs = [{ name: 'com', punycodeName: 'com', type: 'generic', description: 'Commercial' }];
            const mockDomainHacks = ['test-domain.com'];

            mockListTLDs.mockResolvedValue(mockTLDs);
            mockGetDomainsHacks.mockReturnValue(mockDomainHacks);

            const request = createMockRequest('http://localhost:3000/api/domains/search?term=test-domain');

            // Act
            const response = await GET(request);
            const data = await response.json();

            // Assert
            expect(response.status).toBe(200);
            expect(data).toEqual({ domainHacks: mockDomainHacks });
            expect(mockGetDomainsHacks).toHaveBeenCalledWith('test-domain', false);
        });

        it('should handle multiple words in search term', async () => {
            // Arrange
            const mockTLDs = [
                { name: 'com', punycodeName: 'com', type: 'generic', description: 'Commercial' },
                { name: 'es', punycodeName: 'es', type: 'country', description: 'Spain' },
            ];
            const mockDomainHacks = ['bill.gat.es', 'billgat.es', 'bill.com'];

            mockListTLDs.mockResolvedValue(mockTLDs);
            mockGetDomainsHacks.mockReturnValue(mockDomainHacks);

            const request = createMockRequest('http://localhost:3000/api/domains/search?term=bill gates');

            // Act
            const response = await GET(request);
            const data = await response.json();

            // Assert
            expect(response.status).toBe(200);
            expect(data).toEqual({ domainHacks: mockDomainHacks });
            expect(mockGetDomainsHacks).toHaveBeenCalledWith('bill gates', false);
        });

        it('should handle case insensitive search', async () => {
            // Arrange
            const mockTLDs = [{ name: 'com', punycodeName: 'com', type: 'generic', description: 'Commercial' }];
            const mockDomainHacks = ['EXAMPLE.COM'];

            mockListTLDs.mockResolvedValue(mockTLDs);
            mockGetDomainsHacks.mockReturnValue(mockDomainHacks);

            const request = createMockRequest('http://localhost:3000/api/domains/search?term=EXAMPLE');

            // Act
            const response = await GET(request);
            const data = await response.json();

            // Assert
            expect(response.status).toBe(200);
            expect(data).toEqual({ domainHacks: mockDomainHacks });
            expect(mockGetDomainsHacks).toHaveBeenCalledWith('EXAMPLE', false);
        });

        it('should handle include_subdomains=false explicitly', async () => {
            // Arrange
            const mockTLDs = [{ name: 'com', punycodeName: 'com', type: 'generic', description: 'Commercial' }];
            const mockDomainHacks = ['example.com'];

            mockListTLDs.mockResolvedValue(mockTLDs);
            mockGetDomainsHacks.mockReturnValue(mockDomainHacks);

            const request = createMockRequest(
                'http://localhost:3000/api/domains/search?term=example&include_subdomains=false',
            );

            // Act
            const response = await GET(request);
            const data = await response.json();

            // Assert
            expect(response.status).toBe(200);
            expect(data).toEqual({ domainHacks: mockDomainHacks });
            expect(mockGetDomainsHacks).toHaveBeenCalledWith('example', false);
        });

        it('should handle include_subdomains with any truthy value', async () => {
            // Arrange
            const mockTLDs = [{ name: 'com', punycodeName: 'com', type: 'generic', description: 'Commercial' }];
            const mockDomainHacks = ['example.com', 'sub.example.com'];

            mockListTLDs.mockResolvedValue(mockTLDs);
            mockGetDomainsHacks.mockReturnValue(mockDomainHacks);

            const request = createMockRequest(
                'http://localhost:3000/api/domains/search?term=example&include_subdomains=1',
            );

            // Act
            const response = await GET(request);
            const data = await response.json();

            // Assert
            expect(response.status).toBe(200);
            expect(data).toEqual({ domainHacks: mockDomainHacks });
            // The implementation only checks for exact string 'true', not other truthy values
            expect(mockGetDomainsHacks).toHaveBeenCalledWith('example', false);
        });

        it('should handle TLD repository errors gracefully', async () => {
            // Arrange
            const error = new Error('Database connection failed');
            mockListTLDs.mockRejectedValue(error);

            const request = createMockRequest('http://localhost:3000/api/domains/search?term=example');

            // Act & Assert
            await expect(GET(request)).rejects.toThrow('Database connection failed');
            expect(mockListTLDs).toHaveBeenCalledTimes(1);
        });

        it('should handle domain hacks generator errors gracefully', async () => {
            // Arrange
            const mockTLDs = [{ name: 'com', punycodeName: 'com', type: 'generic', description: 'Commercial' }];
            const error = new Error('Invalid input');

            mockListTLDs.mockResolvedValue(mockTLDs);
            mockGetDomainsHacks.mockImplementation(() => {
                throw error;
            });

            const request = createMockRequest('http://localhost:3000/api/domains/search?term=example');

            // Act & Assert
            await expect(GET(request)).rejects.toThrow('Invalid input');
            expect(mockListTLDs).toHaveBeenCalledTimes(1);
        });

        it('should handle URL with multiple query parameters', async () => {
            // Arrange
            const mockTLDs = [{ name: 'com', punycodeName: 'com', type: 'generic', description: 'Commercial' }];
            const mockDomainHacks = ['example.com'];

            mockListTLDs.mockResolvedValue(mockTLDs);
            mockGetDomainsHacks.mockReturnValue(mockDomainHacks);

            const request = createMockRequest(
                'http://localhost:3000/api/domains/search?term=example&include_subdomains=true&other_param=value',
            );

            // Act
            const response = await GET(request);
            const data = await response.json();

            // Assert
            expect(response.status).toBe(200);
            expect(data).toEqual({ domainHacks: mockDomainHacks });
            expect(mockGetDomainsHacks).toHaveBeenCalledWith('example', true);
        });

        it('should handle whitespace in search term', async () => {
            // Arrange
            const mockTLDs = [{ name: 'com', punycodeName: 'com', type: 'generic', description: 'Commercial' }];
            const mockDomainHacks = ['example.com'];

            mockListTLDs.mockResolvedValue(mockTLDs);
            mockGetDomainsHacks.mockReturnValue(mockDomainHacks);

            const request = createMockRequest('http://localhost:3000/api/domains/search?term=%20example%20');

            // Act
            const response = await GET(request);
            const data = await response.json();

            // Assert
            expect(response.status).toBe(200);
            expect(data).toEqual({ domainHacks: mockDomainHacks });
            expect(mockGetDomainsHacks).toHaveBeenCalledWith(' example ', false);
        });
    });
});
