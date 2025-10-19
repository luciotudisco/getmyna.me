import { Registrar, TLD, TLDType } from '@/models/tld';
import { tldRepository } from '@/services/tld-repository';
import { TTLCache } from '@/utils/cache';

// Mock the Supabase client
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(),
}));

// Mock the cache
jest.mock('@/utils/cache', () => ({
    TTLCache: jest.fn().mockImplementation(() => ({
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
    })),
}));

describe('TLDRepository', () => {
    let mockSupabaseClient: any;
    let mockCache: jest.Mocked<TTLCache<unknown>>;

    beforeEach(() => {
        jest.clearAllMocks();

        // Create mock Supabase client
        mockSupabaseClient = {
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
            upsert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
        };

        // Inject the mock client into the repository
        (tldRepository as any).client = mockSupabaseClient;

        // Get the mocked cache instance
        mockCache = (tldRepository as any).cache;
    });

    describe('countTLDs', () => {
        it('should return the count of TLDs', async () => {
            const mockData = [{}, {}, {}]; // 3 items
            mockSupabaseClient.from = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue({
                    data: mockData,
                    error: null,
                }),
            });

            const count = await tldRepository.countTLDs();

            expect(count).toBe(3);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('tld');
        });
    });

    describe('createTld', () => {
        it('should create a new TLD and invalidate cache', async () => {
            const mockTLD: TLD = {
                countryCode: 'US',
                name: 'com',
                punycodeName: 'com',
                type: TLDType.GENERIC,
                description: 'Commercial',
                organization: 'VeriSign',
                tagline: 'For commercial use',
                pricing: {
                    [Registrar.PORKBUN]: {
                        registration: 10.99,
                        renewal: 12.99,
                        currency: 'USD',
                    },
                },
                yearEstablished: 1985,
            };

            mockSupabaseClient.from = jest.fn().mockReturnValue({
                upsert: jest.fn().mockResolvedValue({
                    error: null,
                }),
            });

            await tldRepository.createTld(mockTLD);

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('tld');
            expect(mockCache.delete).toHaveBeenCalledWith('tlds');
            expect(mockCache.delete).toHaveBeenCalledWith('tld:com');
            expect(mockCache.delete).toHaveBeenCalledWith('tld:exists:com');
        });
    });

    describe('getTLD', () => {
        const mockTLDData = {
            country_code: 'US',
            name: 'com',
            punycode_name: 'com',
            type: TLDType.GENERIC,
            description: 'Commercial',
            organization: 'VeriSign',
            tagline: 'For commercial use',
            pricing: {},
            year_established: 1985,
        };

        it('should return cached TLD if available', async () => {
            const cachedTLD: TLD = {
                countryCode: 'US',
                name: 'com',
                punycodeName: 'com',
                type: TLDType.GENERIC,
                organization: 'VeriSign',
                tagline: 'For commercial use',
                yearEstablished: 1985,
            };

            mockCache.get.mockReturnValue(cachedTLD);

            const result = await tldRepository.getTLD('com');

            expect(result).toBe(cachedTLD);
            expect(mockCache.get).toHaveBeenCalledWith('tld:com');
            expect(mockSupabaseClient.from).not.toHaveBeenCalled();
        });

        it('should fetch TLD from database and cache it', async () => {
            mockCache.get.mockReturnValue(undefined);
            mockSupabaseClient.from = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: mockTLDData,
                            error: null,
                        }),
                    }),
                }),
            });

            const result = await tldRepository.getTLD('com');

            expect(result).toEqual({
                countryCode: 'US',
                name: 'com',
                punycodeName: 'com',
                type: TLDType.GENERIC,
                description: 'Commercial',
                organization: 'VeriSign',
                tagline: 'For commercial use',
                pricing: {},
                yearEstablished: 1985,
            });
            expect(mockCache.set).toHaveBeenCalledWith('tld:com', expect.any(Object), 60000);
        });

        it('should search by punycode_name when name starts with xn--', async () => {
            mockCache.get.mockReturnValue(undefined);
            const mockEq = jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                    data: mockTLDData,
                    error: null,
                }),
            });

            mockSupabaseClient.from = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: mockEq,
                }),
            });

            await tldRepository.getTLD('xn--test');

            expect(mockEq).toHaveBeenCalledWith('punycode_name', 'xn--test');
        });

        it('should return null and cache when TLD not found (PGRST116)', async () => {
            mockCache.get.mockReturnValue(undefined);
            mockSupabaseClient.from = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: null,
                            error: { code: 'PGRST116', message: 'No rows returned' },
                        }),
                    }),
                }),
            });

            const result = await tldRepository.getTLD('nonexistent');

            expect(result).toBeNull();
            expect(mockCache.set).toHaveBeenCalledWith('tld:nonexistent', null, 60000);
        });
    });

    describe('listTLDs', () => {
        const mockTLDsData = [
            {
                country_code: 'US',
                name: 'com',
                punycode_name: 'com',
                type: TLDType.GENERIC,
                description: 'Commercial',
                organization: 'VeriSign',
                tagline: 'For commercial use',
                pricing: {},
                year_established: 1985,
            },
            {
                country_code: null,
                name: 'net',
                punycode_name: 'net',
                type: TLDType.GENERIC,
                description: 'Network',
                organization: 'VeriSign',
                tagline: 'For network infrastructure',
                pricing: {},
                year_established: 1985,
            },
        ];

        it('should return cached TLDs if available', async () => {
            const cachedTLDs: TLD[] = [{ name: 'com' }, { name: 'net' }];
            mockCache.get.mockReturnValue(cachedTLDs);

            const result = await tldRepository.listTLDs();

            expect(result).toBe(cachedTLDs);
            expect(mockCache.get).toHaveBeenCalledWith('tlds');
            expect(mockSupabaseClient.from).not.toHaveBeenCalled();
        });

        it('should fetch TLDs from database and cache them', async () => {
            mockCache.get.mockReturnValue(undefined);
            mockSupabaseClient.from = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    order: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue({
                            data: mockTLDsData,
                            error: null,
                        }),
                    }),
                }),
            });

            const result = await tldRepository.listTLDs();

            expect(result).toEqual([
                {
                    countryCode: 'US',
                    name: 'com',
                    punycodeName: 'com',
                    type: TLDType.GENERIC,
                    description: 'Commercial',
                    organization: 'VeriSign',
                    tagline: 'For commercial use',
                    pricing: {},
                    yearEstablished: 1985,
                },
                {
                    countryCode: null,
                    name: 'net',
                    punycodeName: 'net',
                    type: TLDType.GENERIC,
                    description: 'Network',
                    organization: 'VeriSign',
                    tagline: 'For network infrastructure',
                    pricing: {},
                    yearEstablished: 1985,
                },
            ]);
            expect(mockCache.set).toHaveBeenCalledWith('tlds', expect.any(Array), 60000);
        });
    });

    describe('updateTLD', () => {
        const mockTLD: TLD = {
            countryCode: 'US',
            name: 'com',
            punycodeName: 'com',
            type: TLDType.GENERIC,
            description: 'Updated Commercial',
            organization: 'VeriSign',
            tagline: 'Updated tagline for commercial use',
            pricing: {},
            yearEstablished: 1985,
        };

        it('should update TLD and invalidate cache', async () => {
            mockSupabaseClient.from = jest.fn().mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        error: null,
                    }),
                }),
            });

            await tldRepository.updateTLD('com', mockTLD);

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('tld');
            expect(mockCache.delete).toHaveBeenCalledWith('tlds');
            expect(mockCache.delete).toHaveBeenCalledWith('tld:com');
            expect(mockCache.delete).toHaveBeenCalledWith('tld:exists:com');
        });

        it('should search by punycode_name when name starts with xn--', async () => {
            const mockEq = jest.fn().mockResolvedValue({
                error: null,
            });

            mockSupabaseClient.from = jest.fn().mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: mockEq,
                }),
            });

            await tldRepository.updateTLD('xn--test', mockTLD);

            expect(mockEq).toHaveBeenCalledWith('punycode_name', 'xn--test');
        });
    });
});
