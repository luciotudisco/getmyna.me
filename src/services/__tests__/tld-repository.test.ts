import { createClient } from '@supabase/supabase-js';

import { Registrar, TLD, TLDType } from '@/models/tld';
import { tldRepository } from '@/services/tld-repository';

jest.mock('@supabase/supabase-js');
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

// Create a mock Supabase client with proper chaining
const createMockSupabaseClient = () => {
    const mockClient = {
        from: jest.fn(),
    };

    const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
    };

    mockClient.from.mockReturnValue(mockQueryBuilder);
    return { mockClient, mockQueryBuilder };
};

describe('TLDRepository', () => {
    let mockSupabaseClient: any;
    let mockQueryBuilder: any;

    beforeEach(() => {
        jest.clearAllMocks();

        const { mockClient, mockQueryBuilder: queryBuilder } = createMockSupabaseClient();
        mockSupabaseClient = mockClient;
        mockQueryBuilder = queryBuilder;
        mockCreateClient.mockReturnValue(mockSupabaseClient);

        (tldRepository as any).client = mockSupabaseClient;
        (tldRepository as any).cache.clear();
    });

    describe('countTLDs', () => {
        it('should return the count of TLDs successfully', async () => {
            const mockData = [{ name: 'com', punycode_name: 'com' }];
            mockQueryBuilder.select.mockResolvedValue({ data: mockData, error: null, count: mockData.length });

            const result = await tldRepository.countTLDs();

            expect(result).toBe(1);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('tld');
            expect(mockQueryBuilder.select).toHaveBeenCalledWith('*', { count: 'exact' });
        });
    });

    describe('createTld', () => {
        const mockTld: TLD = {
            name: 'com',
            punycodeName: 'com',
            description: 'Commercial domain',
            type: TLDType.GENERIC,
        };

        it('should create a TLD successfully', async () => {
            mockQueryBuilder.upsert.mockResolvedValue({ data: null, error: null } as any);

            await tldRepository.createTld(mockTld);

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('tld');
            expect(mockQueryBuilder.upsert).toHaveBeenCalledWith(
                {
                    name: mockTld.name,
                    punycode_name: mockTld.punycodeName,
                    description: mockTld.description,
                    type: mockTld.type,
                    created_at: expect.any(String),
                    updated_at: expect.any(String),
                },
                {
                    onConflict: 'name,punycode_name',
                },
            );
        });
    });

    describe('getTLD', () => {
        const mockTldData = {
            name: 'com',
            punycode_name: 'com',
            description: 'Commercial domain',
            type: TLDType.GENERIC,
            pricing: {
                [Registrar.DYNADOT]: { registration: 8.99, renewal: 8.99, currency: 'USD' },
            },
        };

        it('should return TLD from cache when available', async () => {
            mockQueryBuilder.single.mockResolvedValue({ data: mockTldData, error: null });

            const firstResult = await tldRepository.getTLD('com');
            expect(firstResult).toEqual({
                name: mockTldData.name,
                punycodeName: mockTldData.punycode_name,
                type: mockTldData.type,
                description: mockTldData.description,
                pricing: mockTldData.pricing,
            });

            // Reset mock to verify second call uses cache
            jest.clearAllMocks();

            // Second call should use cache
            const secondResult = await tldRepository.getTLD('com');
            expect(secondResult).toEqual(firstResult);
            expect(mockSupabaseClient.from).not.toHaveBeenCalled();
        });

        it('should fetch TLD from database when not in cache', async () => {
            mockQueryBuilder.single.mockResolvedValue({ data: mockTldData, error: null });

            const result = await tldRepository.getTLD('com');

            expect(result).toEqual({
                name: mockTldData.name,
                punycodeName: mockTldData.punycode_name,
                type: mockTldData.type,
                description: mockTldData.description,
                pricing: mockTldData.pricing,
            });

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('tld');
            expect(mockQueryBuilder.select).toHaveBeenCalledWith(
                'name, punycode_name, description, direction, type, pricing',
            );
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('name', 'com');
            expect(mockQueryBuilder.single).toHaveBeenCalled();
        });

        it('should use punycode_name field for punycode domains', async () => {
            mockQueryBuilder.single.mockResolvedValue({ data: mockTldData, error: null } as any);

            await tldRepository.getTLD('xn--example');

            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('punycode_name', 'xn--example');
        });

        it('should return null when TLD not found', async () => {
            mockQueryBuilder.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } } as any);

            const result = await tldRepository.getTLD('nonexistent');

            expect(result).toBeNull();
        });
    });

    describe('listTLDs', () => {
        const mockTldsData = [
            {
                name: 'com',
                punycode_name: 'com',
                type: TLDType.GENERIC,
                description: 'Commercial domain',
            },
            {
                name: 'org',
                punycode_name: 'org',
                type: TLDType.GENERIC,
                description: 'Organization domain',
            },
        ];

        it('should return TLDs from cache when available', async () => {
            mockQueryBuilder.limit.mockResolvedValue({ data: mockTldsData, error: null });

            const firstResult = await tldRepository.listTLDs();
            expect(firstResult).toEqual([
                {
                    name: 'com',
                    punycodeName: 'com',
                    type: TLDType.GENERIC,
                    description: 'Commercial domain',
                },
                {
                    name: 'org',
                    punycodeName: 'org',
                    type: TLDType.GENERIC,
                    description: 'Organization domain',
                },
            ]);

            // Reset mock to verify second call uses cache
            jest.clearAllMocks();

            // Second call should use cache
            const secondResult = await tldRepository.listTLDs();
            expect(secondResult).toEqual(firstResult);
            expect(mockSupabaseClient.from).not.toHaveBeenCalled();
        });

        it('should fetch TLDs from database when not in cache', async () => {
            mockQueryBuilder.limit.mockResolvedValue({ data: mockTldsData, error: null } as any);

            const result = await tldRepository.listTLDs();

            expect(result).toEqual([
                {
                    name: 'com',
                    punycodeName: 'com',
                    type: TLDType.GENERIC,
                    description: 'Commercial domain',
                },
                {
                    name: 'org',
                    punycodeName: 'org',
                    type: TLDType.GENERIC,
                    description: 'Organization domain',
                },
            ]);

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('tld');
            expect(mockQueryBuilder.select).toHaveBeenCalledWith(
                'name, punycode_name, type, description, direction, pricing',
            );
            expect(mockQueryBuilder.order).toHaveBeenCalledWith('name', { ascending: true });
            expect(mockQueryBuilder.limit).toHaveBeenCalledWith(5000);
        });
    });

    describe('updateTLD', () => {
        const mockTld: TLD = {
            name: 'com',
            punycodeName: 'com',
            description: 'Updated commercial domain',
            type: TLDType.GENERIC,
            pricing: {
                [Registrar.DYNADOT]: { registration: 9.99, renewal: 9.99, currency: 'USD' },
            },
        };

        it('should update TLD successfully', async () => {
            mockQueryBuilder.eq.mockResolvedValue({ data: null, error: null });

            await tldRepository.updateTLD('com', mockTld);

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('tld');
            expect(mockQueryBuilder.update).toHaveBeenCalledWith({
                name: mockTld.name,
                punycodeName: mockTld.punycodeName,
                description: mockTld.description,
                direction: mockTld.direction,
                pricing: mockTld.pricing,
                type: mockTld.type,
                updated_at: expect.any(String),
            });
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('name', 'com');
        });

        it('should use punycode_name field for punycode domains', async () => {
            mockQueryBuilder.eq.mockResolvedValue({ data: null, error: null });

            await tldRepository.updateTLD('xn--example', mockTld);

            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('punycode_name', 'xn--example');
        });
    });
});
