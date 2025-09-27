import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { TLD, TLDType } from '@/models/tld';
import { TLDRepository } from '@/services/tld-repository';
import logger from '@/utils/logger';

// Mock dependencies
jest.mock('@supabase/supabase-js');
jest.mock('@/utils/logger');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('TLDRepository', () => {
    let repository: any;
    let mockSupabaseClient: any;
    let mockQueryBuilder: any;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Create mock query builder
        mockQueryBuilder = {
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            upsert: jest.fn().mockReturnThis(),
        };

        // Create mock Supabase client
        mockSupabaseClient = {
            from: jest.fn().mockReturnValue(mockQueryBuilder),
        } as any;

        // Mock createClient to return our mock client
        mockCreateClient.mockReturnValue(mockSupabaseClient);

        // Create repository instance
        repository = new TLDRepository();
    });

    afterEach(() => {
        // Clean up environment variables
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
        delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    });

    describe('constructor', () => {
        it('should create Supabase client with correct configuration', () => {
            const supabaseUrl = 'https://test.supabase.co';
            const supabaseKey = 'test-service-key';

            process.env.NEXT_PUBLIC_SUPABASE_URL = supabaseUrl;
            process.env.SUPABASE_SERVICE_ROLE_KEY = supabaseKey;

            new TLDRepository();

            expect(mockCreateClient).toHaveBeenCalledWith(supabaseUrl, supabaseKey);
        });
    });

    describe('countTLDs', () => {
        beforeEach(() => {
            process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
            process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
        });

        it('should return count of TLDs successfully', async () => {
            const mockTLDs = [
                { name: 'com', punycode_name: 'com', type: TLDType.GENERIC },
                { name: 'org', punycode_name: 'org', type: TLDType.GENERIC },
                { name: 'net', punycode_name: 'net', type: TLDType.GENERIC },
            ];

            const mockResponse = {
                data: mockTLDs,
                error: null,
                count: 3,
            };

            mockQueryBuilder.select.mockResolvedValue(mockResponse);

            const result = await repository.countTLDs();

            expect(result).toBe(3);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('tld');
            expect(mockQueryBuilder.select).toHaveBeenCalledWith('*', { count: 'exact' });
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should return zero when no TLDs exist', async () => {
            const mockResponse = {
                data: [],
                error: null,
                count: 0,
            };

            mockQueryBuilder.select.mockResolvedValue(mockResponse);

            const result = await repository.countTLDs();

            expect(result).toBe(0);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('tld');
            expect(mockQueryBuilder.select).toHaveBeenCalledWith('*', { count: 'exact' });
        });

        it('should handle database error and throw', async () => {
            const mockError = {
                message: 'Connection timeout',
                code: 'CONNECTION_TIMEOUT',
            };

            const mockResponse = {
                data: null,
                error: mockError,
                count: null,
            };

            mockQueryBuilder.select.mockResolvedValue(mockResponse);

            await expect(repository.countTLDs()).rejects.toThrow('Failed to count TLDs: Connection timeout');

            expect(mockLogger.error).toHaveBeenCalledWith(
                { error: mockError },
                'Error counting TLDs'
            );
        });

        it('should handle network error', async () => {
            const networkError = new Error('Network error');
            mockQueryBuilder.select.mockRejectedValue(networkError);

            await expect(repository.countTLDs()).rejects.toThrow();

            expect(mockLogger.error).toHaveBeenCalledWith(
                { error: networkError },
                'Error counting TLDs'
            );
        });

        it('should handle large datasets', async () => {
            const mockTLDs = Array.from({ length: 5000 }, (_, i) => ({
                name: `tld${i}`,
                punycode_name: `tld${i}`,
                type: TLDType.GENERIC,
            }));

            const mockResponse = {
                data: mockTLDs,
                error: null,
                count: 5000,
            };

            mockQueryBuilder.select.mockResolvedValue(mockResponse);

            const result = await repository.countTLDs();

            expect(result).toBe(5000);
        });

        it('should handle malformed response data', async () => {
            const mockResponse = {
                data: null,
                error: null,
                count: null,
            };

            mockQueryBuilder.select.mockResolvedValue(mockResponse);

            const result = await repository.countTLDs();

            expect(result).toBe(0);
        });

        it('should handle partial data in response', async () => {
            const mockTLDs = [
                { name: 'com', punycode_name: 'com', type: TLDType.GENERIC },
                // Missing some fields
                { name: 'org', type: TLDType.GENERIC },
            ];

            const mockResponse = {
                data: mockTLDs,
                error: null,
                count: 2,
            };

            mockQueryBuilder.select.mockResolvedValue(mockResponse);

            const result = await repository.countTLDs();

            expect(result).toBe(2);
        });
    });

    describe('createTld', () => {
        beforeEach(() => {
            process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
            process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
        });

        it('should create TLD successfully', async () => {
            const tldInfo: TLD = {
                name: 'test',
                punycodeName: 'test',
                description: 'Test TLD',
                type: TLDType.GENERIC,
            };

            const mockResponse = {
                data: null,
                error: null,
            };

            mockQueryBuilder.upsert.mockResolvedValue(mockResponse);

            await repository.createTld(tldInfo);

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('tld');
            expect(mockQueryBuilder.upsert).toHaveBeenCalledWith(
                {
                    name: tldInfo.name,
                    punycode_name: tldInfo.punycodeName,
                    description: tldInfo.description,
                    type: tldInfo.type,
                    created_at: expect.any(String),
                    updated_at: expect.any(String),
                },
                {
                    onConflict: 'name,punycode_name',
                }
            );
        });

        it('should handle creation error', async () => {
            const tldInfo: TLD = {
                name: 'test',
                punycodeName: 'test',
                description: 'Test TLD',
                type: TLDType.GENERIC,
            };

            const mockError = {
                message: 'Duplicate key violation',
                code: 'DUPLICATE_KEY',
            };

            const mockResponse = {
                data: null,
                error: mockError,
            };

            mockQueryBuilder.upsert.mockResolvedValue(mockResponse);

            await expect(repository.createTld(tldInfo)).rejects.toThrow('Failed to upsert TLD test: Duplicate key violation');

            expect(mockLogger.error).toHaveBeenCalledWith(
                { error: mockError },
                'Error upserting TLD test'
            );
        });
    });

    describe('getTLD', () => {
        beforeEach(() => {
            process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
            process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
        });

        it('should fetch TLD by name successfully', async () => {
            const mockTLDData = {
                name: 'com',
                punycode_name: 'com',
                description: 'Commercial',
                type: TLDType.GENERIC,
                direction: 'ltr',
                pricing: { registration: 10.99 },
            };

            const mockResponse = {
                data: mockTLDData,
                error: null,
            };

            mockQueryBuilder.single.mockResolvedValue(mockResponse);

            const result = await repository.getTLD('com');

            expect(result).toEqual({
                name: 'com',
                punycodeName: 'com',
                type: TLDType.GENERIC,
                description: 'Commercial',
                pricing: { registration: 10.99 },
            });

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('tld');
            expect(mockQueryBuilder.select).toHaveBeenCalledWith('name, punycode_name, description, direction, type, pricing');
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('name', 'com');
            expect(mockQueryBuilder.single).toHaveBeenCalled();
        });

        it('should fetch TLD by punycode name', async () => {
            const mockTLDData = {
                name: 'москва',
                punycode_name: 'xn--80adxhks',
                description: 'Moscow',
                type: TLDType.COUNTRY_CODE,
                direction: 'ltr',
                pricing: null,
            };

            const mockResponse = {
                data: mockTLDData,
                error: null,
            };

            mockQueryBuilder.single.mockResolvedValue(mockResponse);

            const result = await repository.getTLD('xn--80adxhks');

            expect(result).toEqual({
                name: 'москва',
                punycodeName: 'xn--80adxhks',
                type: TLDType.COUNTRY_CODE,
                description: 'Moscow',
                pricing: null,
            });

            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('punycode_name', 'xn--80adxhks');
        });

        it('should return null when TLD not found', async () => {
            const mockResponse = {
                data: null,
                error: { code: 'PGRST116', message: 'No rows returned' },
            };

            mockQueryBuilder.single.mockResolvedValue(mockResponse);

            const result = await repository.getTLD('nonexistent');

            expect(result).toBeNull();
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should handle fetch error', async () => {
            const mockError = {
                message: 'Query failed',
                code: 'QUERY_ERROR',
            };

            const mockResponse = {
                data: null,
                error: mockError,
            };

            mockQueryBuilder.single.mockResolvedValue(mockResponse);

            await expect(repository.getTLD('com')).rejects.toThrow('Failed to fetch TLD com: Query failed');

            expect(mockLogger.error).toHaveBeenCalledWith(
                { error: mockError },
                'Error fetching TLD com'
            );
        });
    });

    describe('listTLDs', () => {
        beforeEach(() => {
            process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
            process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
        });

        it('should list all TLDs successfully', async () => {
            const mockTLDs = [
                {
                    name: 'com',
                    punycode_name: 'com',
                    type: TLDType.GENERIC,
                    description: 'Commercial',
                    direction: 'ltr',
                    pricing: null,
                },
                {
                    name: 'org',
                    punycode_name: 'org',
                    type: TLDType.GENERIC,
                    description: 'Organizations',
                    direction: 'ltr',
                    pricing: null,
                },
            ];

            const mockResponse = {
                data: mockTLDs,
                error: null,
            };

            mockQueryBuilder.limit.mockResolvedValue(mockResponse);

            const result = await repository.listTLDs();

            expect(result).toEqual([
                {
                    name: 'com',
                    punycodeName: 'com',
                    type: TLDType.GENERIC,
                    description: 'Commercial',
                    pricing: null,
                },
                {
                    name: 'org',
                    punycodeName: 'org',
                    type: TLDType.GENERIC,
                    description: 'Organizations',
                    pricing: null,
                },
            ]);

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('tld');
            expect(mockQueryBuilder.select).toHaveBeenCalledWith('name, punycode_name, type, description, direction, pricing');
            expect(mockQueryBuilder.order).toHaveBeenCalledWith('name', { ascending: true });
            expect(mockQueryBuilder.limit).toHaveBeenCalledWith(5000);
        });

        it('should handle list error', async () => {
            const mockError = {
                message: 'Query timeout',
                code: 'QUERY_TIMEOUT',
            };

            const mockResponse = {
                data: null,
                error: mockError,
            };

            mockQueryBuilder.limit.mockResolvedValue(mockResponse);

            await expect(repository.listTLDs()).rejects.toThrow('Failed to fetch TLDs: Query timeout');

            expect(mockLogger.error).toHaveBeenCalledWith(
                { error: mockError },
                'Error fetching TLDs'
            );
        });
    });

    describe('updateTLD', () => {
        beforeEach(() => {
            process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
            process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
        });

        it('should update TLD by name successfully', async () => {
            const tldInfo: TLD = {
                name: 'com',
                punycodeName: 'com',
                description: 'Updated Commercial',
                type: TLDType.GENERIC,
                pricing: { DYNADOT: { registration: 15.99, renewal: 15.99, currency: 'USD' } },
            };

            const mockResponse = {
                data: null,
                error: null,
            };

            mockQueryBuilder.eq.mockResolvedValue(mockResponse);

            await repository.updateTLD('com', tldInfo);

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('tld');
            expect(mockQueryBuilder.update).toHaveBeenCalledWith({
                name: tldInfo.name,
                punycodeName: tldInfo.punycodeName,
                description: tldInfo.description,
                direction: tldInfo.direction,
                pricing: tldInfo.pricing,
                type: tldInfo.type,
                updated_at: expect.any(String),
            });
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('name', 'com');
        });

        it('should update TLD by punycode name', async () => {
            const tldInfo: TLD = {
                name: 'москва',
                punycodeName: 'xn--80adxhks',
                description: 'Updated Moscow',
                type: TLDType.COUNTRY_CODE,
            };

            const mockResponse = {
                data: null,
                error: null,
            };

            mockQueryBuilder.eq.mockResolvedValue(mockResponse);

            await repository.updateTLD('xn--80adxhks', tldInfo);

            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('punycode_name', 'xn--80adxhks');
        });

        it('should handle update error', async () => {
            const tldInfo: TLD = {
                name: 'com',
                punycodeName: 'com',
                description: 'Updated Commercial',
                type: TLDType.GENERIC,
            };

            const mockError = {
                message: 'Update failed',
                code: 'UPDATE_ERROR',
            };

            const mockResponse = {
                data: null,
                error: mockError,
            };

            mockQueryBuilder.eq.mockResolvedValue(mockResponse);

            await expect(repository.updateTLD('com', tldInfo)).rejects.toThrow('Failed to update TLD com: Update failed');

            expect(mockLogger.error).toHaveBeenCalledWith(
                { error: mockError },
                'Error updating TLD com'
            );
        });
    });
});