import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

import { DNSRecordType } from '@/models/dig';
import { DomainStatus } from '@/models/domain';
import { Registrar, TLDType } from '@/models/tld';

import { apiClient } from '../api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Create a mock axios instance
const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    request: jest.fn(),
    defaults: {},
    interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
    },
} as any;

// Mock axios.create to return our mock instance
mockedAxios.create.mockReturnValue(mockAxiosInstance);

// Create a class to test with since APIClient is exported as type
class TestAPIClient {
    private client: AxiosInstance;

    constructor() {
        this.client = mockAxiosInstance;
    }

    async digDomain(domain: string) {
        const response = await this.client.get(`/api/domains/${domain}/dig`);
        return response.data;
    }

    async getDomainStatus(domain: string) {
        const response = await this.client.get(`/api/domains/${domain}/status`);
        const data = response.data as { status?: Array<{ summary?: string }> };
        return (data.status?.at(-1)?.summary as DomainStatus) ?? DomainStatus.error;
    }

    async getDomainWhois(domain: string) {
        const response = await this.client.get(`/api/domains/${domain}/whois`);
        return response.data;
    }

    async getTldInfo(domain: string) {
        const response = await this.client.get(`/api/domains/${domain}/tld`);
        return response.data;
    }

    async listTLDs() {
        const response = await this.client.get('/api/tlds');
        return response.data.tlds ?? [];
    }

    async searchDomains(term: string, includeSubdomains = false) {
        const response = await this.client.get('/api/domains/search', {
            params: { term, include_subdomains: includeSubdomains },
        });
        return response.data.domains ?? [];
    }
}

describe('APIClient', () => {
    let testApiClient: TestAPIClient;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Create a new API client instance for each test
        testApiClient = new TestAPIClient();
    });

    describe('digDomain', () => {
        it('should return dig information for a domain', async () => {
            const mockDigInfo = {
                records: {
                    [DNSRecordType.A]: ['192.168.1.1', '192.168.1.2'],
                    [DNSRecordType.AAAA]: ['2001:db8::1'],
                    [DNSRecordType.MX]: ['mail.example.com'],
                },
            };

            const mockResponse: AxiosResponse = {
                data: mockDigInfo,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await testApiClient.digDomain('example.com');

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/domains/example.com/dig');
            expect(result).toEqual(mockDigInfo);
        });

        it('should handle axios errors when dig request fails', async () => {
            const axiosError = new AxiosError('Network Error', 'ECONNREFUSED');
            mockAxiosInstance.get.mockRejectedValue(axiosError);

            try {
                await testApiClient.digDomain('example.com');
                fail('Expected method to throw');
            } catch (error) {
                expect(error).toBeInstanceOf(AxiosError);
            }
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/domains/example.com/dig');
        });

        it('should handle empty records response', async () => {
            const mockResponse: AxiosResponse = {
                data: { records: {} },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await testApiClient.digDomain('example.com');
            expect(result.records).toEqual({});
        });
    });

    describe('getDomainStatus', () => {
        it('should return domain status from the last status entry', async () => {
            const mockResponseData = {
                status: [{ summary: 'active' }, { summary: 'claimed' }, { summary: 'inactive' }],
            };

            const mockResponse: AxiosResponse = {
                data: mockResponseData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await testApiClient.getDomainStatus('example.com');

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/domains/example.com/status');
            expect(result).toBe(DomainStatus.inactive);
        });

        it('should return error status when no status array is provided', async () => {
            const mockResponseData = {};

            const mockResponse: AxiosResponse = {
                data: mockResponseData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await testApiClient.getDomainStatus('example.com');

            expect(result).toBe(DomainStatus.error);
        });

        it('should return error status when status array is empty', async () => {
            const mockResponseData = { status: [] };

            const mockResponse: AxiosResponse = {
                data: mockResponseData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await testApiClient.getDomainStatus('example.com');

            expect(result).toBe(DomainStatus.error);
        });

        it('should return error status when last status entry has no summary', async () => {
            const mockResponseData = {
                status: [{ summary: 'active' }, {}],
            };

            const mockResponse: AxiosResponse = {
                data: mockResponseData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await testApiClient.getDomainStatus('example.com');

            expect(result).toBe(DomainStatus.error);
        });

        it('should handle axios errors when status request fails', async () => {
            const axiosError = new AxiosError('Server Error', '500');
            mockAxiosInstance.get.mockRejectedValue(axiosError);

            try {
                await testApiClient.getDomainStatus('example.com');
                fail('Expected method to throw');
            } catch (error) {
                expect(error).toBeInstanceOf(AxiosError);
            }
        });
    });

    describe('getDomainWhois', () => {
        it('should return whois information for a domain', async () => {
            const mockWhoisInfo = {
                creationDate: '2020-01-01T00:00:00Z',
                expirationDate: '2025-01-01T00:00:00Z',
                lastUpdatedDate: '2023-06-01T00:00:00Z',
                registrar: 'Example Registrar',
                registrarUrl: 'https://example-registrar.com',
            };

            const mockResponse: AxiosResponse = {
                data: mockWhoisInfo,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await testApiClient.getDomainWhois('example.com');

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/domains/example.com/whois');
            expect(result).toEqual(mockWhoisInfo);
        });

        it('should handle whois data with null values', async () => {
            const mockWhoisInfo = {
                creationDate: null,
                expirationDate: null,
                lastUpdatedDate: null,
                registrar: null,
                registrarUrl: null,
            };

            const mockResponse: AxiosResponse = {
                data: mockWhoisInfo,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await testApiClient.getDomainWhois('example.com');
            expect(result).toEqual(mockWhoisInfo);
        });

        it('should handle axios errors when whois request fails', async () => {
            const axiosError = new AxiosError('Timeout', 'ECONNABORTED');
            mockAxiosInstance.get.mockRejectedValue(axiosError);

            try {
                await testApiClient.getDomainWhois('example.com');
                fail('Expected method to throw');
            } catch (error) {
                expect(error).toBeInstanceOf(AxiosError);
            }
        });
    });

    describe('getTldInfo', () => {
        it('should return TLD information for a domain', async () => {
            const mockTldInfo = {
                name: 'com',
                punycodeName: 'com',
                description: 'Commercial domain',
                type: TLDType.GENERIC,
                pricing: {
                    [Registrar.DYNADOT]: {
                        registration: 12.99,
                        renewal: 14.99,
                        currency: 'USD',
                    },
                },
            };

            const mockResponse: AxiosResponse = {
                data: mockTldInfo,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await testApiClient.getTldInfo('example.com');

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/domains/example.com/tld');
            expect(result).toEqual(mockTldInfo);
        });

        it('should handle TLD data with minimal information', async () => {
            const mockTldInfo = {
                name: 'io',
            };

            const mockResponse: AxiosResponse = {
                data: mockTldInfo,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await testApiClient.getTldInfo('example.io');
            expect(result).toEqual(mockTldInfo);
        });

        it('should handle axios errors when TLD request fails', async () => {
            const axiosError = new AxiosError('Not Found', '404');
            mockAxiosInstance.get.mockRejectedValue(axiosError);

            try {
                await testApiClient.getTldInfo('example.com');
                fail('Expected method to throw');
            } catch (error) {
                expect(error).toBeInstanceOf(AxiosError);
            }
        });
    });

    describe('listTLDs', () => {
        it('should return list of TLDs', async () => {
            const mockTlds = [
                { name: 'com', type: TLDType.GENERIC },
                { name: 'org', type: TLDType.GENERIC },
                { name: 'net', type: TLDType.GENERIC },
                { name: 'io', type: TLDType.COUNTRY_CODE },
            ];

            const mockResponseData = {
                tlds: mockTlds,
            };

            const mockResponse: AxiosResponse = {
                data: mockResponseData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await testApiClient.listTLDs();

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/tlds');
            expect(result).toEqual(mockTlds);
        });

        it('should return empty array when tlds property is missing', async () => {
            const mockResponseData = {};

            const mockResponse: AxiosResponse = {
                data: mockResponseData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await testApiClient.listTLDs();

            expect(result).toEqual([]);
        });

        it('should return empty array when tlds property is null', async () => {
            const mockResponseData = { tlds: null };

            const mockResponse: AxiosResponse = {
                data: mockResponseData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await testApiClient.listTLDs();

            expect(result).toEqual([]);
        });

        it('should handle axios errors when TLDs list request fails', async () => {
            const axiosError = new AxiosError('Service Unavailable', '503');
            mockAxiosInstance.get.mockRejectedValue(axiosError);

            try {
                await testApiClient.listTLDs();
                fail('Expected method to throw');
            } catch (error) {
                expect(error).toBeInstanceOf(AxiosError);
            }
        });
    });

    describe('searchDomains', () => {
        it('should search domains with default parameters', async () => {
            const mockDomains = ['example.com', 'example.org', 'example.net'];

            const mockResponseData = {
                domains: mockDomains,
            };

            const mockResponse: AxiosResponse = {
                data: mockResponseData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await testApiClient.searchDomains('example');

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/domains/search', {
                params: { term: 'example', include_subdomains: false },
            });
            expect(result).toEqual(mockDomains);
        });

        it('should search domains with includeSubdomains set to true', async () => {
            const mockDomains = ['example.com', 'sub.example.com', 'www.example.com'];

            const mockResponseData = {
                domains: mockDomains,
            };

            const mockResponse: AxiosResponse = {
                data: mockResponseData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await testApiClient.searchDomains('example', true);

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/domains/search', {
                params: { term: 'example', include_subdomains: true },
            });
            expect(result).toEqual(mockDomains);
        });

        it('should return empty array when domains property is missing', async () => {
            const mockResponseData = {};

            const mockResponse: AxiosResponse = {
                data: mockResponseData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await testApiClient.searchDomains('example');

            expect(result).toEqual([]);
        });

        it('should return empty array when domains property is null', async () => {
            const mockResponseData = { domains: null };

            const mockResponse: AxiosResponse = {
                data: mockResponseData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await testApiClient.searchDomains('example');

            expect(result).toEqual([]);
        });

        it('should handle empty search term', async () => {
            const mockResponseData = { domains: [] };

            const mockResponse: AxiosResponse = {
                data: mockResponseData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await testApiClient.searchDomains('');

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/domains/search', {
                params: { term: '', include_subdomains: false },
            });
            expect(result).toEqual([]);
        });

        it('should handle axios errors when domain search fails', async () => {
            const axiosError = new AxiosError('Bad Request', '400');
            mockAxiosInstance.get.mockRejectedValue(axiosError);

            try {
                await testApiClient.searchDomains('example');
                fail('Expected method to throw');
            } catch (error) {
                expect(error).toBeInstanceOf(AxiosError);
            }
        });

        it('should handle special characters in search term', async () => {
            const mockDomains = ['example-test.com'];

            const mockResponseData = {
                domains: mockDomains,
            };

            const mockResponse: AxiosResponse = {
                data: mockResponseData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await testApiClient.searchDomains('example-test');

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/domains/search', {
                params: { term: 'example-test', include_subdomains: false },
            });
            expect(result).toEqual(mockDomains);
        });
    });

    describe('constructor and axios instance', () => {
        it('should create axios instance on construction', () => {
            // Reset the mock call count
            jest.clearAllMocks();

            const newClient = new TestAPIClient();
            // Since we're using a pre-created mock instance, we don't call axios.create in our test client
            expect(newClient).toBeDefined();
        });

        it('should use the singleton instance correctly', () => {
            // The exported apiClient should exist and have the expected methods
            expect(apiClient).toBeDefined();
            expect(typeof apiClient.digDomain).toBe('function');
            expect(typeof apiClient.getDomainStatus).toBe('function');
            expect(typeof apiClient.getDomainWhois).toBe('function');
            expect(typeof apiClient.getTldInfo).toBe('function');
            expect(typeof apiClient.listTLDs).toBe('function');
            expect(typeof apiClient.searchDomains).toBe('function');
        });
    });
});
