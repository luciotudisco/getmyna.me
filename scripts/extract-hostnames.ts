#!/usr/bin/env node
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';

/**
 * Extracts the hostname from a domain string.
 * Handles cases with protocols (http://, https://) and paths.
 */
function extractHostname(domain: string): string {
    // Remove quotes if present
    const cleaned = domain.trim().replace(/^"|"$/g, '');

    let hostname: string;
    try {
        // Try to parse as URL (handles http://, https://, etc.)
        const url = new URL(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
        hostname = url.hostname;
    } catch {
        // If URL parsing fails, assume it's already a hostname
        // Remove any path or query string
        hostname = cleaned.split('/')[0].split('?')[0].split('#')[0].trim();
    }

    // Remove TLD by splitting on '.' and removing the last segment
    const parts = hostname.split('.');
    if (parts.length > 1) {
        // Remove the last part (TLD)
        parts.pop();
        return parts.join('.');
    }

    // If no dots found, return as is
    return hostname;
}

/**
 * Reads domains from CSV and extracts hostnames.
 */
function extractHostnamesFromCSV(inputPath: string, outputPath: string): void {
    console.log(`Reading CSV file: ${inputPath}`);
    const fileContent = fs.readFileSync(inputPath, 'utf-8');
    const records = parse(fileContent, { columns: true, skip_empty_lines: true, trim: true });

    console.log(`Found ${records.length} records`);

    // Extract hostnames from the Domain column
    const hostnames = records
        .map((record) => {
            const rec = record as Record<string, string>;
            const domain = rec.Domain || rec.domain || '';
            if (!domain) {
                return null;
            }
            return extractHostname(domain);
        })
        .filter((hostname: string | null): hostname is string => hostname !== null && hostname.length > 0);

    // Remove duplicates while preserving order
    const uniqueHostnames = Array.from(new Set(hostnames));

    console.log(`Extracted ${uniqueHostnames.length} unique hostnames`);

    // Convert to CSV format with a single column
    const csvLines = ['hostname', ...uniqueHostnames.map((hostname) => `"${hostname}"`)];
    const csvOutput = csvLines.join('\n');

    // Write to output file
    fs.writeFileSync(outputPath, csvOutput, 'utf-8');
    console.log(`Hostnames written to: ${outputPath}`);
}

function main(): void {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Usage: tsx scripts/extract-hostnames.ts <input-csv> [output-csv]');
        console.error('Example: tsx scripts/extract-hostnames.ts scripts/data/domains.csv');
        console.error(
            'Example: tsx scripts/extract-hostnames.ts scripts/data/domains.csv scripts/data/domains-hostnames.csv',
        );
        process.exit(1);
    }

    const inputPath = args[0];
    const outputPath =
        args[1] || path.join(path.dirname(inputPath), `${path.basename(inputPath, '.csv')}-hostnames.csv`);

    const absoluteInputPath = path.resolve(inputPath);
    if (!fs.existsSync(absoluteInputPath)) {
        console.error(`Error: CSV file not found: ${absoluteInputPath}`);
        process.exit(1);
    }

    const absoluteOutputPath = path.resolve(outputPath);
    extractHostnamesFromCSV(absoluteInputPath, absoluteOutputPath);
}

main();
