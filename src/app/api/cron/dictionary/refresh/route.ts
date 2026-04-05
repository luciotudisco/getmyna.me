import { algoliasearch } from 'algoliasearch';
import axios from 'axios';
import { subDays } from 'date-fns';
import { NextResponse } from 'next/server';

import { DictionaryEntry } from '@/models/dictionary';
import { DOMAIN_AVAILABLE_STATUS_VALUES, DomainStatus } from '@/models/domain';
import logger from '@/utils/logger';

export const maxDuration = 300;

const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!;
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY!;
const RAPID_API_KEY = process.env.RAPID_API_KEY!;
const DOMAINR_BASE_URL = 'https://domainr.p.rapidapi.com/v2/status';
const STALE_THRESHOLD_DAYS = 0;
const MAX_STALE_ENTRIES = 100;

/**
 * Updates the dictionary of domain hacks.
 */
export async function GET(): Promise<NextResponse> {
    try {
        logger.info('Starting fetch stale dictionary ...');
        const lastUpdatedThreshold = subDays(new Date(), STALE_THRESHOLD_DAYS).toISOString();
        logger.info({ lastUpdatedThreshold }, 'Last updated threshold');

        const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);

        // Fetch up to MAX_STALE_ENTRIES stale dictionary entries to refresh
        const staleEntries: DictionaryEntry[] = [];
        await client.browseObjects<DictionaryEntry>({
            indexName: ALGOLIA_INDEX_NAME,
            browseParams: { hitsPerPage: 100 },
            aggregator: async ({ hits, cursor }) => {
                hits.forEach((hit) => {
                    if (staleEntries.length >= MAX_STALE_ENTRIES) {
                        return false;
                    }
                    const lastUpdated = hit.lastUpdated;
                    if (lastUpdated && lastUpdated < lastUpdatedThreshold) {
                        staleEntries.push(hit as DictionaryEntry);
                    }
                });
                return cursor !== undefined;
            },
        });

        // Refresh the availability of the stale dictionary entries
        for (const entry of staleEntries) {
            const domainName = entry.domain;
            try {
                logger.info({ domainName }, 'Refreshing dictionary entry ...');
                const config = { headers: { 'x-rapidapi-key': RAPID_API_KEY }, params: { domain: domainName } };
                const response = await axios.get(DOMAINR_BASE_URL, config);

                let isAvailable = false;
                if (response.data.status?.length > 0 && response.data.status[0].status) {
                    const status = response.data.status[0].status.split(' ').at(-1)?.toUpperCase() as DomainStatus;
                    isAvailable = DOMAIN_AVAILABLE_STATUS_VALUES.has(status);
                }

                await client.partialUpdateObject({
                    indexName: ALGOLIA_INDEX_NAME,
                    objectID: entry.objectID!,
                    attributesToUpdate: { isAvailable, lastUpdated: new Date().toISOString() },
                });
                logger.info({ domainName, isAvailable }, 'Updated dictionary entry');
            } catch (error) {
                logger.error({ error, domainName }, 'Error refreshing dictionary entry, skipping ...');
            }
        }

        logger.info({ count: staleEntries.length }, 'Finished refreshing stale dictionary entries');
        return NextResponse.json({ message: 'Refreshed stale dictionary entries', count: staleEntries.length });
    } catch (error) {
        logger.error({ error }, 'Error fetching dictionary entries');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
