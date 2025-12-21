import { algoliasearch } from 'algoliasearch';
import axios from 'axios';
import { NextResponse } from 'next/server';

import { DictionaryEntry } from '@/models/dictionary';
import { DomainStatus } from '@/models/domain';
import logger from '@/utils/logger';

const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!;
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY!;
const RAPID_API_KEY = process.env.RAPID_API_KEY!;
const DOMAINR_BASE_URL = 'https://domainr.p.rapidapi.com/v2/status';

// Maximum number of entries to check per day
const MAX_ENTRIES_PER_DAY = 100;

// Status values that indicate a domain is available
const DOMAIN_AVAILABLE_STATUS_VALUES = new Set([
    DomainStatus.INACTIVE,
    DomainStatus.PREMIUM,
    DomainStatus.TRANSFERABLE,
]);

export const maxDuration = 300; // This function can run for a maximum of 5 minutes

/**
 * Checks the availability status of a domain using the Domainr API.
 * @param domain - The domain name to check
 * @returns The availability status as a boolean, or undefined if an error occurred
 */
async function checkDomainAvailability(domain: string): Promise<boolean | undefined> {
    try {
        const config = {
            headers: { 'x-rapidapi-key': RAPID_API_KEY },
            params: { domain },
        };
        const response = await axios.get(DOMAINR_BASE_URL, config);

        if (!response.data.status || response.data.status.length === 0 || !response.data.status[0].status) {
            logger.error({ domain }, `No valid status found for domain ${domain}`);
            return undefined;
        }

        const status = response.data.status[0].status.split(' ').at(-1)?.toUpperCase() as DomainStatus;
        const isAvailable = DOMAIN_AVAILABLE_STATUS_VALUES.has(status);

        logger.info({ domain, status, isAvailable }, 'Domain availability checked');
        return isAvailable;
    } catch (error) {
        logger.error({ error, domain }, `Error checking availability for domain ${domain}`);
        return undefined;
    }
}

/**
 * Cron job that retrieves up to 100 Algolia entries per day and checks their availability.
 * Prioritizes entries that have not been checked recently or have never been checked.
 */
export async function GET(): Promise<NextResponse> {
    try {
        logger.info('Starting availability check for Algolia entries...');

        const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);

        // Fetch entries sorted by lastUpdated (oldest first, or undefined)
        // This ensures we check entries that haven't been checked recently
        const searchResponse = await algoliaClient.searchSingleIndex({
            indexName: ALGOLIA_INDEX_NAME,
            searchParams: {
                query: '',
                hitsPerPage: MAX_ENTRIES_PER_DAY,
                attributesToRetrieve: ['objectID', 'domain', 'isAvailable', 'lastUpdated'],
            },
        });

        const entries = (searchResponse.hits || []) as DictionaryEntry[];
        logger.info({ count: entries.length }, 'Retrieved entries from Algolia');

        let checkedCount = 0;
        let updatedCount = 0;
        let errorCount = 0;

        for (const entry of entries) {
            const domain = entry.domain;
            const currentAvailability = entry.isAvailable;

            logger.info({ domain, currentAvailability }, 'Checking domain availability');

            const newAvailability = await checkDomainAvailability(domain);

            if (newAvailability === undefined) {
                errorCount++;
                continue;
            }

            checkedCount++;

            // Update the entry in Algolia if availability changed or was undefined
            if (currentAvailability !== newAvailability) {
                try {
                    await algoliaClient.partialUpdateObject({
                        indexName: ALGOLIA_INDEX_NAME,
                        objectID: entry.objectID as string,
                        attributesToUpdate: {
                            isAvailable: newAvailability,
                            lastUpdated: new Date().toISOString(),
                        },
                    });
                    updatedCount++;
                    logger.info(
                        { domain, oldAvailability: currentAvailability, newAvailability },
                        'Updated entry in Algolia',
                    );
                } catch (error) {
                    logger.error({ error, domain }, 'Error updating entry in Algolia');
                    errorCount++;
                }
            } else {
                // Even if availability didn't change, update the lastUpdated timestamp
                try {
                    await algoliaClient.partialUpdateObject({
                        indexName: ALGOLIA_INDEX_NAME,
                        objectID: entry.objectID as string,
                        attributesToUpdate: {
                            lastUpdated: new Date().toISOString(),
                        },
                    });
                    logger.info({ domain }, 'Updated lastUpdated timestamp in Algolia');
                } catch (error) {
                    logger.error({ error, domain }, 'Error updating timestamp in Algolia');
                    errorCount++;
                }
            }

            // Add a small delay between API calls to avoid rate limiting
            await new Promise((resolve) => {
                setTimeout(resolve, 100);
            });
        }

        const message = `Availability check completed. Checked: ${checkedCount}, Updated: ${updatedCount}, Errors: ${errorCount}`;
        logger.info({ checkedCount, updatedCount, errorCount }, message);

        return NextResponse.json({
            message,
            stats: {
                entriesRetrieved: entries.length,
                checkedCount,
                updatedCount,
                errorCount,
            },
        });
    } catch (error) {
        logger.error({ error }, 'Error during availability check');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
