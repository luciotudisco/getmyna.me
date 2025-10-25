import axios, { isAxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { tldRepository } from '@/services/tld-repository';
import logger from '@/utils/logger';

export const maxDuration = 300; // This function can run for a maximum of 5 minutes

/**
 * Enrich TLDs with a description.
 * This function fetches the TLDs from the database and enriches them with a description.
 */
export async function GET(): Promise<NextResponse> {
    try {
        logger.info('Starting TLD enrichment with description ...');
        const openaiClient = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] });
        const tlds = await tldRepository.list();
        for (const tld of tlds.reverse()) {
            if (!tld.punycodeName || !tld.name) {
                logger.warn(`Skipping TLD ${tld.name} because it has no punycodeName or name`);
                continue;
            }

            if (tld.description !== null && tld.yearEstablished !== null && tld.tagline !== null) {
                logger.info(`Skipping TLD ${tld.name} because it is already enriched`);
                continue;
            }

            let icannWiki = '';
            let ianaWiki = '';

            try {
                const icannResponse = await axios.get(`https://icannwiki.org/.${tld.name}`);
                icannWiki = cheerio.load(icannResponse.data).text();
            } catch (error) {
                if (isAxiosError(error) && error.response?.status === 404) {
                    logger.warn(`ICANN wiki page not found for TLD ${tld.name}.`);
                } else {
                    throw error;
                }
            }

            try {
                const ianaResponse = await axios.get(`https://www.iana.org/domains/root/db/${tld.punycodeName}.html`);
                ianaWiki = cheerio.load(ianaResponse.data).text();
            } catch (error) {
                if (isAxiosError(error) && error.response?.status === 404) {
                    logger.warn(`IANA wiki page not found for TLD ${tld.name}.`);
                } else {
                    throw error;
                }
            }

            const response = await openaiClient.chat.completions.create({
                model: 'gpt-4o-mini',
                response_format: { type: 'json_schema', json_schema: TLD_SCHEMA },
                messages: [
                    {
                        role: 'system',
                        content: [
                            'You are an expert on internet domain names system and top-level domains (TLDs).',
                            'You will be given the HTML of the ICANN and IANA wiki pages about a specific TLD.',
                            'You will need to extract information about the TLD from the HTML according to the schema provided.',
                        ].join('\n'),
                    },
                    {
                        role: 'user',
                        content: [
                            `The ICANN wiki page for the TLD "${tld.name}": ${icannWiki}`,
                            `The IANA wiki page for the TLD "${tld.name}": ${ianaWiki}`,
                        ].join('\n\n'),
                    },
                    {
                        role: 'user',
                        content: `Generate structured metadata in the following JSON format: ${JSON.stringify(TLD_SCHEMA)}`,
                    },
                ],
            });

            // Update TLD with structured data
            const responseContent = response.choices[0].message.content;
            const tldData = JSON.parse(responseContent || '{}');
            logger.info(`Enriching TLD ${tld.name} with description ...`);
            await tldRepository.update(tld.punycodeName, {
                countryCode: tldData.countryCode,
                description: tldData.description,
                tagline: tldData.tagline,
                yearEstablished: tldData.year_established,
            });
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
            countryCode: {
                type: 'string',
                description: [
                    'The ISO 3166-1 alpha-2 code for the country the TLD is associated with.',
                    'Populate only if the TLD is a country code TLD. Leave blank otherwise.',
                    'Examples: "US" for .com, "GB" for .uk, "DE" for .de, etc.',
                ].join(' '),
            },
            description: {
                type: 'string',
                description: [
                    'One or two sentences describing the TLD. ',
                    'The description should be non-technical and easy to understand.',
                    'The description should include a brief history of the TLD, its intended use and any other interesting facts.',
                    'If it is a brand TLD, note the sponsoring organization.',
                    'Highlight if registrations are restricted.',
                    'Spell out acronyms and abbreviations at first mention.',
                ].join(' '),
            },
            tagline: {
                type: 'string',
                description: [
                    'A one-sentence tagline for the TLD.',
                    'Examples: "The tech world\'s favorite island domain turned digital innovation hub".',
                    'The tagline should be a single sentence that captures the essence of the TLD and is no more than 100 characters.',
                ].join(' '),
            },
            year_established: {
                type: 'integer',
                minimum: 1985,
                maximum: new Date().getFullYear(),
                description: 'The year the TLD was established.',
            },
        },
        required: ['countryCode', 'description', 'tagline', 'year_established'],
        additionalProperties: false,
    },
};
