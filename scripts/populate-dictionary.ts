#!/usr/bin/env node
import { algoliasearch } from 'algoliasearch';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

import { Domain } from '../src/models/domain';
import { DomainHacksGenerator } from '../src/services/domain-hacks';
import { tldRepository } from '../src/services/tld-repository';
import logger from '../src/utils/logger';

const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!;
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY!;

interface CSVRow {
    word: string;
}

/**
 * Parses a CSV file and returns an array of rows.
 * @param filePath - Path to the CSV file
 * @returns Promise resolving to an array of CSV rows
 */
async function parseCSV(filePath: string): Promise<CSVRow[]> {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, { columns: true, skip_empty_lines: true, trim: true });
    return records.map((record) => ({ word: (record as Record<string, string>).word })) as CSVRow[];
}

/**
 * Populates the Algolia dictionary domain hacks from words in a CSV file.
 * @param csvPath - Path to the CSV file
 */
async function populateDictionary(csvPath: string): Promise<void> {
    logger.info({ csvPath }, 'Starting dictionary population');
    const rows = await parseCSV(csvPath);
    logger.info({ count: rows.length }, 'Parsed CSV rows');

    const tlds = await tldRepository.list();
    const domainHacks = new DomainHacksGenerator(tlds);
    const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);

    logger.info('Starting Algolia indexing...');
    let indexedCount = 0;
    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        const domainNames = domainHacks.getDomainsHacks(row.word, false);
        for (const domainName of domainNames) {
            logger.info({ domainName }, 'Processing domain name');
            const domain = new Domain(domainName);
            const entry = {
                objectID: domain.getName(),
                domain: domain.getName(),
                tld: domain.getTLD(),
                word: row.word,
                category: 'common',
                locale: 'en_US',
                rank: indexedCount + 1,
            };
            await algoliaClient.saveObject({ indexName: ALGOLIA_INDEX_NAME, body: entry });
            indexedCount++;
        }
    }
    logger.info('Dictionary population and Algolia indexing completed');
}

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Usage: tsx scripts/populate-dictionary.ts <path-to-csv>');
        console.error('Example: tsx scripts/populate-dictionary.ts data/words.csv');
        process.exit(1);
    }
    const csvPath = args[0];
    const absolutePath = path.resolve(csvPath);
    if (!fs.existsSync(absolutePath)) {
        console.error(`Error: CSV file not found: ${absolutePath}`);
        process.exit(1);
    }
    await populateDictionary(absolutePath);
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
