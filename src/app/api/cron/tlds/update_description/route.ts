import axios from 'axios';
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { tldRepository } from '@/services/tld-repository';
import logger from '@/utils/logger';

export const maxDuration = 300; // This function can run for a maximum of 5 minutes

/**
 * Enrich TLDs with their description.
 * This function fetches the TLDs from the database and enriches them with their description.
 * It then updates the TLDs in the database with the new description.
 */
export async function GET(): Promise<NextResponse> {
    try {
        logger.info('Starting TLD enrichment with description ...');
        const openaiClient = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] });
        const tlds = await tldRepository.listTLDs();
        for (const tld of tlds) {
            if (!tld.punycodeName || !tld.name) {
                logger.warn(`Skipping TLD ${tld.name} because it has no punycodeName or name`);
                continue;
            }
            if (tld.description !== null && tld.type !== null) {
                logger.info(`Skipping TLD ${tld.name} because it already has a description and type`);
                continue;
            }
            logger.info(`Enriching TLD ${tld.name} with description and type ...`);
            const icannWikiResponse = await axios.get(`https://icannwiki.org/.${tld.name}`);
            const ianaWikiResponse = await axios.get(`https://www.iana.org/domains/root/db/${tld.punycodeName}.html`);
            const icannWikiHTML = cheerio.load(icannWikiResponse.data);
            const ianaWikiHTML = cheerio.load(ianaWikiResponse.data);
            const response = await openaiClient.chat.completions.create({
                model: 'gpt-4o-mini',
                response_format: { type: 'json_schema', json_schema: TLD_SCHEMA },
                messages: [
                    {
                        role: 'system',
                        content: [
                            'You are an expert on internet domain names system and top-level domains (TLDs).',
                            'You will be given the HTML of the ICANN / IANA wiki pages about a specific TLD.',
                            'You will need to extract information about the TLD from the HTML according to the schema provided.',
                        ].join('\n'),
                    },
                    {
                        role: 'user',
                        content: [
                            `The ICANN wiki page for the TLD "${tld.name}": ${icannWikiHTML.text()}`,
                            `The IANA wiki page for the TLD "${tld.name}": ${ianaWikiHTML.text()}`,
                        ].join('\n'),
                    },
                    {
                        role: 'user',
                        content: `Generate structured metadata for the TLD "${tld.name}" in the following JSON format: ${JSON.stringify(TLD_SCHEMA)}`,
                    },
                ],
            });

            // Update TLD with structured data
            const responseContent = response.choices[0].message.content;
            const tldData = JSON.parse(responseContent || '{}');
            await tldRepository.updateTLD(tld.punycodeName, { description: tldData.description, type: tldData.type });
        }
        logger.info('TLD enrichment with description completed');
        return NextResponse.json({ message: 'TLD enrichment with description completed successfully' });
    } catch (error) {
        logger.error({ error }, 'Error during TLD enrichment with description');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

const TLD_SCHEMA = {
    name: 'tld_schema',
    strict: true,
    schema: {
        type: 'object',
        properties: {
            description: {
                type: 'string',
                minLength: 20,
                maxLength: 500,
                description: [
                    'One or two sentences describing the TLD, non-technical.',
                    'Briefly note the TLD origin, history and its intended use.',
                    'If it is a brand TLD, note the sponsoring organization.',
                    'Highlight if registrations are restricted and any other interesting facts.',
                    'Spell out acronyms and abbreviations at first mention.',
                ].join(' '),
            },
            type: {
                type: 'string',
                enum: ['GENERIC', 'COUNTRY_CODE', 'GENERIC_RESTRICTED', 'INFRASTRUCTURE', 'SPONSORED', 'TEST'],
                description: 'The TLD category according to IANA.',
            },
        },
        required: ['description', 'type'],
        additionalProperties: false,
    },
};
