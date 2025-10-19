import axios from 'axios';
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

import { TLDType } from '@/models/tld';
import { tldRepository } from '@/services/tld-repository';
import logger from '@/utils/logger';

export const maxDuration = 300; // This function can run for a maximum of 5 minutes

/**
 * Enrich TLDs with their type.
 * This function fetches the TLDs from the database and enriches them with their type.
 */
export async function GET(): Promise<NextResponse> {
    try {
        logger.info('Starting TLD enrichment with type ...');
        const ianaResponse = await axios.get(`https://www.iana.org/domains/root/db`);
        const ianaWiki = cheerio.load(ianaResponse.data);
        const tlds = await tldRepository.listTLDs();
        for (const tld of tlds) {
            if (!tld.punycodeName || !tld.name) {
                logger.warn(`Skipping TLD ${tld.name} because it has no punycodeName or name`);
                continue;
            }
            const tableRow = ianaWiki(`a[href="/domains/root/db/${tld.punycodeName}.html"]`).closest('tr');
            const type = tableRow.find('td:nth-child(2)').text().trim().toUpperCase().replaceAll('-', '_');
            logger.info(`Enriching TLD ${tld.name} with type ${type} ...`);
            await tldRepository.updateTLD(tld.punycodeName, { type: type as TLDType });
        }
        logger.info('TLD enrichment with type completed');
        return NextResponse.json({ message: 'TLD enrichment with type completed successfully' });
    } catch (error) {
        logger.error({ error }, 'Error during TLD enrichment with type');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
