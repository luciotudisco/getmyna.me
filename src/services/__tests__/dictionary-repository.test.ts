import { DictionaryEntry, PaginatedDictionaryResponse } from '@/models/dictionary';
import { DomainStatus } from '@/models/domain';
import { dictionaryRepository } from '@/services/dictionary-repository';

jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(),
}));

describe('DictionaryRepository', () => {
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
        (dictionaryRepository as any).client = mockSupabaseClient;
    });

    describe('create', () => {
        const mockDictionaryEntry: DictionaryEntry = {
            word: 'example',
            category: 'noun',
            locale: 'en',
            rank: 1,
            matchingDomains: [{ domain: 'example.com', status: DomainStatus.ACTIVE }],
        };

        it('should create a dictionary entry successfully', async () => {
            mockSupabaseClient.from = jest.fn().mockReturnValue({
                upsert: jest.fn().mockResolvedValue({
                    error: null,
                }),
            });

            await dictionaryRepository.create(mockDictionaryEntry);

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('dictionary');
            expect(mockSupabaseClient.from().upsert).toHaveBeenCalledWith(
                {
                    word: 'example',
                    category: 'noun',
                    locale: 'en',
                    rank: 1,
                    matching_domains: mockDictionaryEntry.matchingDomains,
                    created_at: expect.any(String),
                    updated_at: expect.any(String),
                },
                {
                    onConflict: 'word',
                },
            );
        });

        it('should throw error when upsert fails', async () => {
            const errorMessage = 'Database error';
            mockSupabaseClient.from = jest.fn().mockReturnValue({
                upsert: jest.fn().mockResolvedValue({
                    error: { message: errorMessage },
                }),
            });

            await expect(dictionaryRepository.create(mockDictionaryEntry)).rejects.toThrow(
                `Failed to upsert dictionary entry ${mockDictionaryEntry.word}: ${errorMessage}`,
            );
        });
    });

    describe('get', () => {
        const mockData = {
            word: 'example',
            category: 'noun',
            locale: 'en',
            rank: 1,
            matching_domains: [{ domain: 'example.com', tld: 'com', status: DomainStatus.ACTIVE }],
        };

        it('should return a dictionary entry successfully', async () => {
            mockSupabaseClient.from = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: mockData,
                            error: null,
                        }),
                    }),
                }),
            });

            const result = await dictionaryRepository.get('example');

            expect(result).toEqual({
                word: 'example',
                category: 'noun',
                locale: 'en',
                rank: 1,
                matchingDomains: mockData.matching_domains,
            });
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('dictionary');
        });

        it('should return null when entry not found (PGRST116)', async () => {
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

            const result = await dictionaryRepository.get('nonexistent');

            expect(result).toBeNull();
        });

        it('should throw error when fetch fails with non-PGRST116 error', async () => {
            const errorMessage = 'Database error';
            mockSupabaseClient.from = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: null,
                            error: { code: 'OTHER_ERROR', message: errorMessage },
                        }),
                    }),
                }),
            });

            await expect(dictionaryRepository.get('example')).rejects.toThrow(
                `Failed to fetch dictionary entry example: ${errorMessage}`,
            );
        });
    });

    describe('list', () => {
        const mockData = [
            {
                word: 'example',
                category: 'noun',
                locale: 'en',
                rank: 1,
                matching_domains: [],
            },
            {
                word: 'test',
                category: 'verb',
                locale: 'en',
                rank: 2,
                matching_domains: [],
            },
        ];

        it('should return list of dictionary entries with filters (non-paginated)', async () => {
            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                not: jest.fn().mockResolvedValue({
                    data: mockData,
                    error: null,
                }),
            };
            mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);

            const result = await dictionaryRepository.list({
                category: 'noun',
                locale: 'en',
                hasMatchingDomains: true,
                limit: 100,
            });

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('dictionary');
        });

        it('should throw error when list fails', async () => {
            const errorMessage = 'Database error';
            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                not: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: errorMessage },
                }),
            };
            mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);

            await expect(dictionaryRepository.list()).rejects.toThrow(
                `Failed to fetch dictionary entries: ${errorMessage}`,
            );
        });
    });

    describe('list with pagination', () => {
        const mockData = [
            {
                word: 'example',
                category: 'noun',
                locale: 'en',
                rank: 1,
                matching_domains: [],
            },
            {
                word: 'test',
                category: 'verb',
                locale: 'en',
                rank: 2,
                matching_domains: [],
            },
        ];

        beforeEach(() => {
            // Reset mock to include count functionality
            mockSupabaseClient = {
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockReturnThis(),
                upsert: jest.fn().mockReturnThis(),
                update: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                range: jest.fn().mockReturnThis(),
                not: jest.fn().mockReturnThis(),
            };
            (dictionaryRepository as any).client = mockSupabaseClient;
        });

        it('should return paginated dictionary entries with default pagination', async () => {
            const mockCountQuery = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                not: jest.fn().mockResolvedValue({
                    count: 100,
                    error: null,
                }),
            };

            const mockDataQuery = {
                select: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                range: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                not: jest.fn().mockResolvedValue({
                    data: mockData,
                    error: null,
                }),
            };

            mockSupabaseClient.from = jest
                .fn()
                .mockReturnValueOnce(mockCountQuery) // First call for count
                .mockReturnValueOnce(mockDataQuery); // Second call for data

            const result = (await dictionaryRepository.list({
                page: 1,
                pageSize: 5000,
            })) as PaginatedDictionaryResponse;

            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('pagination');
            expect(result.data).toHaveLength(2);
            expect(result.pagination).toEqual({
                page: 1,
                pageSize: 5000,
                totalCount: 100,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
            });
        });

        it('should return paginated dictionary entries with custom pagination', async () => {
            const mockCountQuery = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                not: jest.fn().mockResolvedValue({
                    count: 25,
                    error: null,
                }),
            };

            const mockDataQuery = {
                select: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                range: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                not: jest.fn().mockResolvedValue({
                    data: mockData,
                    error: null,
                }),
            };

            mockSupabaseClient.from = jest.fn().mockReturnValueOnce(mockCountQuery).mockReturnValueOnce(mockDataQuery);

            const result = (await dictionaryRepository.list({
                page: 2,
                pageSize: 10,
                category: 'noun',
                locale: 'en',
            })) as PaginatedDictionaryResponse;

            expect(result.pagination).toEqual({
                page: 2,
                pageSize: 10,
                totalCount: 25,
                totalPages: 3,
                hasNextPage: true,
                hasPreviousPage: true,
            });
        });

        it('should handle empty results', async () => {
            const mockCountQuery = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                not: jest.fn().mockResolvedValue({
                    count: 0,
                    error: null,
                }),
            };

            const mockDataQuery = {
                select: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                range: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                not: jest.fn().mockResolvedValue({
                    data: [],
                    error: null,
                }),
            };

            mockSupabaseClient.from = jest.fn().mockReturnValueOnce(mockCountQuery).mockReturnValueOnce(mockDataQuery);

            const result = (await dictionaryRepository.list({
                page: 1,
                pageSize: 5000,
            })) as PaginatedDictionaryResponse;

            expect(result.data).toHaveLength(0);
            expect(result.pagination).toEqual({
                page: 1,
                pageSize: 5000,
                totalCount: 0,
                totalPages: 0,
                hasNextPage: false,
                hasPreviousPage: false,
            });
        });

        it('should validate and clamp pagination parameters', async () => {
            const mockCountQuery = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                not: jest.fn().mockResolvedValue({
                    count: 100,
                    error: null,
                }),
            };

            const mockDataQuery = {
                select: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                range: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                not: jest.fn().mockResolvedValue({
                    data: mockData,
                    error: null,
                }),
            };

            mockSupabaseClient.from = jest.fn().mockReturnValueOnce(mockCountQuery).mockReturnValueOnce(mockDataQuery);

            // Test with invalid parameters (should be clamped)
            const result = (await dictionaryRepository.list({
                page: -1, // Should be clamped to 1
                pageSize: 2000, // Should be clamped to 2000 (within max limit)
            })) as PaginatedDictionaryResponse;

            expect(result.pagination.page).toBe(1);
            expect(result.pagination.pageSize).toBe(2000);
        });

        it('should throw error when count query fails', async () => {
            const errorMessage = 'Count query error';
            const mockCountQuery = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                not: jest.fn().mockResolvedValue({
                    count: null,
                    error: { message: errorMessage },
                }),
            };

            mockSupabaseClient.from = jest.fn().mockReturnValue(mockCountQuery);

            await expect(dictionaryRepository.list({ page: 1, pageSize: 5000 })).rejects.toThrow(
                `Failed to count dictionary entries: ${errorMessage}`,
            );
        });

        it('should throw error when data query fails', async () => {
            const errorMessage = 'Data query error';
            const mockCountQuery = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                not: jest.fn().mockResolvedValue({
                    count: 100,
                    error: null,
                }),
            };

            const mockDataQuery = {
                select: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                range: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                not: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: errorMessage },
                }),
            };

            mockSupabaseClient.from = jest.fn().mockReturnValueOnce(mockCountQuery).mockReturnValueOnce(mockDataQuery);

            await expect(dictionaryRepository.list({ page: 1, pageSize: 5000 })).rejects.toThrow(
                `Failed to fetch paginated dictionary entries: ${errorMessage}`,
            );
        });
    });

    describe('update', () => {
        const mockDictionaryEntry: DictionaryEntry = {
            word: 'example',
            category: 'noun',
            locale: 'en',
            rank: 1,
            matchingDomains: [{ domain: 'example.com', status: DomainStatus.ACTIVE }],
        };

        it('should update a dictionary entry successfully', async () => {
            mockSupabaseClient.from = jest.fn().mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        error: null,
                    }),
                }),
            });

            await dictionaryRepository.update('example', mockDictionaryEntry);

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('dictionary');
            expect(mockSupabaseClient.from().update).toHaveBeenCalledWith({
                word: 'example',
                category: 'noun',
                locale: 'en',
                rank: 1,
                matching_domains: mockDictionaryEntry.matchingDomains,
                updated_at: expect.any(String),
            });
            expect(mockSupabaseClient.from().update().eq).toHaveBeenCalledWith('word', 'example');
        });

        it('should throw error when update fails', async () => {
            const errorMessage = 'Database error';
            mockSupabaseClient.from = jest.fn().mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        error: { message: errorMessage },
                    }),
                }),
            });

            await expect(dictionaryRepository.update('example', mockDictionaryEntry)).rejects.toThrow(
                `Failed to update dictionary entry example: ${errorMessage}`,
            );
        });
    });
});
