import axios, { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { DigInfo, DNSRecordType } from '@/models/dig';
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

    describe('getDigInfo', () => {
        it('should return dig information for a domain', async () => {
            const mockDigInfo: DigInfo = {
                records: {
                    [DNSRecordType.A]: ['192.168.1.1', '192.168.1.2'],
                    [DNSRecordType.AAAA]: ['2001:db8::1'],
                    [DNSRecordType.MX]: ['10 mail.example.com'],
                },
            };

            mockAdapter.onGet('/api/domains/example.com/dig').reply(200, mockDigInfo);

            const result = await apiClient.getDigInfo('example.com');

            expect(result).toEqual(mockDigInfo);
        });
    });

    describe('getDomainStatus', () => {
        it('should return domain status from API response', async () => {
            const mockResponse = {
                status: [{ summary: 'active' }, { summary: 'claimed' }],
            };

            mockAdapter.onGet('/api/domains/example.com/status').reply(200, mockResponse);

            const result = await apiClient.getDomainStatus('example.com');

            expect(result).toBe(DomainStatus.claimed);
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

        it('should return zero when count is zero', async () => {
            const mockCount = 0;

            const mockResponse = { count: mockCount };

            mockAdapter.onGet('/api/tlds/count').reply(200, mockResponse);

            const result = await apiClient.getTLDsCount();

            expect(result).toEqual(0);
        });

        it('should return zero when response has no count field', async () => {
            const mockResponse = {};

            mockAdapter.onGet('/api/tlds/count').reply(200, mockResponse);

            const result = await apiClient.getTLDsCount();

            expect(result).toEqual(0);
        });

        it('should return zero when count is null', async () => {
            const mockResponse = { count: null };

            mockAdapter.onGet('/api/tlds/count').reply(200, mockResponse);

            const result = await apiClient.getTLDsCount();

            expect(result).toEqual(0);
        });

        it('should return zero when count is undefined', async () => {
            const mockResponse = { count: undefined };

            mockAdapter.onGet('/api/tlds/count').reply(200, mockResponse);

            const result = await apiClient.getTLDsCount();

            expect(result).toEqual(0);
        });

        it('should handle large count values', async () => {
            const mockCount = 999999;

            const mockResponse = { count: mockCount };

            mockAdapter.onGet('/api/tlds/count').reply(200, mockResponse);

            const result = await apiClient.getTLDsCount();

            expect(result).toEqual(mockCount);
        });

        it('should handle string count values', async () => {
            const mockResponse = { count: '1500' };

            mockAdapter.onGet('/api/tlds/count').reply(200, mockResponse);

            const result = await apiClient.getTLDsCount();

            expect(result).toEqual('1500');
        });

        it('should handle 404 error response', async () => {
            mockAdapter.onGet('/api/tlds/count').reply(404, { error: 'Not found' });

            await expect(apiClient.getTLDsCount()).rejects.toThrow();
        });

        it('should handle 500 error response', async () => {
            mockAdapter.onGet('/api/tlds/count').reply(500, { error: 'Internal server error' });

            await expect(apiClient.getTLDsCount()).rejects.toThrow();
        });

        it('should handle network timeout', async () => {
            mockAdapter.onGet('/api/tlds/count').timeout();

            await expect(apiClient.getTLDsCount()).rejects.toThrow();
        });

        it('should handle network error', async () => {
            mockAdapter.onGet('/api/tlds/count').networkError();

            await expect(apiClient.getTLDsCount()).rejects.toThrow();
        });


        it('should handle empty response body', async () => {
            mockAdapter.onGet('/api/tlds/count').reply(200, {});

            const result = await apiClient.getTLDsCount();

            expect(result).toEqual(0);
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
