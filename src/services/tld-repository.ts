import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { TLD } from '@/models/tld';
import { TTLCache } from '@/utils/cache';
import logger from '@/utils/logger';

/**
 * A repository for interacting with TLD data in the Supabase database.
 *
 * This repository provides methods for creating, updating, and fetching TLDs from the database.
 */
class TLDRepository {
    private readonly TTL_MILLISECONDS = 60_000;
    private readonly POSTGREST_NO_ROWS_ERROR = 'PGRST116';
    private client: SupabaseClient;
    private cache = new TTLCache<unknown>();

    constructor() {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl) {
            throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is not set');
        }
        if (!supabaseServiceKey) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
        }

        this.client = createClient(supabaseUrl, supabaseServiceKey);
    }

    /**
     * Creates a new TLD in the database.
     *
     * @param tldInfo - The TLD information to create.
     */
    async createTld(tldInfo: TLD): Promise<void> {
        const now = new Date().toISOString();
        const { error } = await this.client.from('tld').upsert(
            {
                name: tldInfo.name,
                punycode_name: tldInfo.punycodeName,
                description: tldInfo.description,
                type: tldInfo.type,
                created_at: now,
                updated_at: now,
            },
            {
                onConflict: 'name,punycode_name',
            },
        );
        if (error) {
            logger.error({ error }, `Error upserting TLD ${tldInfo.name}`);
            throw new Error(`Failed to upsert TLD ${tldInfo.name}: ${error.message}`);
        }

        this.cache.delete('tlds');
        this.cache.delete(`tld:${tldInfo.name}`);
    }

    /**
     * Fetches a TLD from the database.
     *
     * @param name - The name of the TLD to fetch.
     * @returns The TLD information.
     */
    async getTLD(name: string): Promise<TLD | null> {
        const cacheKey = `tld:${name}`;
        const cached = this.cache.get(cacheKey);
        if (cached !== undefined) {
            return cached as TLD | null;
        }

        const searchField = name.startsWith('xn--') ? 'punycode_name' : 'name';
        const { data, error } = await this.client
            .from('tld')
            .select('name, punycode_name, description, direction, type, pricing')
            .eq(searchField, name)
            .single();

        if (error) {
            if (error.code === this.POSTGREST_NO_ROWS_ERROR) {
                // No rows returned
                this.cache.set(cacheKey, null, this.TTL_MILLISECONDS);
                return null;
            }
            logger.error({ error }, `Error fetching TLD ${name}`);
            throw new Error(`Failed to fetch TLD ${name}: ${error.message}`);
        }
        const tld = {
            name: data.name,
            punycodeName: data.punycode_name,
            type: data.type,
            description: data.description,
            pricing: data.pricing,
        } as TLD;
        this.cache.set(cacheKey, tld, this.TTL_MILLISECONDS);
        return tld;
    }

    /**
     * Lists all TLDs from the database.
     *
     * @returns A list of TLDs.
     */
    async listTLDs(): Promise<TLD[]> {
        const cacheKey = 'tlds';
        const cached = this.cache.get(cacheKey);
        if (cached) {
            return cached as TLD[];
        }

        const { data, error } = await this.client
            .from('tld')
            .select('name, punycode_name, type, description, direction, pricing')
            .order('name', { ascending: true })
            .limit(5000);
        if (error) {
            logger.error({ error }, 'Error fetching TLDs');
            throw new Error(`Failed to fetch TLDs: ${error.message}`);
        }
        const tlds: TLD[] = data.map((tld) => ({
            name: tld.name,
            punycodeName: tld.punycode_name,
            type: tld.type,
            description: tld.description,
            pricing: tld.pricing,
        }));
        this.cache.set(cacheKey, tlds, this.TTL_MILLISECONDS);
        return tlds;
    }

    /**
     * Updates a TLD in the database.
     *
     * @param name - The name of the TLD to update.
     * @param tldInfo - The TLD information to update.
     */
    async updateTLD(name: string, tldInfo: TLD): Promise<void> {
        const searchField = name.startsWith('xn--') ? 'punycode_name' : 'name';
        const { error } = await this.client
            .from('tld')
            .update({
                name: tldInfo.name,
                punycodeName: tldInfo.punycodeName,
                description: tldInfo.description,
                direction: tldInfo.direction,
                pricing: tldInfo.pricing,
                type: tldInfo.type,
                updated_at: new Date().toISOString(),
            })
            .eq(searchField, name);

        if (error) {
            logger.error({ error }, `Error updating TLD ${name}`);
            throw new Error(`Failed to update TLD ${name}: ${error.message}`);
        }

        this.cache.delete('tlds');
        this.cache.delete(`tld:${name}`);
    }
}

export const tldRepository = new TLDRepository();
export type { TLDRepository };
