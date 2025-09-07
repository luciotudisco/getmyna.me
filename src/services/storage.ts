import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Cacheable } from 'ts-cacheable';
import { TLD } from '@/models/tld';

class StorageService {
    private client: SupabaseClient;

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
                created_at: new Date().toISOString(),
            },
            {
                onConflict: 'name',
            },
        );
        if (error) {
            console.error('Error upserting TLD:', error);
            throw new Error(`Failed to upsert TLD: ${error.message}`);
        }
    }

    @Cacheable({ ttl: 60 * 60 * 24 })
    async getTLDByName(name: string): Promise<TLD | null> {
        const { data, error } = await this.client.from('tld').select('id, name, description').eq('name', name).single();
        if (error) {
            if (error.code === 'PGRST116') {
                // No rows returned
                return null;
            }
            console.error('Error fetching TLD by name:', error);
            throw new Error(`Failed to fetch TLD: ${error.message}`);
        }
        return data as TLD;
    }

    @Cacheable({ ttl: 60 * 60 * 24 })
    async tldExists(name: string): Promise<boolean> {
        const tld = await this.getTLDByName(name);
        return tld !== null;
    }

    @Cacheable({ ttl: 60 * 60 * 24 })
    async listTLDs(): Promise<TLD[]> {
        const { data, error } = await this.client
            .from('tld')
            .select('name, type, description')
            .order('name', { ascending: true });
        if (error) {
            console.error('Error fetching TLDs:', error);
            throw new Error(`Failed to fetch TLDs: ${error.message}`);
        }
        return data as TLD[];
    }

    async updateTld(name: string, tldInfo: TLD): Promise<void> {
        const { error } = await this.client.from('tld').update(tldInfo).eq('name', name);
        if (error) {
            console.error('Error updating TLD:', error);
            throw new Error(`Failed to update TLD: ${error.message}`);
        }
    }
}

export const storageService = new StorageService();
export type { StorageService };
