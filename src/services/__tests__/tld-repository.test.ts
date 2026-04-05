import { createClient } from '@supabase/supabase-js';
import { revalidateTag } from 'next/cache';

import { Registrar, TLD, TLDType } from '@/models/tld';
import { tldRepository } from '@/services/tld-repository';

jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(),
}));

jest.mock('next/cache', () => ({
    unstable_cacheLife: jest.fn(),
    unstable_cacheTag: jest.fn(),
    revalidateTag: jest.fn(),
}));

describe('TLDRepository', () => {
    let mockSupabaseClient: any;

    beforeEach(() => {
        jest.clearAllMocks();

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

        (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
        (tldRepository as any).client = mockSupabaseClient;
    });

    describe('countTLDs', () => {
        it('should return the count of TLDs', async () => {
            mockSupabaseClient.from = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue({
                    count: 3,
                    error: null,
                }),
            });

            const count = await tldRepository.count();

            expect(count).toBe(3);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('tld');
        });
    });

    describe('createTld', () => {
        it('should create a new TLD and revalidate cache tags', async () => {
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

            await tldRepository.create(mockTLD);

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('tld');
            expect(revalidateTag).toHaveBeenCalledWith('tlds');
            expect(revalidateTag).toHaveBeenCalledWith('tld:com');
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

        it('should fetch TLD from database', async () => {
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

            const result = await tldRepository.get('com');

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
        });

        it('should search by punycode_name when name starts with xn--', async () => {
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

            await tldRepository.get('xn--test');

            expect(mockEq).toHaveBeenCalledWith('punycode_name', 'xn--test');
        });

        it('should return null when TLD not found (PGRST116)', async () => {
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

            const result = await tldRepository.get('nonexistent');

            expect(result).toBeNull();
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

        it('should fetch TLDs from database', async () => {
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

            const result = await tldRepository.list();

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

        it('should update TLD and revalidate cache tags', async () => {
            const mockUpdate = jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: null }),
            });

            mockSupabaseClient.from = jest.fn().mockReturnValue({
                update: mockUpdate,
            });

            await tldRepository.update('com', mockTLD);

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('tld');
            expect(revalidateTag).toHaveBeenCalledWith('tlds');
            expect(revalidateTag).toHaveBeenCalledWith('tld:com');
        });

        it('should lowercase name and punycode_name in the update payload', async () => {
            const mixedCaseTld: TLD = {
                ...mockTLD,
                name: 'COM',
                punycodeName: 'COM',
            };

            const mockUpdate = jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: null }),
            });

            mockSupabaseClient.from = jest.fn().mockReturnValue({
                update: mockUpdate,
            });

            await tldRepository.update('COM', mixedCaseTld);

            expect(mockUpdate).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'com',
                    punycode_name: 'com',
                }),
            );
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

            await tldRepository.update('xn--test', mockTLD);

            expect(mockEq).toHaveBeenCalledWith('punycode_name', 'xn--test');
        });
    });
});
