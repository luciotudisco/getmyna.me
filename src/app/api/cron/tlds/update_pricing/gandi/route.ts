import axios from 'axios';
import { NextResponse } from 'next/server';
import { toUnicode } from 'punycode';

import { Registrar } from '@/models/tld';
import { tldRepository } from '@/services/tld-repository';
import logger from '@/utils/logger';

export const maxDuration = 300; // This function can run for a maximum of 5 minutes

const GANDI_API_KEY = process.env.GANDI_API_KEY;
const GANDI_TLDS_URL = 'https://api.gandi.net/v5/domain/tlds';

/**
 * The response from the Gandi API for TLDs.
 * See https://api.gandi.net/docs/domains/#v5-domain-tlds-name for more details.
 */
type GandiTLDsResponse = Array<{
    name: string;
    href: string;
}>;

/**
 * Enrich TLDs with the pricing information from Gandi.
 * This function fetches the TLDs from Gandi API and enriches them with the pricing information.
 * It then updates the TLDs in the database with the new pricing information.
 */
export async function GET(): Promise<NextResponse> {
    try {
        logger.info('Starting TLD pricing enrichment from Gandi ...');
        const headers = { Authorization: `Apikey ${GANDI_API_KEY}` };
        const response = await axios.get<GandiTLDsResponse>(GANDI_TLDS_URL, { headers });
        const tlds = response.data;
        for (const tldData of tlds) {
            const tldName = toUnicode(tldData.name);
            const tldInfo = await tldRepository.getTLD(tldName);
            if (!tldInfo) {
                logger.info(`TLD ${tldName} not found in database. Skipping...`);
                continue;
            }
            const updatedPricing = { ...tldInfo?.pricing, [Registrar.GANDI]: {} };
            await tldRepository.updateTLD(tldName, { pricing: updatedPricing });
            logger.info(`Updated ${tldName} with Gandi pricing`);
        }
        logger.info('TLD pricing enrichment from Gandi completed');
        return NextResponse.json({ message: 'TLD pricing enrichment from Gandi completed successfully' });
    } catch (error) {
        logger.error({ error }, 'Error during TLD pricing enrichment from Gandi');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
