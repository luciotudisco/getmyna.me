import { algoliasearch } from 'algoliasearch';
import { NextResponse } from 'next/server';

import { DictionaryEntry } from '@/models/dictionary';
import logger from '@/utils/logger';

const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!;
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY!;

/**
 * GET /api/dictionary/availability
 * Retrieves dictionary entries where lastUpdated is older than 60 days, ordered by rank.
 *
 * @returns Array of dictionary entries matching the criteria
 */
export async function GET(): Promise<NextResponse> {
    try {
        const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);

        // Calculate the date 60 days ago
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const sixtyDaysAgoTimestamp = sixtyDaysAgo.getTime();

        logger.info({ sixtyDaysAgo: sixtyDaysAgo.toISOString() }, 'Searching for entries older than 60 days');

        // Retrieve all entries (paginated if necessary)
        // Note: Algolia stores lastUpdated as ISO string, so we need to filter on the server side
        const allEntries: DictionaryEntry[] = [];
        let page = 0;
        const hitsPerPage = 1000;
        let hasMore = true;

        while (hasMore) {
            const results = await client.searchSingleIndex<DictionaryEntry>({
                indexName: ALGOLIA_INDEX_NAME,
                searchParams: {
                    query: '',
                    page,
                    hitsPerPage,
                    attributesToRetrieve: [
                        'objectID',
                        'domain',
                        'word',
                        'tld',
                        'category',
                        'rank',
                        'lastUpdated',
                        'isAvailable',
                    ],
                },
            });

            allEntries.push(...results.hits);
            hasMore = results.hits.length === hitsPerPage;
            page++;

            // Safety limit to prevent infinite loops
            if (page > 100) {
                logger.warn({ page }, 'Reached maximum page limit');
                break;
            }
        }

        // Filter entries older than 60 days and sort by rank
        const filteredAndSortedEntries = allEntries
            .filter((entry) => {
                if (!entry.lastUpdated) {
                    return true; // Include entries without lastUpdated (treat as old)
                }
                const entryDate = new Date(entry.lastUpdated);
                return entryDate.getTime() < sixtyDaysAgoTimestamp;
            })
            .sort((a, b) => {
                const rankA = a.rank ?? Number.MAX_SAFE_INTEGER;
                const rankB = b.rank ?? Number.MAX_SAFE_INTEGER;
                return rankA - rankB;
            });

        logger.info(
            { count: filteredAndSortedEntries.length, totalEntries: allEntries.length },
            'Retrieved entries older than 60 days',
        );

        return NextResponse.json({
            entries: filteredAndSortedEntries,
            count: filteredAndSortedEntries.length,
            cutoffDate: sixtyDaysAgo.toISOString(),
        });
    } catch (error) {
        logger.error({ error }, 'Error fetching dictionary entries older than 60 days');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
