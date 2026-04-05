import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { revalidateTag, unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache';

import { TLD } from '@/models/tld';
import logger from '@/utils/logger';

const POSTGREST_NO_ROWS_ERROR = 'PGRST116';
const TLD_SELECT =
    'country_code,description,name,organization,pricing,punycode_name,tagline,type,year_established' as const;

function createDbClient() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function mapRow(row: Record<string, unknown>): TLD {
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

async function fetchTLD(name: string): Promise<TLD | null> {
    'use cache';
    cacheTag(`tld:${name}`);
    cacheLife({ revalidate: 60 });

    const client = createDbClient();
    const searchField = name.startsWith('xn--') ? 'punycode_name' : 'name';
    const { data, error } = await client.from('tld').select(TLD_SELECT).eq(searchField, name).single();

    if (error) {
        if (error.code === POSTGREST_NO_ROWS_ERROR) return null;
        logger.error({ error }, `Error fetching TLD ${name}`);
        throw new Error(`Failed to fetch TLD ${name}: ${error.message}`);
    }
    return mapRow(data);
}

async function fetchAllTLDs(): Promise<TLD[]> {
    'use cache';
    cacheTag('tlds');
    cacheLife({ revalidate: 60 });

    const client = createDbClient();
    const { data, error } = await client.from('tld').select(TLD_SELECT).order('name', { ascending: true }).limit(5000);

    if (error) {
        logger.error({ error }, 'Error fetching TLDs');
        throw new Error(`Failed to fetch TLDs: ${error.message}`);
    }
    return data.map(mapRow);
}

/**
 * A repository for interacting with TLD data in the Supabase database.
 *
 * This repository provides methods for creating, updating, and fetching TLDs from the database.
 */
class TLDRepository {
    private client: SupabaseClient;

    constructor() {
        this.client = createDbClient();
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

        revalidateTag('tlds');
        revalidateTag(`tld:${tld.name?.toLowerCase()}`);
    }

    /**
     * Fetches a TLD from the database.
     *
     * @param name - The name of the TLD to fetch.
     * @returns The TLD information.
     */
    async get(name: string): Promise<TLD | null> {
        return fetchTLD(name.toLowerCase());
    }

    /**
     * Lists all TLDs from the database.
     *
     * @returns A list of TLDs.
     */
    async list(): Promise<TLD[]> {
        return fetchAllTLDs();
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
                name: tld.name?.toLowerCase(),
                organization: tld.organization,
                pricing: tld.pricing,
                punycode_name: tld.punycodeName?.toLowerCase(),
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

        revalidateTag('tlds');
        revalidateTag(`tld:${name}`);
    }
}

export const tldRepository = new TLDRepository();
export type { TLDRepository };
