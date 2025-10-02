import axios from 'axios';

import { GET } from '@/app/api/domains/[name]/whois/route';

jest.mock('axios');

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('/api/domains/[name]/whois', () => {
    const mockCtx = { params: Promise.resolve({ name: 'example.com' }) };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return whois data when API succeeds and returs has string values', async () => {
        const mockApiResponse = {
            data: {
                result: {
                    creation_date: '2023-01-15T10:30:00Z',
                    expiration_date: '2025-01-15T10:30:00Z',
                    updated_date: '2024-06-10T14:20:00Z',
                    registrar: 'Example Registrar Inc.',
                    registrar_url: 'https://example-registrar.com',
                    registrant_name: 'John Doe',
                },
            },
        };
        mockAxios.post.mockResolvedValue(mockApiResponse);

        const request = new Request('https://example.com/api/domains/example.com/whois');
        const response = await GET(request, mockCtx);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({
            creationDate: '2023-01-15T10:30:00Z',
            expirationDate: '2025-01-15T10:30:00Z',
            lastUpdatedDate: '2024-06-10T14:20:00Z',
            registrar: 'Example Registrar Inc.',
            registrarUrl: 'https://example-registrar.com',
            registrantName: 'John Doe',
        });
    });

    it('should return whois data when API succeeds and returns array values', async () => {
        const mockApiResponse = {
            data: {
                result: {
                    creation_date: ['2023-01-15T10:30:00Z', '2023-01-15T10:30:01Z'],
                    expiration_date: ['2025-01-15T10:30:00Z'],
                    updated_date: ['2024-06-10T14:20:00Z', '2024-06-10T14:20:01Z'],
                    registrar: 'Example Registrar Inc.',
                    registrar_url: 'https://example-registrar.com',
                    registrant_name: ['John Doe', 'Jane Doe'],
                },
            },
        };

        mockAxios.post.mockResolvedValue(mockApiResponse);

        const request = new Request('https://example.com/api/domains/example.com/whois');
        const response = await GET(request, mockCtx);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({
            creationDate: '2023-01-15T10:30:00Z', // First element of array
            expirationDate: '2025-01-15T10:30:00Z', // First element of array
            lastUpdatedDate: '2024-06-10T14:20:00Z', // First element of array
            registrar: 'Example Registrar Inc.',
            registrarUrl: 'https://example-registrar.com',
            registrantName: 'John Doe', // First element of array
        });
    });

    it('should return empty values when API returns no result', async () => {
        const mockApiResponse = {
            data: {
                result: null,
            },
        };

        mockAxios.post.mockResolvedValue(mockApiResponse);

        const request = new Request('https://example.com/api/domains/example.com/whois');
        const response = await GET(request, mockCtx);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({
            creationDate: undefined,
            expirationDate: undefined,
            lastUpdatedDate: undefined,
            registrar: undefined,
            registrarUrl: undefined,
            registrantName: undefined,
        });
    });

    it('should return 400 for invalid domain names', async () => {
        const invalidDomainCtx = { params: Promise.resolve({ name: 'invalid-domain' }) };

        const request = new Request('https://example.com/api/domains/invalid-domain/whois');
        const response = await GET(request, invalidDomainCtx);
        const responseData = await response.json();

        expect(response.status).toBe(400);
        expect(responseData).toEqual({ error: "The domain 'invalid-domain' is not a valid domain" });
    });

    it('should raise 500 when an error occurs', async () => {
        const mockError = new Error('Network error');
        mockAxios.post.mockRejectedValue(mockError);

        const request = new Request('https://example.com/api/domains/example.com/whois');
        const response = await GET(request, mockCtx);
        const responseData = await response.json();

        expect(response.status).toBe(500);
        expect(responseData).toEqual({ error: 'Internal server error' });
    });
});
