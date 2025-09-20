import axios from 'axios';
import { NextResponse } from 'next/server';

import { Registrar, TLDPricing } from '@/models/tld';
import { tldRepository } from '@/services/tld-repository';

export const maxDuration = 300; // This function can run for a maximum of 5 minutes

const PORKBUN_PRICES_URL = 'https://api.porkbun.com/api/json/v3/pricing/get';

/**
 * The response from the Porkbun API for pricing information.
 * See https://porkbun.com/api/json/v3/documentation#Domain%20Pricing for more details.
 */
interface PorkbunPricingResponse {
    status: string;
    pricing: {
        [tld: string]: {
            registration: string;
            renewal: string;
            transfer: string;
            restore: string;
        };
    };
}

/**
 * Enrich TLDs with the pricing information from Porkbun.
 * This function fetches the TLDs from the database and enriches them with the pricing information from Porkbun.
 * It then updates the TLDs in the database with the new pricing information.
 */
export async function GET(): Promise<NextResponse> {
    try {
        console.log('Starting TLD pricing enrichment from Porkbun ...');
        const response = await axios.get<PorkbunPricingResponse>(PORKBUN_PRICES_URL);
        const pricing = response.data.pricing;
        const tlds = Object.keys(pricing).map((tld) => tld.toLowerCase());
        for (const tld of tlds) {
            const tldInfo = await tldRepository.getTLD(tld);
            if (!tldInfo) {
                console.log(`TLD ${tld} not found in database. Skipping...`);
                continue;
            }
            const tldPricing: TLDPricing = {
                registration: parseFloat(pricing[tld].registration),
                renewal: parseFloat(pricing[tld].renewal),
                currency: 'USD',
            };
            const updatedPricing = { ...tldInfo?.pricing, [Registrar.PORKBUN]: tldPricing };
            await tldRepository.updateTLD(tld, { pricing: updatedPricing });
            console.log(`Updated ${tld} with Porkbun pricing`);
        }
        console.log('TLD pricing enrichment from Porkbun completed');
        return NextResponse.json({ message: 'TLD pricing enrichment from Porkbun completed successfully' });
    } catch (error) {
        console.error('Error during TLD pricing enrichment from Porkbun:', error);
        return NextResponse.json({ error: 'Failed to enrich TLD pricing from Porkbun' }, { status: 500 });
    }
}
