import { algoliasearch } from 'algoliasearch';
import { subDays } from 'date-fns';
import { NextResponse } from 'next/server';

import logger from '@/utils/logger';

export const maxDuration = 300;

const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!;
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY!;

/**
 * Updates the dictionary of domain hacks.
 */
export async function GET(): Promise<NextResponse> {
    try {
        logger.info('Starting fetch of oldest dictionary entries...');
        const lastUpdatedThreshold = subDays(new Date(), 30).toISOString();
        const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
        const searchResponse = await client.search([
            {
                indexName: ALGOLIA_INDEX_NAME,
                params: {
                    query: '',
                    filters: `lastUpdated < "${lastUpdatedThreshold}"`,
                    hitsPerPage: 1000,
                },
            },
        ]);
        const hits = searchResponse.results[0];
        console.log(hits);
        return NextResponse.json({ message: 'Updated dictionary entries' });
    } catch (error) {
        logger.error({ error }, 'Error fetching oldest dictionary entries');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
