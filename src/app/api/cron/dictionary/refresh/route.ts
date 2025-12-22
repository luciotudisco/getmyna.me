import { algoliasearch } from 'algoliasearch';
import { subDays } from 'date-fns';
import { NextResponse } from 'next/server';

import { DictionaryEntry } from '@/models/dictionary';
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
        logger.info('Starting fetch of all dictionary entries via pagination...');
        const lastUpdatedThreshold = subDays(new Date(), 0).toISOString();
        logger.info({ lastUpdatedThreshold }, 'Last updated threshold');

        const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
        const staleEntries: DictionaryEntry[] = [];
        await client.browseObjects<DictionaryEntry>({
            indexName: ALGOLIA_INDEX_NAME,
            browseParams: { hitsPerPage: 100 },
            aggregator: async ({ hits, cursor }) => {
                hits.forEach((hit) => {
                    const lastUpdated = hit.lastUpdated;
                    if (lastUpdated && lastUpdated < lastUpdatedThreshold) {
                        staleEntries.push(hit);
                    }
                });
                return cursor !== undefined;
            },
        });
        logger.info({ totalStaleEntries: staleEntries.length }, 'Finished fetching stale dictionary entries');
        return NextResponse.json({ message: 'Fetched stale dictionary entries', totalCount: staleEntries.length });
    } catch (error) {
        logger.error({ error }, 'Error fetching dictionary entries');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
