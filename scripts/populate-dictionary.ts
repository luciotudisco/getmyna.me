#!/usr/bin/env node
import { algoliasearch } from 'algoliasearch';
import axios from 'axios';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
// @ts-expect-error - whois module doesn't have type definitions
import * as whois from 'whois';

import { Domain, DOMAIN_AVAILABLE_STATUS_VALUES, DomainStatus } from '../src/models/domain';
import { DomainHacksGenerator } from '../src/services/domain-hacks';
import { tldRepository } from '../src/services/tld-repository';
import logger from '../src/utils/logger';

const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!;
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY!;

const AVAILABLE_PATTERNS = new RegExp(
    [
        'does not exist',
        'domain not found',
        'is free',
        'no data found',
        'no entries found',
        'no match',
        'not found',
        'status:\\s*available',
        'status:\\s*free',
    ].join('|'),
    'i',
);

const REGISTERED_PATTERNS = new RegExp(
    [
        'creation date:',
        'domain name:',
        'domain status:',
        'expiry date:',
        'holder',
        'registrant',
        'registrar:',
        'registry expiry date:',
        'status:\\s*active',
        'status:\\s*connect',
        'status:\\s*ok',
        'updated date:',
    ].join('|'),
    'i',
);

/**
 * Parses a CSV file and returns an array of rows.
 * @param filePath - Path to the CSV file
 * @returns Promise resolving to an array of CSV rows
 */
async function parseCSV(filePath: string): Promise<Array<{ word: string }>> {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, { columns: true, skip_empty_lines: true, trim: true });
    return records.map((record) => ({ word: (record as Record<string, string>).word })) as Array<{ word: string }>;
}

/**
 * Populates the Algolia dictionary domain hacks from words in a CSV file.
 * @param csvPath - Path to the CSV file.
 * @param category - Category for the dictionary entries (default: 'common').
 * @param locale - Locale for the dictionary entries (default: 'en_US').
 */
async function populateDictionary(
    csvPath: string,
    category: string = 'common',
    locale: string = 'en_US',
): Promise<void> {
    logger.info({ csvPath, category, locale }, 'Starting dictionary population');
    const rows = await parseCSV(csvPath);
    logger.info({ count: rows.length }, 'Parsed CSV rows');

    const tlds = await tldRepository.list();
    const domainHacks = new DomainHacksGenerator(tlds);
    const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);

    // Ensure index settings support filtering (e.g. `filters: 'tld:"com"'`).
    // Without `attributesForFaceting`, Algolia will ignore or error on filters for those attributes.
    const settingsResponse = await algoliaClient.setSettings({
        indexName: ALGOLIA_INDEX_NAME,
        indexSettings: {
            attributesForFaceting: ['filterOnly(tld)', 'filterOnly(category)', 'filterOnly(isAvailable)'],
        },
    });
    await algoliaClient.waitForTask({ indexName: ALGOLIA_INDEX_NAME, taskID: settingsResponse.taskID });

    logger.info('Starting Algolia indexing...');
    let indexedCount = 0;
    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        const domainNames = domainHacks.getDomainsHacks(row.word, false);
        for (const domainName of domainNames) {
            logger.info({ domainName }, 'Processing domain name');
            const domain = new Domain(domainName);
            const isAvailable = await isDomainAvailable(domainName);
            const entry = {
                objectID: domain.getName(),
                domain: domain.getName(),
                tld: domain.getTLD().toLowerCase(),
                word: row.word,
                category,
                locale,
                rank: indexedCount + 1,
                isAvailable,
                lastUpdated: new Date().toISOString(),
            };
            await algoliaClient.saveObject({ indexName: ALGOLIA_INDEX_NAME, body: entry });
            indexedCount++;
        }
    }
}

export async function isDomainAvailable(domain: string, opts?: { timeoutMs?: number }): Promise<boolean | undefined> {
    const timeoutMs = Math.max(1000, Math.min(opts?.timeoutMs ?? 6000, 15000));

    const isWhoisAvailable = new Promise((resolve) => {
        whois.lookup(domain, { follow: 0, timeout: timeoutMs }, (err: Error | null, data?: string) => {
            if (err || !data) {
                return resolve(undefined);
            }
            const txt = data.toLowerCase();
            const availableHits = AVAILABLE_PATTERNS.test(txt) ? 1 : 0;
            const registeredHits = REGISTERED_PATTERNS.test(txt) ? 1 : 0;
            if (registeredHits > availableHits && registeredHits > 0) {
                logger.info({ domain }, 'Domain is registered');
                return resolve(false);
            }
            return resolve(true);
        });
    });

    if ((await isWhoisAvailable) === false) {
        return false;
    }

    logger.info({ domain }, 'Checking domain status using API');
    const isAvailableAPI = await axios.get<{ status: string }>(`https://www.getmyna.me/api/domains/${domain}/status`);
    if (isAvailableAPI.status === 200) {
        logger.info({ domain, status: isAvailableAPI.data.status }, 'Domain status retrieved');
        return DOMAIN_AVAILABLE_STATUS_VALUES.has(isAvailableAPI.data.status as DomainStatus);
    }
}

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Usage: tsx scripts/populate-dictionary.ts <path-to-csv> [category] [locale]');
        console.error('Example: tsx scripts/populate-dictionary.ts data/words.csv');
        console.error('Example: tsx scripts/populate-dictionary.ts data/words.csv companies');
        console.error('Example: tsx scripts/populate-dictionary.ts data/words.csv companies en_US');
        process.exit(1);
    }

    const csvPath = args[0];
    const category = args[1] || 'common';
    const locale = args[2] || 'en_US';

    const absolutePath = path.resolve(csvPath);
    if (!fs.existsSync(absolutePath)) {
        console.error(`Error: CSV file not found: ${absolutePath}`);
        process.exit(1);
    }

    await populateDictionary(absolutePath, category, locale);
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
