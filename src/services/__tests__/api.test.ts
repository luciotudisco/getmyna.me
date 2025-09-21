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

        it('should handle special characters in search term', async () => {
            const mockDomains = ['test-domain.com'];
            const mockResponse = { domains: mockDomains };

            mockAdapter.onGet('/api/domains/search', { params: { term: 'test-domain', include_subdomains: false } }).reply(200, mockResponse);

            const result = await apiClient.searchDomains('test-domain');

            expect(result).toEqual(mockDomains);
        });
    });

});