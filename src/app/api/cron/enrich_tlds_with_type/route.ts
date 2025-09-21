import axios from 'axios';
import { NextResponse } from 'next/server';
import { HTMLElement, parse } from 'node-html-parser';

import { TLDType } from '@/models/tld';
import { tldRepository } from '@/services/tld-repository';

export const maxDuration = 300; // This function can run for a maximum of 5 minutes

const IANA_ROOT_URL = 'https://www.iana.org/domains/root/db';
const IANA_TLD_TYPE_MAPPING: Record<string, TLDType> = {
    'country-code': TLDType.COUNTRY_CODE,
    'generic-restricted': TLDType.GENERIC_RESTRICTED,
    generic: TLDType.GENERIC,
    infrastructure: TLDType.INFRASTRUCTURE,
    sponsored: TLDType.SPONSORED,
    test: TLDType.TEST,
};

/**
 * Enrich TLDs with their type.
 * This function fetches the TLDs from the database and enriches them with their type.
 * It then updates the TLDs in the database with the new type.
 */
export async function GET(): Promise<NextResponse> {
    try {
        console.warn('Starting TLD type enrichment ...');
        const response = await axios.get<string>(IANA_ROOT_URL);
        const root = parse(response.data);
        const tldTable = root.querySelector('#tld-table');
        const tldRows = tldTable?.querySelectorAll('tbody tr') ?? [];
        await Promise.all(tldRows.map(processRow));
        console.warn('TLD type enrichment completed');
        return NextResponse.json({ message: 'TLD type enrichment completed successfully' });
    } catch (error) {
        console.error('Error during TLD type enrichment:', error);
        return NextResponse.json({ error: 'Failed to enrich TLD types' }, { status: 500 });
    }
}

/**
 * Process a single TLD row from the IANA table.
 * @param row - The TLD row to process.
 * @returns A promise that resolves when the row is processed.
 */
async function processRow(row: HTMLElement): Promise<void> {
    const tldName = row.querySelector('td:nth-child(1)')?.text?.trim().toLowerCase().replace(/\./g, '');
    const typeText = row.querySelector('td:nth-child(2)')?.text?.trim().toLowerCase();

    if (!tldName || !typeText) {
        console.warn(`No TLD name or type found for ${row.text}`);
        return;
    }

    const tldType = IANA_TLD_TYPE_MAPPING[typeText as keyof typeof IANA_TLD_TYPE_MAPPING];
    if (!tldType) {
        console.warn(`The IANA TLD type ${typeText} for TLD ${tldName} is not supported`);
        return;
    }

    // Update the TLD in the database with the mapped enum value
    const tld = await tldRepository.getTLD(tldName);
    if (tld?.type === tldType) {
        console.warn(`${tldName} already has type ${tldType}. Skipping...`);
        return;
    }

    await tldRepository.updateTLD(tldName, { type: tldType });
    console.warn(`Updated ${tldName} with type ${tldType}`);
}
