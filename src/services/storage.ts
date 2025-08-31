import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TLD } from '@/models/tld';

class StorageService {
    private client: SupabaseClient;

    constructor() {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        this.client = createClient(supabaseUrl, supabaseKey);
    }

    async createTld(tldInfo: TLD): Promise<void> {
        const { error } = await this.client.from('tld').insert({
            name: tldInfo.name,
            description: tldInfo.description,
        });
        if (error) {
            console.error('Error creating TLD in Supabase:', error);
            throw new Error(`Failed to create TLD: ${error.message}`);
        }
    }

    async getTLDByName(name: string): Promise<TLD | null> {
        const { data, error } = await this.client.from('tld').select('id, name, description').eq('name', name).single();
        if (error) {
            if (error.code === 'PGRST116') {
                // No rows returned
                return null;
            }
            console.error('Error fetching TLD by name from Supabase:', error);
            throw new Error(`Failed to fetch TLD: ${error.message}`);
        }
        return data as TLD;
    }

    async listTLDs(): Promise<TLD[]> {
        const { data, error } = await this.client
            .from('tld')
            .select('id, name, description')
            .order('name', { ascending: true });
        if (error) {
            console.error('Error fetching TLDs from Supabase:', error);
            throw new Error(`Failed to fetch TLDs: ${error.message}`);
        }
        return data as TLD[];
    }
}

export const storageService = new StorageService();
export type { StorageService };
