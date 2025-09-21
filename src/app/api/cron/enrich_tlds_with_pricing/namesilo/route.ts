import axios from 'axios';
import { NextResponse } from 'next/server';

import { Registrar, TLDPricing } from '@/models/tld';
import { tldRepository } from '@/services/tld-repository';

export const maxDuration = 300; // This function can run for a maximum of 5 minutes

const NAMESILO_API_KEY = process.env.NAMESILO_API_KEY;
const NAMESILO_PRICES_URL = `https://www.namesilo.com/api/getPrices?version=1&type=json&key=${NAMESILO_API_KEY}`;

/**
 * The response from the Namesilo API for pricing information.
 * See https://www.namesilo.com/api-reference#account/get-prices for more details.
 */
interface NamesiloPricingResponse {
    reply: {
        [tld: string]: {
            registration: string;
            renew: string;
        };
    };
}

/**
 * Enrich TLDs with the pricing information from Namesilo.
 * This function fetches the TLDs from the database and enriches them with the pricing information from Namesilo.
 * It then updates the TLDs in the database with the new pricing information.
 */
export async function GET(): Promise<NextResponse> {
    try {
        console.warn('Starting TLD pricing enrichment from Namesilo ...');
        const response = await axios.get<NamesiloPricingResponse>(NAMESILO_PRICES_URL);
        const tlds = Object.keys(response.data.reply).map((tld) => tld.toLowerCase());
        for (const tld of tlds) {
            const tldInfo = await tldRepository.getTLD(tld);
            if (!tldInfo) {
                console.warn(`TLD ${tld} not found in database. Skipping...`);
                continue;
            }
            const tldPricing: TLDPricing = {
                registration: parseFloat(response.data.reply[tld].registration),
                renewal: parseFloat(response.data.reply[tld].renew),
                currency: 'USD',
            };
            const updatedPricing = { ...tldInfo?.pricing, [Registrar.NAMESILO]: tldPricing };
            await tldRepository.updateTLD(tld, { pricing: updatedPricing });
            console.warn(`Updated ${tld} with Namesilo pricing`);
        }
        console.warn('TLD pricing enrichment from Namesilo completed');
        return NextResponse.json({ message: 'TLD pricing enrichment from Namesilo completed successfully' });
    } catch (error) {
        console.error('Error during TLD pricing enrichment from Namesilo:', error);
        return NextResponse.json({ error: 'Failed to enrich TLD pricing from Namesilo' }, { status: 500 });
    }
}
