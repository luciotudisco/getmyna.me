import axios from 'axios';
import { NextResponse } from 'next/server';
import { tldRepository } from '@/services/tld-repository';
import { Registrar } from '@/models/tld';
import { toUnicode } from 'punycode';

export const maxDuration = 300; // This function can run for a maximum of 5 minutes

const GANDI_API_KEY = process.env.GANDI_API_KEY;
const GANDI_TLDS_URL = 'https://api.gandi.net/v5/domain/tlds';

/**
 * The response from the Gandi API for TLDs.
 * See https://api.gandi.net/docs/domains/#v5-domain-tlds-name for more details.
 */
interface GandiTLDsResponse extends Array<{
    name: string;
    href: string;
}> {}

/**
 * Enrich TLDs with the pricing information from Gandi.
 * This function fetches the TLDs from Gandi API and enriches them with the pricing information.
 * It then updates the TLDs in the database with the new pricing information.
 */
export async function GET(): Promise<NextResponse> {
    try {
        console.log('Starting TLD pricing enrichment from Gandi ...');
        const headers = { 'Authorization': `Apikey ${GANDI_API_KEY}`,};
        const response = await axios.get<GandiTLDsResponse>(GANDI_TLDS_URL, {headers});
        const tlds = response.data;
        for (const tldData of tlds) {
            const tldName = toUnicode(tldData.name);
             const tldInfo = await tldRepository.getTLD(tldName);
            if (!tldInfo) {
                console.log(`TLD ${tldName} not found in database. Skipping...`);
                continue;
            }
            const updatedPricing = { ...tldInfo?.pricing, [Registrar.GANDI]: {} };
             await tldRepository.updateTLD(tldName, { pricing: updatedPricing });
            console.log(`Updated ${tldName} with Gandi pricing`);
        }
        console.log('TLD pricing enrichment from Gandi completed');
        return NextResponse.json({ message: 'TLD pricing enrichment from Gandi completed successfully' });
    } catch (error) {
        console.error('Error during TLD pricing enrichment from Gandi:', error);
        return NextResponse.json({ error: 'Failed to enrich TLD pricing from Gandi' }, { status: 500 });
    }
}
