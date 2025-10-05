import axios, { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { DomainStatus } from '@/models/domain';
import { Registrar, TLD, TLDType } from '@/models/tld';
import { WhoisInfo } from '@/models/whois';
import { APIClient } from '@/services/api';

// Mock the APIClient to use a shared axios instance for testing
class TestableAPIClient extends APIClient {
    constructor(axiosInstance: AxiosInstance) {
        super();
        // @ts-expect-error - Access private property for testing
        this.client = axiosInstance;
    }
}

describe('APIClient', () => {
    let apiClient: TestableAPIClient;
    let mockAdapter: MockAdapter;
    let axiosInstance: AxiosInstance;

    beforeEach(() => {
        axiosInstance = axios.create();
        apiClient = new TestableAPIClient(axiosInstance);
        mockAdapter = new MockAdapter(axiosInstance);
    });

    afterEach(() => {
        mockAdapter.restore();
    });

    describe('getDomainStatus', () => {
        it('should return domain status from API response', async () => {
            const mockResponse = { status: 'claimed' };

            mockAdapter.onGet('/api/domains/example.com/status').reply(200, mockResponse);

            const result = await apiClient.getDomainStatus('example.com');

            expect(result).toBe(DomainStatus.CLAIMED);
        });
    });

    describe('getWhoisInfo', () => {
        it('should return whois information for a domain', async () => {
            const mockWhoisInfo: WhoisInfo = {
                creationDate: '2020-01-01T00:00:00Z',
                expirationDate: '2025-01-01T00:00:00Z',
                lastUpdatedDate: '2023-01-01T00:00:00Z',
                registrar: 'Example Registrar',
                registrarUrl: 'https://example-registrar.com',
            };

            mockAdapter.onGet('/api/domains/example.com/whois').reply(200, mockWhoisInfo);

            const result = await apiClient.getWhoisInfo('example.com');

            expect(result).toEqual(mockWhoisInfo);
        });
    });

    describe('getTld', () => {
        it('should return TLD information for a domain', async () => {
            const mockTldInfo: TLD = {
                name: 'com',
                punycodeName: 'com',
                description: 'Commercial',
                type: TLDType.GENERIC,
                pricing: {
                    [Registrar.DYNADOT]: {
                        registration: 8.99,
                        renewal: 8.99,
                        currency: 'USD',
                    },
                    [Registrar.GANDI]: {
                        registration: 12.99,
                        renewal: 12.99,
                        currency: 'USD',
                    },
                },
            };

            mockAdapter.onGet('/api/domains/example.com/tld').reply(200, mockTldInfo);

            const result = await apiClient.getTLD('example.com');

            expect(result).toEqual(mockTldInfo);
        });
    });

    describe('getTLDsCount', () => {
        it('should return the number of TLDs', async () => {
            const mockCount = 100;

            const mockResponse = { count: mockCount };

            mockAdapter.onGet('/api/tlds/count').reply(200, mockResponse);

            const result = await apiClient.getTLDsCount();

            expect(result).toEqual(mockCount);
        });
    });

    describe('searchDomains', () => {
        it('should search domains with default parameters', async () => {
            const mockDomains = ['example.com', 'test.com', 'demo.com'];
            const mockResponse = { domainHacks: mockDomains };

            mockAdapter
                .onGet('/api/domains/search', { params: { term: 'example', include_subdomains: false } })
                .reply(200, mockResponse);

            const result = await apiClient.searchDomains('example');

            expect(result).toEqual(mockDomains);
        });

        it('should search domains with subdomains included', async () => {
            const mockDomains = ['example.com', 'sub.example.com', 'test.example.com'];
            const mockResponse = { domainHacks: mockDomains };

            mockAdapter
                .onGet('/api/domains/search', { params: { term: 'example', include_subdomains: true } })
                .reply(200, mockResponse);

            const result = await apiClient.searchDomains('example', true);

            expect(result).toEqual(mockDomains);
        });

        it('should handle special characters in search term', async () => {
            const mockDomains = ['test-domain.com'];
            const mockResponse = { domainHacks: mockDomains };

            mockAdapter
                .onGet('/api/domains/search', { params: { term: 'test-domain', include_subdomains: false } })
                .reply(200, mockResponse);

            const result = await apiClient.searchDomains('test-domain');

            expect(result).toEqual(mockDomains);
        });
    });
});
