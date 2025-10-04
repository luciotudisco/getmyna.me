import { createClient } from '@supabase/supabase-js';

import { TLD, TLDType, Registrar } from '@/models/tld';
import { TTLCache } from '@/utils/cache';
import logger from '@/utils/logger';

// Mock Supabase client
jest.mock('@supabase/supabase-js');
jest.mock('@/utils/logger', () => ({
    __esModule: true,
    default: {
        error: jest.fn(),
    },
}));

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockLogger = logger as any;

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
    let mockCache: jest.Mocked<TTLCache<unknown>>;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Create mock Supabase client
        const { mockClient, mockQueryBuilder: queryBuilder } = createMockSupabaseClient();
        mockSupabaseClient = mockClient;
        mockQueryBuilder = queryBuilder;

        mockCreateClient.mockReturnValue(mockSupabaseClient);

        // Create mock cache
        mockCache = {
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn(),
            clear: jest.fn(),
            has: jest.fn(),
        } as any;

        // Create repository instance using the exported instance
        const { tldRepository: exportedRepository } = require('../tld-repository');
        tldRepository = exportedRepository;

        // Replace the Supabase client and cache with our mocks
        (tldRepository as any).client = mockSupabaseClient;
        (tldRepository as any).cache = mockCache;
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

            expect(mockLogger.error).toHaveBeenCalledWith(
                { error: mockError },
                'Error counting TLDs'
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

            // Should invalidate cache
            expect(mockCache.delete).toHaveBeenCalledWith('tlds');
            expect(mockCache.delete).toHaveBeenCalledWith(`tld:${mockTld.name}`);
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

            expect(mockLogger.error).toHaveBeenCalledWith(
                { error: mockError },
                'Error upserting TLD com'
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
            const cachedTld: TLD = {
                name: 'com',
                punycodeName: 'com',
                description: 'Commercial domain',
                type: TLDType.GENERIC,
            };

            mockCache.get.mockReturnValue(cachedTld);

            const result = await tldRepository.getTLD('com');

            expect(result).toEqual(cachedTld);
            expect(mockCache.get).toHaveBeenCalledWith('tld:com');
            expect(mockSupabaseClient.from).not.toHaveBeenCalled();
        });

        it('should fetch TLD from database when not in cache', async () => {
            mockCache.get.mockReturnValue(undefined);
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

            // Should cache the result
            expect(mockCache.set).toHaveBeenCalledWith(
                'tld:com',
                expect.objectContaining({
                    name: 'com',
                    punycodeName: 'com',
                }),
                60000
            );
        });

        it('should use punycode_name field for punycode domains', async () => {
            mockCache.get.mockReturnValue(undefined);
            mockQueryBuilder.single.mockResolvedValue({
                data: mockTldData,
                error: null,
            } as any);

            await tldRepository.getTLD('xn--example');

            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('punycode_name', 'xn--example');
        });

        it('should return null when TLD not found', async () => {
            mockCache.get.mockReturnValue(undefined);
            mockQueryBuilder.single.mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' },
            } as any);

            const result = await tldRepository.getTLD('nonexistent');

            expect(result).toBeNull();
            expect(mockCache.set).toHaveBeenCalledWith('tld:nonexistent', null, 60000);
        });

        it('should throw error when Supabase returns an error', async () => {
            mockCache.get.mockReturnValue(undefined);
            const mockError = { message: 'Database connection failed' };
            mockQueryBuilder.single.mockResolvedValue({
                data: null,
                error: mockError,
            } as any);

            await expect(tldRepository.getTLD('com')).rejects.toThrow(
                'Failed to fetch TLD com: Database connection failed'
            );

            expect(mockLogger.error).toHaveBeenCalledWith(
                { error: mockError },
                'Error fetching TLD com'
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
            const cachedTlds: TLD[] = [
                {
                    name: 'com',
                    punycodeName: 'com',
                    type: TLDType.GENERIC,
                    description: 'Commercial domain',
                },
            ];

            mockCache.get.mockReturnValue(cachedTlds);

            const result = await tldRepository.listTLDs();

            expect(result).toEqual(cachedTlds);
            expect(mockCache.get).toHaveBeenCalledWith('tlds');
            expect(mockSupabaseClient.from).not.toHaveBeenCalled();
        });

        it('should fetch TLDs from database when not in cache', async () => {
            mockCache.get.mockReturnValue(undefined);
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

            // Should cache the result
            expect(mockCache.set).toHaveBeenCalledWith('tlds', expect.any(Array), 60000);
        });

        it('should throw error when Supabase returns an error', async () => {
            mockCache.get.mockReturnValue(undefined);
            const mockError = { message: 'Database connection failed' };
            mockQueryBuilder.limit.mockResolvedValue({
                data: null,
                error: mockError,
            } as any);

            await expect(tldRepository.listTLDs()).rejects.toThrow(
                'Failed to fetch TLDs: Database connection failed'
            );

            expect(mockLogger.error).toHaveBeenCalledWith(
                { error: mockError },
                'Error fetching TLDs'
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

            // Should invalidate cache
            expect(mockCache.delete).toHaveBeenCalledWith('tlds');
            expect(mockCache.delete).toHaveBeenCalledWith('tld:com');
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

            expect(mockLogger.error).toHaveBeenCalledWith(
                { error: mockError },
                'Error updating TLD com'
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

            mockQueryBuilder.upsert.mockResolvedValue({
                data: null,
                error: null,
            } as any);

            await tldRepository.createTld(mockTld);

            expect(mockCache.delete).toHaveBeenCalledWith('tlds');
            expect(mockCache.delete).toHaveBeenCalledWith('tld:test');
        });

        it('should invalidate cache when updating TLD', async () => {
            const mockTld: TLD = {
                name: 'test',
                punycodeName: 'test',
                description: 'Updated test domain',
                type: TLDType.TEST,
            };

            mockQueryBuilder.eq.mockResolvedValue({
                data: null,
                error: null,
            } as any);

            await tldRepository.updateTLD('test', mockTld);

            expect(mockCache.delete).toHaveBeenCalledWith('tlds');
            expect(mockCache.delete).toHaveBeenCalledWith('tld:test');
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

            mockCache.get.mockReturnValue(undefined);
            mockQueryBuilder.single.mockResolvedValue({
                data: mockTldData,
                error: null,
            } as any);

            await tldRepository.getTLD('com');

            expect(mockCache.set).toHaveBeenCalledWith(
                'tld:com',
                expect.any(Object),
                60000 // 60 seconds
            );
        });
    });
});