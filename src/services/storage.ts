import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TLD } from '@/models/tld';
import { TTLCache } from '@/utils/cache';

class StorageService {
    private client: SupabaseClient;
    private cache = new TTLCache<unknown>();
    private readonly ttlMs = 60_000;

    constructor() {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        this.client = createClient(supabaseUrl, supabaseServiceKey);
    }

    async createTld(tldInfo: TLD): Promise<void> {
        const { error } = await this.client.from('tld').upsert(
            {
                name: tldInfo.name,
                description: tldInfo.description,
                type: tldInfo.type,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                onConflict: 'name',
            },
        );
        if (error) {
            console.error('Error upserting TLD:', error);
            throw new Error(`Failed to upsert TLD: ${error.message}`);
        }

        this.cache.delete('tlds');
        this.cache.delete(`tld:${tldInfo.name}`);
    }

    async getTLD(name: string): Promise<TLD | null> {
        const cacheKey = `tld:${name}`;
        const cached = this.cache.get(cacheKey);
        if (cached !== undefined) {
            return cached as TLD | null;
        }
        const { data, error } = await this.client.from('tld').select('name, description, type').eq('name', name).single();
        if (error) {
            if (error.code === 'PGRST116') {
                // No rows returned
                this.cache.set(cacheKey, null, this.ttlMs);
                return null;
            }
            console.error('Error fetching TLD by name:', error);
            throw new Error(`Failed to fetch TLD: ${error.message}`);
        }
        this.cache.set(cacheKey, data as TLD, this.ttlMs);
        return data as TLD;
    }

    async listTLDs(): Promise<TLD[]> {
        const cacheKey = 'tlds';
        const cached = this.cache.get(cacheKey);
        if (cached) {
            return cached as TLD[];
        }

        const { data, error } = await this.client
            .from('tld')
            .select('name, type, description')
            .order('name', { ascending: true });
        if (error) {
            console.error('Error fetching TLDs:', error);
            throw new Error(`Failed to fetch TLDs: ${error.message}`);
        }
        this.cache.set(cacheKey, data as TLD[], this.ttlMs);
        return data as TLD[];
    }

    async updateTLD(name: string, tldInfo: TLD): Promise<void> {
        const { error } = await this.client
            .from('tld')
            .update({ ...tldInfo, updated_at: new Date().toISOString() })
            .eq('name', name);
        if (error) {
            console.error('Error updating TLD:', error);
            throw new Error(`Failed to update TLD: ${error.message}`);
        }

        this.cache.delete('tlds');
        this.cache.delete(`tld:${name}`);
    }
}

export const storageService = new StorageService();
export type { StorageService };
