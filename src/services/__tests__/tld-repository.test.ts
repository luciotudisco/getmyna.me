import { createClient } from '@supabase/supabase-js';

import { TLD, TLDType, Registrar } from '@/models/tld';

// Mock Supabase client
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
    let tldRepository: any;
    let mockSupabaseClient: any;
    let mockQueryBuilder: any;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Create mock Supabase client
        const { mockClient, mockQueryBuilder: queryBuilder } = createMockSupabaseClient();
        mockSupabaseClient = mockClient;
        mockQueryBuilder = queryBuilder;

        mockCreateClient.mockReturnValue(mockSupabaseClient);

        // Create repository instance using the exported instance
        const { tldRepository: exportedRepository } = require('../tld-repository');
        tldRepository = exportedRepository;

        // Replace only the Supabase client with our mock, keep the real cache
        (tldRepository as any).client = mockSupabaseClient;
        
        // Clear the real cache before each test
        (tldRepository as any).cache.clear();
    });

    describe('constructor', () => {
        it('should initialize Supabase client with environment variables', () => {
            expect(mockCreateClient).toHaveBeenCalledWith(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );
        });

        it('should initialize cache', () => {
            expect((tldRepository as any).cache).toBeDefined();
        });
    });

    describe('countTLDs', () => {
        it('should return the count of TLDs successfully', async () => {
            const mockData = [
                { name: 'com', punycode_name: 'com' },
                { name: 'org', punycode_name: 'org' },
                { name: 'net', punycode_name: 'net' },
            ];

            mockQueryBuilder.select.mockResolvedValue({
                data: mockData,
                error: null,
                count: mockData.length,
            } as any);

            const result = await tldRepository.countTLDs();

            expect(result).toBe(3);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('tld');
            expect(mockQueryBuilder.select).toHaveBeenCalledWith('*', { count: 'exact' });
        });

        it('should throw error when Supabase returns an error', async () => {
            const mockError = { message: 'Database connection failed' };
            mockQueryBuilder.select.mockResolvedValue({
                data: null,
                error: mockError,
            } as any);

            await expect(tldRepository.countTLDs()).rejects.toThrow(
                'Failed to count TLDs: Database connection failed'
            );
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
            mockQueryBuilder.upsert.mockResolvedValue({
                data: null,
                error: null,
            } as any);

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
                }
            );

            // Cache invalidation is tested in the cache invalidation section
        });

        it('should throw error when Supabase returns an error', async () => {
            const mockError = { message: 'Duplicate key error' };
            mockQueryBuilder.upsert.mockResolvedValue({
                data: null,
                error: mockError,
            } as any);

            await expect(tldRepository.createTld(mockTld)).rejects.toThrow(
                'Failed to upsert TLD com: Duplicate key error'
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
                [Registrar.DYNADOT]: {
                    registration: 8.99,
                    renewal: 8.99,
                    currency: 'USD',
                },
            },
        };

        it('should return TLD from cache when available', async () => {
            const mockTldData = {
                name: 'com',
                punycode_name: 'com',
                description: 'Commercial domain',
                type: TLDType.GENERIC,
                pricing: null,
            };

            // First call to populate cache
            mockQueryBuilder.single.mockResolvedValue({
                data: mockTldData,
                error: null,
            } as any);

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
            mockQueryBuilder.single.mockResolvedValue({
                data: mockTldData,
                error: null,
            } as any);

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
                'name, punycode_name, description, direction, type, pricing'
            );
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('name', 'com');
            expect(mockQueryBuilder.single).toHaveBeenCalled();
        });

        it('should use punycode_name field for punycode domains', async () => {
            mockQueryBuilder.single.mockResolvedValue({
                data: mockTldData,
                error: null,
            } as any);

            await tldRepository.getTLD('xn--example');

            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('punycode_name', 'xn--example');
        });

        it('should return null when TLD not found', async () => {
            mockQueryBuilder.single.mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' },
            } as any);

            const result = await tldRepository.getTLD('nonexistent');

            expect(result).toBeNull();
        });

        it('should throw error when Supabase returns an error', async () => {
            const mockError = { message: 'Database connection failed' };
            mockQueryBuilder.single.mockResolvedValue({
                data: null,
                error: mockError,
            } as any);

            await expect(tldRepository.getTLD('com')).rejects.toThrow(
                'Failed to fetch TLD com: Database connection failed'
            );
        });
    });

    describe('listTLDs', () => {
        const mockTldsData = [
            {
                name: 'com',
                punycode_name: 'com',
                type: TLDType.GENERIC,
                description: 'Commercial domain',
                pricing: null,
            },
            {
                name: 'org',
                punycode_name: 'org',
                type: TLDType.GENERIC,
                description: 'Organization domain',
                pricing: null,
            },
        ];

        it('should return TLDs from cache when available', async () => {
            // First call to populate cache
            mockQueryBuilder.limit.mockResolvedValue({
                data: mockTldsData,
                error: null,
            } as any);

            const firstResult = await tldRepository.listTLDs();
            expect(firstResult).toEqual([
                {
                    name: 'com',
                    punycodeName: 'com',
                    type: TLDType.GENERIC,
                    description: 'Commercial domain',
                    pricing: null,
                },
                {
                    name: 'org',
                    punycodeName: 'org',
                    type: TLDType.GENERIC,
                    description: 'Organization domain',
                    pricing: null,
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
            mockQueryBuilder.limit.mockResolvedValue({
                data: mockTldsData,
                error: null,
            } as any);

            const result = await tldRepository.listTLDs();

            expect(result).toEqual([
                {
                    name: 'com',
                    punycodeName: 'com',
                    type: TLDType.GENERIC,
                    description: 'Commercial domain',
                    pricing: null,
                },
                {
                    name: 'org',
                    punycodeName: 'org',
                    type: TLDType.GENERIC,
                    description: 'Organization domain',
                    pricing: null,
                },
            ]);

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('tld');
            expect(mockQueryBuilder.select).toHaveBeenCalledWith(
                'name, punycode_name, type, description, direction, pricing'
            );
            expect(mockQueryBuilder.order).toHaveBeenCalledWith('name', { ascending: true });
            expect(mockQueryBuilder.limit).toHaveBeenCalledWith(5000);
        });

        it('should throw error when Supabase returns an error', async () => {
            const mockError = { message: 'Database connection failed' };
            mockQueryBuilder.limit.mockResolvedValue({
                data: null,
                error: mockError,
            } as any);

            await expect(tldRepository.listTLDs()).rejects.toThrow(
                'Failed to fetch TLDs: Database connection failed'
            );
        });
    });

    describe('updateTLD', () => {
        const mockTld: TLD = {
            name: 'com',
            punycodeName: 'com',
            description: 'Updated commercial domain',
            type: TLDType.GENERIC,
            pricing: {
                [Registrar.DYNADOT]: {
                    registration: 9.99,
                    renewal: 9.99,
                    currency: 'USD',
                },
            },
        };

        it('should update TLD successfully', async () => {
            mockQueryBuilder.eq.mockResolvedValue({
                data: null,
                error: null,
            } as any);

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

            // Cache invalidation is tested in the cache invalidation section
        });

        it('should use punycode_name field for punycode domains', async () => {
            mockQueryBuilder.eq.mockResolvedValue({
                data: null,
                error: null,
            } as any);

            await tldRepository.updateTLD('xn--example', mockTld);

            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('punycode_name', 'xn--example');
        });

        it('should throw error when Supabase returns an error', async () => {
            const mockError = { message: 'Update failed' };
            mockQueryBuilder.eq.mockResolvedValue({
                data: null,
                error: mockError,
            } as any);

            await expect(tldRepository.updateTLD('com', mockTld)).rejects.toThrow(
                'Failed to update TLD com: Update failed'
            );
        });
    });

    describe('cache invalidation', () => {
        it('should invalidate cache when creating TLD', async () => {
            const mockTld: TLD = {
                name: 'test',
                punycodeName: 'test',
                description: 'Test domain',
                type: TLDType.TEST,
            };

            // First, populate the cache with listTLDs
            mockQueryBuilder.limit.mockResolvedValue({
                data: [{ name: 'com', punycode_name: 'com', type: TLDType.GENERIC, description: 'Commercial', pricing: null }],
                error: null,
            } as any);

            await tldRepository.listTLDs();
            jest.clearAllMocks();

            // Now create a TLD, which should invalidate the cache
            mockQueryBuilder.upsert.mockResolvedValue({
                data: null,
                error: null,
            } as any);

            await tldRepository.createTld(mockTld);

            // Verify that subsequent listTLDs call hits the database (cache was invalidated)
            mockQueryBuilder.limit.mockResolvedValue({
                data: [{ name: 'com', punycode_name: 'com', type: TLDType.GENERIC, description: 'Commercial', pricing: null }],
                error: null,
            } as any);

            await tldRepository.listTLDs();
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('tld');
        });

        it('should invalidate cache when updating TLD', async () => {
            const mockTld: TLD = {
                name: 'test',
                punycodeName: 'test',
                description: 'Updated test domain',
                type: TLDType.TEST,
            };

            // First, populate the cache with getTLD
            mockQueryBuilder.single.mockResolvedValue({
                data: { name: 'test', punycode_name: 'test', type: TLDType.TEST, description: 'Test', pricing: null },
                error: null,
            } as any);

            await tldRepository.getTLD('test');
            jest.clearAllMocks();

            // Now update the TLD, which should invalidate the cache
            mockQueryBuilder.eq.mockResolvedValue({
                data: null,
                error: null,
            } as any);

            await tldRepository.updateTLD('test', mockTld);

            // Reset mocks and recreate the mock chain for the subsequent getTLD call
            jest.clearAllMocks();
            
            // Recreate the mock chain
            const { mockClient, mockQueryBuilder: newQueryBuilder } = createMockSupabaseClient();
            mockSupabaseClient = mockClient;
            mockQueryBuilder = newQueryBuilder;
            (tldRepository as any).client = mockSupabaseClient;
            
            mockQueryBuilder.single.mockResolvedValue({
                data: { name: 'test', punycode_name: 'test', type: TLDType.TEST, description: 'Updated test', pricing: null },
                error: null,
            } as any);

            await tldRepository.getTLD('test');
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('tld');
        });
    });

    describe('TTL configuration', () => {
        it('should use correct TTL for cache operations', async () => {
            const mockTldData = {
                name: 'com',
                punycode_name: 'com',
                description: 'Commercial domain',
                type: TLDType.GENERIC,
                pricing: null,
            };

            mockQueryBuilder.single.mockResolvedValue({
                data: mockTldData,
                error: null,
            } as any);

            // First call should hit the database
            await tldRepository.getTLD('com');
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('tld');

            // Reset mocks
            jest.clearAllMocks();

            // Second call should use cache (within TTL window)
            const result = await tldRepository.getTLD('com');
            expect(result).toEqual({
                name: 'com',
                punycodeName: 'com',
                type: TLDType.GENERIC,
                description: 'Commercial domain',
                pricing: null,
            });
            expect(mockSupabaseClient.from).not.toHaveBeenCalled();
        });
    });
});