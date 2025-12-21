import { algoliasearch } from 'algoliasearch';
import { NextResponse } from 'next/server';

import { DictionaryEntry } from '@/models/dictionary';
import logger from '@/utils/logger';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY!;
const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!;

/**
 * GET endpoint to retrieve dictionary entries whose lastUpdated date is older than 60 days.
 * Results are ordered by rank in ascending order.
 */
export async function GET(request: Request): Promise<NextResponse> {
    try {
        // Calculate the date 60 days ago
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const timestampSixtyDaysAgo = Math.floor(sixtyDaysAgo.getTime() / 1000);

        logger.info({ sixtyDaysAgo: sixtyDaysAgo.toISOString() }, 'Searching for stale entries');

        // Initialize Algolia client
        const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);

        // Parse query parameters for pagination
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') ?? '0', 10);
        const hitsPerPage = parseInt(searchParams.get('hitsPerPage') ?? '100', 10);

        // Query Algolia for entries with lastUpdatedTimestamp older than 60 days
        const searchResult = await algoliaClient.searchForHits({
            requests: [
                {
                    indexName: ALGOLIA_INDEX_NAME,
                    query: '',
                    filters: `lastUpdatedTimestamp < ${timestampSixtyDaysAgo}`,
                    page,
                    hitsPerPage: Math.min(hitsPerPage, 1000), // Cap at 1000
                    attributesToRetrieve: [
                        'objectID',
                        'domain',
                        'tld',
                        'word',
                        'category',
                        'isAvailable',
                        'rank',
                        'lastUpdated',
                        'lastUpdatedTimestamp',
                        'locale',
                    ],
                },
            ],
        });

        const hits = (searchResult.results[0]?.hits ?? []) as unknown as DictionaryEntry[];
        const nbHits = searchResult.results[0]?.nbHits ?? 0;
        const nbPages = searchResult.results[0]?.nbPages ?? 0;

        // Sort by rank (ascending) if rank is available
        const sortedHits = hits.sort((a, b) => {
            const rankA = a.rank ?? Infinity;
            const rankB = b.rank ?? Infinity;
            return rankA - rankB;
        });

        logger.info({ count: hits.length, total: nbHits }, 'Found stale entries');

        return NextResponse.json({
            entries: sortedHits,
            pagination: {
                page,
                hitsPerPage,
                nbHits,
                nbPages,
            },
        });
    } catch (error) {
        logger.error({ error }, 'Error fetching stale dictionary entries');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
