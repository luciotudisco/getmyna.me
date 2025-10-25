import axios from 'axios';
import { NextResponse } from 'next/server';

import { Registrar, TLDPricing } from '@/models/tld';
import { tldRepository } from '@/services/tld-repository';
import logger from '@/utils/logger';

export const maxDuration = 300; // This function can run for a maximum of 5 minutes

const DYNADOT_API_KEY = process.env.DYNADOT_API_KEY!;
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
        logger.info('Starting TLD pricing enrichment from Dynadot ...');
        const headers = { Authorization: `Bearer ${DYNADOT_API_KEY}`, Accept: 'application/json' };
        const response = await axios.get<DynadotPricingResponse>(DYNADOT_PRICES_URL, { headers });
        const tldPriceList = response.data.data.tldPriceList;
        for (const tldPrice of tldPriceList) {
            const tld = tldPrice.tld.toLowerCase().replace(/^\./, '');
            const tldInfo = await tldRepository.get(tld);
            if (!tldInfo) {
                logger.info(`TLD ${tld} not found in database. Skipping...`);
                continue;
            }
            const tldPricing: TLDPricing = {
                registration: parseFloat(tldPrice.allYearsRegisterPrice[0]),
                renewal: parseFloat(tldPrice.allYearsRegisterPrice[0]),
                currency: 'USD',
            };
            const updatedPricing = { ...tldInfo?.pricing, [Registrar.DYNADOT]: tldPricing };
            await tldRepository.update(tld, { pricing: updatedPricing });
            logger.info(`Updated ${tld} with Dynadot pricing`);
        }
        logger.info('TLD pricing enrichment from Dynadot completed');
        return NextResponse.json({ message: 'TLD pricing enrichment from Dynadot completed successfully' });
    } catch (error) {
        logger.error({ error }, 'Error during TLD pricing enrichment from Dynadot');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
