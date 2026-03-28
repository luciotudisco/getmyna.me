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
    private readonly TLD_SELECT =
        'country_code,description,name,organization,pricing,punycode_name,tagline,type,year_established' as const;

    private client: SupabaseClient;
    private cache = new TTLCache<TLD | TLD[] | null>();

    constructor() {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        this.client = createClient(supabaseUrl, supabaseServiceKey);
    }

    /**
     * Returns the number of TLDs in the database.
     *
     * @returns The number of TLDs.
     */
    async count(): Promise<number> {
        const { count, error } = await this.client.from('tld').select('*', { count: 'exact', head: true });
        if (error) {
            logger.error({ error }, 'Error counting TLDs');
            throw new Error(`Failed to count TLDs: ${error.message}`);
        }
        return count ?? 0;
    }

    /**
     * Creates a new TLD in the database.
     *
     * @param tldInfo - The TLD information to create.
     */
    async create(tld: TLD): Promise<void> {
        const now = new Date().toISOString();
        const { error } = await this.client.from('tld').upsert(
            {
                country_code: tld.countryCode,
                created_at: now,
                description: tld.description,
                name: tld.name?.toLowerCase(),
                organization: tld.organization,
                pricing: tld.pricing,
                punycode_name: tld.punycodeName?.toLowerCase(),
                tagline: tld.tagline,
                type: tld.type,
                updated_at: now,
                year_established: tld.yearEstablished,
            },
            {
                onConflict: 'name,punycode_name',
            },
        );
        if (error) {
            logger.error({ error }, `Error upserting TLD ${tld.name}`);
            throw new Error(`Failed to upsert TLD ${tld.name}: ${error.message}`);
        }

        this.cache.delete('tlds');
        this.cache.delete(`tld:${tld.name}`);
    }

    /**
     * Fetches a TLD from the database.
     *
     * @param name - The name of the TLD to fetch.
     * @returns The TLD information.
     */
    async get(name: string): Promise<TLD | null> {
        name = name.toLowerCase();
        const cacheKey = `tld:${name}`;
        const cached = this.cache.get(cacheKey);
        if (cached !== undefined) {
            return cached as TLD | null;
        }

        const searchField = name.startsWith('xn--') ? 'punycode_name' : 'name';
        const { data, error } = await this.client.from('tld').select(this.TLD_SELECT).eq(searchField, name).single();

        if (error) {
            if (error.code === this.POSTGREST_NO_ROWS_ERROR) {
                this.cache.set(cacheKey, null, this.TTL_MILLISECONDS);
                return null;
            }
            logger.error({ error }, `Error fetching TLD ${name}`);
            throw new Error(`Failed to fetch TLD ${name}: ${error.message}`);
        }
        const tld = this.mapRow(data);
        this.cache.set(cacheKey, tld, this.TTL_MILLISECONDS);
        return tld;
    }

    /**
     * Lists all TLDs from the database.
     *
     * @returns A list of TLDs.
     */
    async list(): Promise<TLD[]> {
        const cacheKey = 'tlds';
        const cached = this.cache.get(cacheKey);
        if (cached) {
            return cached as TLD[];
        }

        const { data, error } = await this.client
            .from('tld')
            .select(this.TLD_SELECT)
            .order('name', { ascending: true })
            .limit(5000);
        if (error) {
            logger.error({ error }, 'Error fetching TLDs');
            throw new Error(`Failed to fetch TLDs: ${error.message}`);
        }
        const tlds: TLD[] = data.map((row) => this.mapRow(row));
        this.cache.set(cacheKey, tlds, this.TTL_MILLISECONDS);
        return tlds;
    }

    /**
     * Updates a TLD in the database.
     *
     * @param name - The name of the TLD to update.
     * @param tldInfo - The TLD information to update.
     */
    async update(name: string, tld: TLD): Promise<void> {
        name = name.toLowerCase();
        const searchField = name.startsWith('xn--') ? 'punycode_name' : 'name';
        const { error } = await this.client
            .from('tld')
            .update({
                country_code: tld.countryCode,
                description: tld.description,
                name: tld.name,
                organization: tld.organization,
                pricing: tld.pricing,
                punycode_name: tld.punycodeName,
                tagline: tld.tagline,
                type: tld.type,
                updated_at: new Date().toISOString(),
                year_established: tld.yearEstablished,
            })
            .eq(searchField, name);

        if (error) {
            logger.error({ error }, `Error updating TLD ${name}`);
            throw new Error(`Failed to update TLD ${name}: ${error.message}`);
        }

        this.cache.delete('tlds');
        this.cache.delete(`tld:${name}`);
    }

    private mapRow(row: Record<string, unknown>): TLD {
        return {
            countryCode: row.country_code,
            description: row.description,
            name: row.name,
            organization: row.organization,
            pricing: row.pricing,
            punycodeName: row.punycode_name,
            tagline: row.tagline,
            type: row.type,
            yearEstablished: row.year_established,
        } as TLD;
    }
}

export const tldRepository = new TLDRepository();
export type { TLDRepository };
