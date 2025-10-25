import { DictionaryEntry } from '@/models/dictionary';
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
            matchingDomains: [{ domain: 'example.com', tld: 'com', status: DomainStatus.ACTIVE }],
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

        it('should return list of dictionary entries without filters', async () => {
            mockSupabaseClient.from = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    order: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue({
                            data: mockData,
                            error: null,
                        }),
                    }),
                }),
            });

            const result = await dictionaryRepository.list();

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                word: 'example',
                category: 'noun',
                locale: 'en',
                rank: 1,
                matchingDomains: [],
            });
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('dictionary');
        });

        it('should throw error when list fails', async () => {
            const errorMessage = 'Database error';
            mockSupabaseClient.from = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    order: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: errorMessage },
                        }),
                    }),
                }),
            });

            await expect(dictionaryRepository.list()).rejects.toThrow(
                `Failed to fetch dictionary entries: ${errorMessage}`,
            );
        });
    });

    describe('update', () => {
        const mockDictionaryEntry: DictionaryEntry = {
            word: 'example',
            category: 'noun',
            locale: 'en',
            rank: 1,
            matchingDomains: [{ domain: 'example.com', tld: 'com', status: DomainStatus.ACTIVE }],
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
