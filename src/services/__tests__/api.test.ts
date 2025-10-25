import axios, { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { DictionaryEntry } from '@/models/dictionary';
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

    describe('getDomainTLD', () => {
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

            const result = await apiClient.getDomainTLD('example.com');

            expect(result).toEqual(mockTldInfo);
        });
    });

    describe('getTLD', () => {
        it('should return TLD information', async () => {
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

            mockAdapter.onGet('/api/tlds/com').reply(200, mockTldInfo);

            const result = await apiClient.getTLD('com');

            expect(result).toEqual(mockTldInfo);
        });
    });

    describe('isValidTLD', () => {
        it('should return true for valid TLD', async () => {
            const mockTldInfo: TLD = {
                name: 'com',
                punycodeName: 'com',
                description: 'Commercial',
                type: TLDType.GENERIC,
            };

            mockAdapter.onGet('/api/tlds/com').reply(200, { tld: mockTldInfo });

            const result = await apiClient.isValidTLD('com');

            expect(result).toBe(true);
        });

        it('should return false for invalid TLD (404)', async () => {
            mockAdapter.onGet('/api/tlds/invalid').reply(404, { error: 'TLD not found' });

            const result = await apiClient.isValidTLD('invalid');

            expect(result).toBe(false);
        });

        it('should throw error for non-404 API errors', async () => {
            mockAdapter.onGet('/api/tlds/error').reply(500, { error: 'Internal server error' });

            await expect(apiClient.isValidTLD('error')).rejects.toThrow();
        });
    });

    describe('getTLDs', () => {
        it('should return a list of all TLDs', async () => {
            const mockTlds: TLD[] = [
                {
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
                    },
                },
                {
                    name: 'dev',
                    punycodeName: 'dev',
                    description: 'Technology and development',
                    type: TLDType.GENERIC,
                    pricing: {
                        [Registrar.GANDI]: {
                            registration: 15.0,
                            renewal: 15.0,
                            currency: 'USD',
                        },
                    },
                },
                {
                    name: 'uk',
                    punycodeName: 'uk',
                    description: 'United Kingdom',
                    type: TLDType.COUNTRY_CODE,
                },
            ];

            const mockResponse = { tlds: mockTlds };
            mockAdapter.onGet('/api/tlds').reply(200, mockResponse);

            const result = await apiClient.getTLDs();

            expect(result).toEqual(mockTlds);
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

    describe('listWords', () => {
        it('should return dictionary entries with matching domains', async () => {
            const mockEntries: DictionaryEntry[] = [
                { word: 'example', matchingDomains: [{ domain: 'example.com' }, { domain: 'example.dev' }] },
                { word: 'test', matchingDomains: [{ domain: 'test.io' }] },
            ];
            mockAdapter.onGet('/api/dictionary?hasMatchingDomains=true').reply(200, mockEntries);
            const result = (await apiClient.listWords({ hasMatchingDomains: true })) as DictionaryEntry[];
            expect(result).toEqual(mockEntries);
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
