import axios from 'axios';
import { NextResponse } from 'next/server';
import { storageService } from '@/services/storage';

const IANA_TLD_URL = 'https://data.iana.org/TLD/tlds-alpha-by-domain.txt';

export async function GET(): Promise<NextResponse> {
    try {
        console.log('Starting TLD sync from IANA...');

        // Fetch TLD data from IANA
        const response = await axios.get(IANA_TLD_URL);
        const tldData = response.data as string;

        // Parse the data - skip comments and empty lines
        const lines = tldData.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) {
                continue;
            }
            await storageService.createTld({
                name: trimmed.toLowerCase(),
            });
        }

        console.log('TLD sync completed');
        return NextResponse.json({ message: 'TLD sync completed successfully' });
    } catch (error) {
        console.error('Error during TLD sync:', error);
        return NextResponse.json({ error: 'Failed to sync TLDs' }, { status: 500 });
    }
}
