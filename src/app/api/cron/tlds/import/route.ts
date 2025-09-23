import axios from 'axios';
import { NextResponse } from 'next/server';
import { toASCII, toUnicode } from 'punycode';

import { tldRepository } from '@/services/tld-repository';
import logger from '@/utils/logger';
import { getTextDirection } from '@/utils/unicode';

const IANA_TLD_URL = 'https://data.iana.org/TLD/tlds-alpha-by-domain.txt';
export const maxDuration = 300; // This function can run for a maximum of 5 minutes

export async function GET(): Promise<NextResponse> {
    try {
        logger.info('Starting TLD import from IANA ...');

        // Fetch TLD data from IANA
        const response = await axios.get(IANA_TLD_URL);
        const tldData = response.data as string;

        // Parse the data and store in Supabase
        const lines = tldData.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) {
                // Skip comments and empty lines
                continue;
            }

            const punycodeName = trimmed.toLowerCase();
            const tldName = toUnicode(punycodeName);
            const direction = getTextDirection(tldName);
            const existingTld = await tldRepository.getTLD(punycodeName);
            if (existingTld) {
                logger.info(`TLD ${punycodeName} already exists. Skipping...`);
                continue;
            }

            logger.info(`Creating TLD ${punycodeName} ...`);
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
        return NextResponse.json({ error: 'Failed to import TLDs' }, { status: 500 });
    }
}
