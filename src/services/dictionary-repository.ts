import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { PaginationMetadata } from '@/models/common';
import { DictionaryEntry, PaginatedDictionaryResponse } from '@/models/dictionary';
import logger from '@/utils/logger';

/**
 * A repository for interacting with dictionary data in the Supabase database.
 *
 * This repository provides methods for creating, updating, and fetching dictionary entries from the database.
 */
class DictionaryRepository {
    private readonly POSTGREST_NO_ROWS_ERROR = 'PGRST116';
    private client: SupabaseClient;

    constructor() {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        this.client = createClient(supabaseUrl, supabaseServiceKey);
    }

    /**
     * Creates a new dictionary entry in the database.
     *
     * @param dictionaryEntry - The dictionary entry to create.
     */
    async create(dictionaryEntry: DictionaryEntry): Promise<void> {
        const now = new Date().toISOString();
        const { error } = await this.client.from('dictionary').upsert(
            {
                word: dictionaryEntry.word.toLowerCase(),
                category: dictionaryEntry.category,
                locale: dictionaryEntry.locale,
                rank: dictionaryEntry.rank,
                matching_domains: dictionaryEntry.matchingDomains,
                created_at: now,
                updated_at: now,
            },
            {
                onConflict: 'word',
            },
        );
        if (error) {
            logger.error({ error }, `Error upserting dictionary entry ${dictionaryEntry.word}`);
            throw new Error(`Failed to upsert dictionary entry ${dictionaryEntry.word}: ${error.message}`);
        }
    }

    /**
     * Fetches a dictionary entry from the database.
     *
     * @param word - The word to fetch.
     * @returns The dictionary entry.
     */
    async get(word: string): Promise<DictionaryEntry | null> {
        word = word.toLowerCase();
        const { data, error } = await this.client
            .from('dictionary')
            .select('word, category, locale, rank, matching_domains')
            .eq('word', word)
            .single();

        if (error) {
            if (error.code === this.POSTGREST_NO_ROWS_ERROR) {
                return null;
            }
            logger.error({ error }, `Error fetching dictionary entry ${word}`);
            throw new Error(`Failed to fetch dictionary entry ${word}: ${error.message}`);
        }

        return {
            word: data.word,
            category: data.category,
            locale: data.locale,
            rank: data.rank,
            matchingDomains: data.matching_domains,
        };
    }

    /**
     * Lists dictionary entries from the database.
     *
     * @param options - Filter and pagination options
     * @returns A list of dictionary entries.
     */
    async list(
        options: {
            category?: string;
            locale?: string;
            hasMatchingDomains?: boolean;
            limit?: number;
        } = {},
    ): Promise<DictionaryEntry[]> {
        const { category, locale, hasMatchingDomains = true, limit = 1000 } = options;
        let query = this.client
            .from('dictionary')
            .select('word, category, locale, rank, matching_domains')
            .order('rank', { ascending: true, nullsFirst: false })
            .limit(limit);

        if (category) {
            query = query.eq('category', category);
        }

        if (locale) {
            query = query.eq('locale', locale);
        }

        if (hasMatchingDomains) {
            query = query.not('matching_domains', 'is', null);
        }

        const { data, error } = await query;
        if (error) {
            logger.error({ error }, 'Error fetching dictionary entries');
            throw new Error(`Failed to fetch dictionary entries: ${error.message}`);
        }

        return data.map((entry) => ({
            word: entry.word,
            category: entry.category,
            locale: entry.locale,
            rank: entry.rank,
            matchingDomains: entry.matching_domains,
        }));
    }

    /**
     * Lists dictionary entries from the database with pagination support.
     *
     * @param options - Filter and pagination options
     * @returns A paginated response with dictionary entries and pagination metadata.
     */
    async listPaginated(
        options: {
            category?: string;
            locale?: string;
            hasMatchingDomains?: boolean;
            page?: number;
            pageSize?: number;
        } = {},
    ): Promise<PaginatedDictionaryResponse> {
        const { category, locale, hasMatchingDomains = true, page = 1, pageSize = 50 } = options;

        // Validate pagination parameters
        const validPage = Math.max(1, page);
        const validPageSize = Math.min(Math.max(1, pageSize), 1000); // Max 1000 items per page
        const offset = (validPage - 1) * validPageSize;

        // Build the base query for counting total records
        let countQuery = this.client.from('dictionary').select('*', { count: 'exact', head: true });

        if (category) {
            countQuery = countQuery.eq('category', category);
        }

        if (locale) {
            countQuery = countQuery.eq('locale', locale);
        }

        if (hasMatchingDomains) {
            countQuery = countQuery.not('matching_domains', 'is', null);
        }

        // Get total count
        const { count, error: countError } = await countQuery;
        if (countError) {
            logger.error({ error: countError }, 'Error counting dictionary entries');
            throw new Error(`Failed to count dictionary entries: ${countError.message}`);
        }

        const totalCount = count || 0;
        const totalPages = Math.ceil(totalCount / validPageSize);

        // Build the data query
        let dataQuery = this.client
            .from('dictionary')
            .select('word, category, locale, rank, matching_domains')
            .order('rank', { ascending: true, nullsFirst: false })
            .range(offset, offset + validPageSize - 1);

        if (category) {
            dataQuery = dataQuery.eq('category', category);
        }

        if (locale) {
            dataQuery = dataQuery.eq('locale', locale);
        }

        if (hasMatchingDomains) {
            dataQuery = dataQuery.not('matching_domains', 'is', null);
        }

        const { data, error } = await dataQuery;
        if (error) {
            logger.error({ error }, 'Error fetching paginated dictionary entries');
            throw new Error(`Failed to fetch paginated dictionary entries: ${error.message}`);
        }

        const entries = data.map((entry) => ({
            word: entry.word,
            category: entry.category,
            locale: entry.locale,
            rank: entry.rank,
            matchingDomains: entry.matching_domains,
        }));

        const pagination: PaginationMetadata = {
            page: validPage,
            pageSize: validPageSize,
            totalCount,
            totalPages,
            hasNextPage: validPage < totalPages,
            hasPreviousPage: validPage > 1,
        };

        return {
            data: entries,
            pagination,
        };
    }

    /**
     * Updates a dictionary entry in the database.
     *
     * @param word - The word to update.
     * @param dictionaryEntry - The dictionary entry information to update.
     */
    async update(word: string, dictionaryEntry: DictionaryEntry): Promise<void> {
        word = word.toLowerCase();
        const { error } = await this.client
            .from('dictionary')
            .update({
                word: dictionaryEntry.word.toLowerCase(),
                category: dictionaryEntry.category,
                locale: dictionaryEntry.locale,
                rank: dictionaryEntry.rank,
                matching_domains: dictionaryEntry.matchingDomains,
                updated_at: new Date().toISOString(),
            })
            .eq('word', word);

        if (error) {
            logger.error({ error }, `Error updating dictionary entry ${word}`);
            throw new Error(`Failed to update dictionary entry ${word}: ${error.message}`);
        }
    }
}

export const dictionaryRepository = new DictionaryRepository();
export type { DictionaryRepository };
