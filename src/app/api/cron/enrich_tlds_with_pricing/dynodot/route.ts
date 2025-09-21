import axios from 'axios';
import { NextResponse } from 'next/server';

import { Registrar, TLDPricing } from '@/models/tld';
import { tldRepository } from '@/services/tld-repository';

export const maxDuration = 300; // This function can run for a maximum of 5 minutes

const DYNADOT_API_KEY = process.env.DYNADOT_API_KEY;
if (!DYNADOT_API_KEY) {
    throw new Error('DYNADOT_API_KEY environment variable is not set');
}
const DYNADOT_PRICES_URL = 'https://api.dynadot.com/restful/v1/domains/get_tld_price?currency=USD';

/**
 * The response from the Dynadot API for pricing information.
 * See Dynadot API documentation for more details.
 */
interface DynadotPricingResponse {
    data: {
        tldPriceList: Array<{
            tld: string;
            allYearsRegisterPrice: string[];
            allYearsRenewPrice: string[];
        }>;
    };
}

/**
 * Enrich TLDs with the pricing information from Dynadot.
 * This function fetches the TLDs from the database and enriches them with the pricing information from Dynadot.
 * It then updates the TLDs in the database with the new pricing information.
 */
export async function GET(): Promise<NextResponse> {
    try {
        console.warn('Starting TLD pricing enrichment from Dynadot ...');
        const headers = { Authorization: `Bearer ${DYNADOT_API_KEY}`, Accept: 'application/json' };
        const response = await axios.get<DynadotPricingResponse>(DYNADOT_PRICES_URL, { headers });
        const tldPriceList = response.data.data.tldPriceList;
        for (const tldPrice of tldPriceList) {
            const tld = tldPrice.tld.toLowerCase().replace(/^\./, '');
            const tldInfo = await tldRepository.getTLD(tld);
            if (!tldInfo) {
                console.warn(`TLD ${tld} not found in database. Skipping...`);
                continue;
            }
            const tldPricing: TLDPricing = {
                registration: parseFloat(tldPrice.allYearsRegisterPrice[0]),
                renewal: parseFloat(tldPrice.allYearsRegisterPrice[0]),
                currency: 'USD',
            };
            const updatedPricing = { ...tldInfo?.pricing, [Registrar.DYNADOT]: tldPricing };
            await tldRepository.updateTLD(tld, { pricing: updatedPricing });
            console.warn(`Updated ${tld} with Dynadot pricing`);
        }
        console.warn('TLD pricing enrichment from Dynadot completed');
        return NextResponse.json({ message: 'TLD pricing enrichment from Dynadot completed successfully' });
    } catch (error) {
        console.error('Error during TLD pricing enrichment from Dynadot:', error);
        return NextResponse.json({ error: 'Failed to enrich TLD pricing from Dynadot' }, { status: 500 });
    }
}
