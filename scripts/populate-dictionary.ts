#!/usr/bin/env node

import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

import { DictionaryEntry } from '../src/models/dictionary';
import { dictionaryRepository } from '../src/services/dictionary-repository';
import { DomainHacksGenerator } from '../src/services/domain-hacks';
import { tldRepository } from '../src/services/tld-repository';
import logger from '../src/utils/logger';

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
 * Populates the dictionary table from a CSV file.
 * @param csvPath - Path to the CSV file
 */
async function populateDictionary(csvPath: string): Promise<void> {
    logger.info({ csvPath }, 'Starting dictionary population');
    const rows = await parseCSV(csvPath);
    logger.info({ count: rows.length }, 'Parsed CSV rows');
    const tlds = await tldRepository.list();
    const domainHacks = new DomainHacksGenerator(tlds);
    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        const domains = domainHacks.getDomainsHacks(row.word, false);
        const matchingDomains = domains.length > 0 ? domains.map((domain) => ({ domain })) : undefined;
        const entry: DictionaryEntry = {
            word: row.word,
            rank: index + 1,
            matchingDomains,
        };
        await dictionaryRepository.create(entry);
        logger.info({ word: row.word, matchingDomains: matchingDomains?.length }, 'Created dictionary entry');
    }
    logger.info('Dictionary population completed');
}

/**
 * Main execution function
 */
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

// Run the script
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
