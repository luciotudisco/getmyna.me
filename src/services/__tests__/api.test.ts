import axios, { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { APIClient } from '@/services/api';
import { DigInfo, DNSRecordType } from '@/models/dig';
import { DomainStatus } from '@/models/domain';
import { TLD, TLDType, Registrar } from '@/models/tld';
import { WhoisInfo } from '@/models/whois';

// Mock the APIClient to use a shared axios instance for testing
class TestableAPIClient extends APIClient {
    constructor(axiosInstance: AxiosInstance) {
        super();
        // @ts-ignore - Access private property for testing
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

    describe('digDomain', () => {
        it('should return dig information for a domain', async () => {
            const mockDigInfo: DigInfo = {
                records: {
                    [DNSRecordType.A]: ['192.168.1.1', '192.168.1.2'],
                    [DNSRecordType.AAAA]: ['2001:db8::1'],
                    [DNSRecordType.MX]: ['10 mail.example.com'],
                },
            };

            mockAdapter.onGet('/api/domains/example.com/dig').reply(200, mockDigInfo);

            const result = await apiClient.digDomain('example.com');

            expect(result).toEqual(mockDigInfo);
        });

        it('should handle empty dig records', async () => {
            const mockDigInfo: DigInfo = {
                records: {},
            };

            mockAdapter.onGet('/api/domains/example.com/dig').reply(200, mockDigInfo);

            const result = await apiClient.digDomain('example.com');

            expect(result).toEqual(mockDigInfo);
        });

        it('should handle network errors', async () => {
            mockAdapter.onGet('/api/domains/example.com/dig').networkError();

            await expect(apiClient.digDomain('example.com')).rejects.toThrow();
        });

        it('should handle HTTP error responses', async () => {
            mockAdapter.onGet('/api/domains/example.com/dig').reply(500, { error: 'Internal Server Error' });

            await expect(apiClient.digDomain('example.com')).rejects.toThrow();
        });
    });

    describe('getDomainStatus', () => {
        it('should return domain status from API response', async () => {
            const mockResponse = {
                status: [
                    { summary: 'active' },
                    { summary: 'claimed' },
                ],
            };

            mockAdapter.onGet('/api/domains/example.com/status').reply(200, mockResponse);

            const result = await apiClient.getDomainStatus('example.com');

            expect(result).toBe(DomainStatus.claimed);
        });

        it('should return error status when no status array is provided', async () => {
            const mockResponse = {};

            mockAdapter.onGet('/api/domains/example.com/status').reply(200, mockResponse);

            const result = await apiClient.getDomainStatus('example.com');

            expect(result).toBe(DomainStatus.error);
        });

        it('should return error status when status array is empty', async () => {
            const mockResponse = { status: [] };

            mockAdapter.onGet('/api/domains/example.com/status').reply(200, mockResponse);

            const result = await apiClient.getDomainStatus('example.com');

            expect(result).toBe(DomainStatus.error);
        });

        it('should return error status when last status has no summary', async () => {
            const mockResponse = {
                status: [{ summary: 'active' }, {}],
            };

            mockAdapter.onGet('/api/domains/example.com/status').reply(200, mockResponse);

            const result = await apiClient.getDomainStatus('example.com');

            expect(result).toBe(DomainStatus.error);
        });

        it('should handle network errors', async () => {
            mockAdapter.onGet('/api/domains/example.com/status').networkError();

            await expect(apiClient.getDomainStatus('example.com')).rejects.toThrow();
        });

        it('should handle HTTP error responses', async () => {
            mockAdapter.onGet('/api/domains/example.com/status').reply(404, { error: 'Domain not found' });

            await expect(apiClient.getDomainStatus('example.com')).rejects.toThrow();
        });
    });

    describe('getDomainWhois', () => {
        it('should return whois information for a domain', async () => {
            const mockWhoisInfo: WhoisInfo = {
                creationDate: '2020-01-01T00:00:00Z',
                expirationDate: '2025-01-01T00:00:00Z',
                lastUpdatedDate: '2023-01-01T00:00:00Z',
                registrar: 'Example Registrar',
                registrarUrl: 'https://example-registrar.com',
            };

            mockAdapter.onGet('/api/domains/example.com/whois').reply(200, mockWhoisInfo);

            const result = await apiClient.getDomainWhois('example.com');

            expect(result).toEqual(mockWhoisInfo);
        });

        it('should handle whois info with null values', async () => {
            const mockWhoisInfo: WhoisInfo = {
                creationDate: null,
                expirationDate: null,
                lastUpdatedDate: null,
                registrar: null,
                registrarUrl: null,
            };

            mockAdapter.onGet('/api/domains/example.com/whois').reply(200, mockWhoisInfo);

            const result = await apiClient.getDomainWhois('example.com');

            expect(result).toEqual(mockWhoisInfo);
        });

        it('should handle network errors', async () => {
            mockAdapter.onGet('/api/domains/example.com/whois').networkError();

            await expect(apiClient.getDomainWhois('example.com')).rejects.toThrow();
        });

        it('should handle HTTP error responses', async () => {
            mockAdapter.onGet('/api/domains/example.com/whois').reply(500, { error: 'Internal Server Error' });

            await expect(apiClient.getDomainWhois('example.com')).rejects.toThrow();
        });
    });

    describe('getTldInfo', () => {
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

            const result = await apiClient.getTldInfo('example.com');

            expect(result).toEqual(mockTldInfo);
        });

        it('should handle minimal TLD information', async () => {
            const mockTldInfo: TLD = {
                name: 'com',
            };

            mockAdapter.onGet('/api/domains/example.com/tld').reply(200, mockTldInfo);

            const result = await apiClient.getTldInfo('example.com');

            expect(result).toEqual(mockTldInfo);
        });

        it('should handle network errors', async () => {
            mockAdapter.onGet('/api/domains/example.com/tld').networkError();

            await expect(apiClient.getTldInfo('example.com')).rejects.toThrow();
        });

        it('should handle HTTP error responses', async () => {
            mockAdapter.onGet('/api/domains/example.com/tld').reply(404, { error: 'TLD not found' });

            await expect(apiClient.getTldInfo('example.com')).rejects.toThrow();
        });
    });

    describe('listTLDs', () => {
        it('should return list of TLDs', async () => {
            const mockTlds: TLD[] = [
                { name: 'com', description: 'Commercial' },
                { name: 'org', description: 'Organization' },
                { name: 'net', description: 'Network' },
            ];

            const mockResponse = { tlds: mockTlds };

            mockAdapter.onGet('/api/tlds').reply(200, mockResponse);

            const result = await apiClient.listTLDs();

            expect(result).toEqual(mockTlds);
        });

        it('should return empty array when tlds property is missing', async () => {
            const mockResponse = {};

            mockAdapter.onGet('/api/tlds').reply(200, mockResponse);

            const result = await apiClient.listTLDs();

            expect(result).toEqual([]);
        });

        it('should return empty array when tlds property is null', async () => {
            const mockResponse = { tlds: null };

            mockAdapter.onGet('/api/tlds').reply(200, mockResponse);

            const result = await apiClient.listTLDs();

            expect(result).toEqual([]);
        });

        it('should handle network errors', async () => {
            mockAdapter.onGet('/api/tlds').networkError();

            await expect(apiClient.listTLDs()).rejects.toThrow();
        });

        it('should handle HTTP error responses', async () => {
            mockAdapter.onGet('/api/tlds').reply(500, { error: 'Internal Server Error' });

            await expect(apiClient.listTLDs()).rejects.toThrow();
        });
    });

    describe('searchDomains', () => {
        it('should search domains with default parameters', async () => {
            const mockDomains = ['example.com', 'test.com', 'demo.com'];
            const mockResponse = { domains: mockDomains };

            mockAdapter.onGet('/api/domains/search', { params: { term: 'example', include_subdomains: false } }).reply(200, mockResponse);

            const result = await apiClient.searchDomains('example');

            expect(result).toEqual(mockDomains);
        });

        it('should search domains with subdomains included', async () => {
            const mockDomains = ['example.com', 'sub.example.com', 'test.example.com'];
            const mockResponse = { domains: mockDomains };

            mockAdapter.onGet('/api/domains/search', { params: { term: 'example', include_subdomains: true } }).reply(200, mockResponse);

            const result = await apiClient.searchDomains('example', true);

            expect(result).toEqual(mockDomains);
        });

        it('should return empty array when domains property is missing', async () => {
            const mockResponse = {};

            mockAdapter.onGet('/api/domains/search', { params: { term: 'example', include_subdomains: false } }).reply(200, mockResponse);

            const result = await apiClient.searchDomains('example');

            expect(result).toEqual([]);
        });

        it('should return empty array when domains property is null', async () => {
            const mockResponse = { domains: null };

            mockAdapter.onGet('/api/domains/search', { params: { term: 'example', include_subdomains: false } }).reply(200, mockResponse);

            const result = await apiClient.searchDomains('example');

            expect(result).toEqual([]);
        });

        it('should handle network errors', async () => {
            mockAdapter.onGet('/api/domains/search').networkError();

            await expect(apiClient.searchDomains('example')).rejects.toThrow();
        });

        it('should handle HTTP error responses', async () => {
            mockAdapter.onGet('/api/domains/search').reply(400, { error: 'Invalid search term' });

            await expect(apiClient.searchDomains('example')).rejects.toThrow();
        });

        it('should handle special characters in search term', async () => {
            const mockDomains = ['test-domain.com'];
            const mockResponse = { domains: mockDomains };

            mockAdapter.onGet('/api/domains/search', { params: { term: 'test-domain', include_subdomains: false } }).reply(200, mockResponse);

            const result = await apiClient.searchDomains('test-domain');

            expect(result).toEqual(mockDomains);
        });
    });

    describe('Error Handling', () => {
        it('should handle timeout errors', async () => {
            mockAdapter.onGet('/api/domains/example.com/status').timeout();

            await expect(apiClient.getDomainStatus('example.com')).rejects.toThrow();
        });

        it('should handle 404 errors', async () => {
            mockAdapter.onGet('/api/domains/nonexistent.com/status').reply(404, { error: 'Not Found' });

            await expect(apiClient.getDomainStatus('nonexistent.com')).rejects.toThrow();
        });

        it('should handle 500 errors', async () => {
            mockAdapter.onGet('/api/domains/example.com/status').reply(500, { error: 'Internal Server Error' });

            await expect(apiClient.getDomainStatus('example.com')).rejects.toThrow();
        });

        it('should handle malformed JSON responses', async () => {
            // Mock a response that will cause JSON parsing to fail
            mockAdapter.onGet('/api/domains/example.com/status').reply(200, 'invalid json', {
                'Content-Type': 'application/json'
            });

            // The response will be parsed as a string, not JSON, so the status will be undefined
            const result = await apiClient.getDomainStatus('example.com');
            expect(result).toBe(DomainStatus.error);
        });
    });

    describe('URL Encoding', () => {
        it('should properly encode domain names with special characters', async () => {
            const mockDigInfo: DigInfo = { records: {} };
            const domainWithSpecialChars = 'test-domain.example.com';

            // Mock the request with the original domain name - axios will handle URL encoding
            mockAdapter.onGet(`/api/domains/${domainWithSpecialChars}/dig`).reply(200, mockDigInfo);

            const result = await apiClient.digDomain(domainWithSpecialChars);

            expect(result).toEqual(mockDigInfo);
        });

        it('should handle internationalized domain names', async () => {
            const mockDigInfo: DigInfo = { records: {} };
            const idnDomain = '测试.com';

            // Mock the request with the original domain name - axios will handle URL encoding
            mockAdapter.onGet(`/api/domains/${idnDomain}/dig`).reply(200, mockDigInfo);

            const result = await apiClient.digDomain(idnDomain);

            expect(result).toEqual(mockDigInfo);
        });
    });
});