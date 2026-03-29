import { whoisDomain } from 'whoiser';

import { GET } from '@/app/api/domains/[name]/whois/route';

jest.mock('whoiser', () => ({
    whoisDomain: jest.fn(),
}));

const mockWhoisDomain = whoisDomain as jest.MockedFunction<typeof whoisDomain>;

describe('/api/domains/[name]/whois', () => {
    const mockCtx = { params: Promise.resolve({ name: 'example.com' }) };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should map registry-style WHOIS from whoiser', async () => {
        mockWhoisDomain.mockResolvedValue({
            'whois.verisign-grs.com': {
                'Domain Status': ['clientDeleteProhibited https://icann.org/epp#clientDeleteProhibited'],
                'Domain Name': 'EXAMPLE.COM',
                'Updated Date': '2026-01-16T18:26:50Z',
                'Created Date': '1995-08-14T04:00:00Z',
                'Expiry Date': '2026-08-13T04:00:00Z',
                Registrar: 'RESERVED-Internet Assigned Numbers Authority',
                'Registrar URL': 'http://res-dom.iana.org',
            },
        });

        const request = new Request('https://example.com/api/domains/example.com/whois');
        const response = await GET(request, mockCtx);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({
            creationDate: '1995-08-14T04:00:00Z',
            expirationDate: '2026-08-13T04:00:00Z',
            lastUpdatedDate: '2026-01-16T18:26:50Z',
            registrar: 'RESERVED-Internet Assigned Numbers Authority',
            registrarUrl: 'http://res-dom.iana.org',
            registrantName: undefined,
        });
        expect(mockWhoisDomain).toHaveBeenCalledWith('example.com', { follow: 2, timeout: 15_000 });
    });

    it('should fall back to Registrant Organization when Registrant Name is absent', async () => {
        mockWhoisDomain.mockResolvedValue({
            'whois.registrar.example': {
                'Created Date': '2020-01-01T00:00:00Z',
                'Expiry Date': '2026-01-01T00:00:00Z',
                Registrar: 'Example Registrar',
                'Registrant Organization': 'Acme Ltd',
            },
        });

        const request = new Request('https://example.com/api/domains/example.com/whois');
        const response = await GET(request, mockCtx);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.registrantName).toBe('Acme Ltd');
    });

    it('should use first element when date fields are arrays', async () => {
        mockWhoisDomain.mockResolvedValue({
            'whois.example.org': {
                'Created Date': ['1995-08-14T04:00:00Z', '1995-08-15T04:00:00Z'],
                'Expiry Date': ['2026-08-13T04:00:00Z'],
                'Updated Date': ['2026-01-16T18:26:50Z'],
                Registrar: 'Example Registrar',
                'Registrar URL': 'https://registrar.example',
                'Registrant Name': ['Alice', 'Bob'],
            },
        });

        const request = new Request('https://example.com/api/domains/example.com/whois');
        const response = await GET(request, mockCtx);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({
            creationDate: '1995-08-14T04:00:00Z',
            expirationDate: '2026-08-13T04:00:00Z',
            lastUpdatedDate: '2026-01-16T18:26:50Z',
            registrar: 'Example Registrar',
            registrarUrl: 'https://registrar.example',
            registrantName: 'Alice',
        });
    });

    it('should use the first WHOIS record only when multiple servers are returned', async () => {
        mockWhoisDomain.mockResolvedValue({
            'whois.registry.example': { error: 'timeout' },
            'whois.registrar.example': {
                'Created Date': '2020-01-01T00:00:00Z',
                'Expiry Date': '2026-01-01T00:00:00Z',
                Registrar: 'Good Registrar',
            },
        });

        const request = new Request('https://example.com/api/domains/example.com/whois');
        const response = await GET(request, mockCtx);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.registrar).toBeUndefined();
        expect(responseData.creationDate).toBeUndefined();
    });

    it('should return empty payload when whoiser returns no usable data', async () => {
        mockWhoisDomain.mockResolvedValue({});

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
        expect(mockWhoisDomain).not.toHaveBeenCalled();
    });

    it('should return 500 when whoiser throws', async () => {
        mockWhoisDomain.mockRejectedValue(new Error('TLD not supported'));

        const request = new Request('https://example.com/api/domains/example.com/whois');
        const response = await GET(request, mockCtx);
        const responseData = await response.json();

        expect(response.status).toBe(500);
        expect(responseData).toEqual({ error: 'Internal server error' });
    });
});
