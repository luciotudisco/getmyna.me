import axios from 'axios';
import { NextResponse } from 'next/server';
import { storageService } from '@/services/storage';
import { TLDType } from '@/models/tld';

export const maxDuration = 300; // This function can run for a maximum of 5 minutes

export async function GET(): Promise<NextResponse> {
    try {
        console.log('Starting TLD type enrichment ...');
        const tlds = await storageService.listTLDs();
        for (const tld of tlds) {
            if (!tld.name || tld.type !== null && tld.type !== undefined) {
                continue;
            }
            try {
                const url = `https://www.iana.org/domains/root/db/${tld.name}.html`;
                const response = await axios.get<string>(url);
                const match = response.data.match(/<span class="tld-type">([^<]+)<\/span>/i);
                const typeStr = match?.[1]?.trim().toUpperCase().replace(/-/g, '_');
                console.log(`Extracted IANA type for ${tld.name}: ${typeStr ?? 'unknown'}`);
                const type =
                    (typeStr && TLDType[typeStr as keyof typeof TLDType]) ?? TLDType.GENERIC;
                await storageService.updateTLD(tld.name, { type });
                console.log(`Updated ${tld.name} with type ${type}`);
            } catch (error) {
                console.warn(`Failed to enrich ${tld.name}:`, error);
            }
        }
        console.log('TLD type enrichment completed');
        return NextResponse.json({ message: 'TLD type enrichment completed successfully' });
    } catch (error) {
        console.error('Error during TLD type enrichment:', error);
        return NextResponse.json({ error: 'Failed to enrich TLD types' }, { status: 500 });
    }
}
