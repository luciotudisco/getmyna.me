import axios from 'axios';
import { NextResponse } from 'next/server';
import { toUnicode } from 'punycode';

import { tldRepository } from '@/services/tld-repository';
import logger from '@/utils/logger';
import { getTextDirection } from '@/utils/unicode';

const IANA_TLD_URL = 'https://data.iana.org/TLD/tlds-alpha-by-domain.txt';
export const maxDuration = 300; // This function can run for a maximum of 5 minutes

export async function GET(): Promise<NextResponse> {
    try {
        logger.info('Starting TLD import from IANA ...');

        // Fetch TLD data from IANA, parse it, and filter out comments and empty lines
        const response = await axios.get<string>(IANA_TLD_URL);
        const tldsRaw = response.data;
        const tlds = tldsRaw.split('\n').filter((line) => line.trim() && !line.startsWith('#'));

        // Store TLDs in Supabase, if they don't already exist
        for (const tld of tlds) {
            const punycodeName = tld.toLowerCase();
            const tldName = toUnicode(punycodeName);
            const direction = getTextDirection(tldName);
            const existingTld = await tldRepository.getTLD(punycodeName);
            if (existingTld) {
                logger.info(`TLD ${punycodeName} already exists. Skipping...`);
                continue;
            }
            logger.info(`Creating new TLD ${punycodeName} ...`);
            await tldRepository.createTld({
                name: tldName,
                punycodeName,
                direction,
            });
        }

        logger.info('TLD import completed');
        return NextResponse.json({ message: 'TLD import completed successfully' });
    } catch (error) {
        logger.error({ error }, 'Error during TLD import');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
