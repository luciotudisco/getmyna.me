import axios from 'axios';
import { NextResponse } from 'next/server';

import { Registrar, TLDPricing } from '@/models/tld';
import { tldRepository } from '@/services/tld-repository';
import logger from '@/utils/logger';

export const maxDuration = 300; // This function can run for a maximum of 5 minutes

const NAMECOM_API_KEY = process.env.NAMECOM_API_KEY;
const NAMECOM_PRICES_URL = `https://api.name.com/core/v1/tldpricing`;

/**
 * The response from the Name.com API for pricing information.
 * See https://docs.name.com/coreapi/namecom.api/tld-pricing/tldpricelist for more details.
 */
interface NameComPricingResponse {
    nextPage?: number;
    pricing: Array<{
        tld: string;
        registrationPrice: string;
        renewalPrice: string;
    }>;
}

/**
 * Enrich TLDs with the pricing information from Name.com.
 * This function fetches the TLDs from the database and enriches them with the pricing information from Name.com.
 * It then updates the TLDs in the database with the new pricing information.
 */
export async function GET(): Promise<NextResponse> {
    try {
        logger.info('Starting TLD pricing enrichment from Name.com ...');
        const headers = { Authorization: `Basic ${NAMECOM_API_KEY}` };
        let page = 1;
        let hasMoreResults = true;
        const MAX_PAGES = 100;
        while (hasMoreResults) {
            const response = await axios.get<NameComPricingResponse>(NAMECOM_PRICES_URL, { headers, params: { page } });
            const pricingItems = response.data.pricing;
            for (const pricingItem of pricingItems) {
                const tld = pricingItem.tld;
                logger.info(`TLD ${tld} found in Name.com pricing`);
                const tldInfo = await tldRepository.getTLD(tld);
                if (!tldInfo) {
                    logger.info(`TLD ${tld} not found in database. Skipping...`);
                    continue;
                }
                const tldPricing: TLDPricing = {
                    registration: parseFloat(parseFloat(pricingItem.registrationPrice).toFixed(2)),
                    renewal: parseFloat(parseFloat(pricingItem.renewalPrice).toFixed(2)),
                    currency: 'USD',
                };
                const updatedPricing = { ...tldInfo?.pricing, [Registrar.NAMECOM]: tldPricing };
                await tldRepository.updateTLD(tld, { pricing: updatedPricing });
                logger.info(`Updated ${tld} with Name.com pricing`);
            }
            hasMoreResults = response.data.nextPage !== null && page < MAX_PAGES;
            page += 1;
        }
        logger.info('TLD pricing enrichment from Name.com completed');
        return NextResponse.json({ message: 'TLD pricing enrichment from Name.com completed successfully' });
    } catch (error) {
        logger.error('Error during TLD pricing enrichment from Name.com:', error);
        return NextResponse.json({ error: 'Failed to enrich TLD pricing from Name.com' }, { status: 500 });
    }
}
