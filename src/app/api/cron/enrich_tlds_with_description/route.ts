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
        logger.info(`Found ${tlds.length} TLDs to enrich with description`);
        for (const tld of tlds) {
            if (!tld.name || tld.description !== null) {
                logger.info(`Skipping TLD ${tld.name} because it already has a description`);
                continue;
            }
            logger.info(`Enriching TLD ${tld.name} with description ...`);
            const response = await openaiClient.chat.completions.create({
                model: 'gpt-5',
                messages: [
                    {
                        role: 'system',
                        content:
                            `You are an expert on internet domain name system and ` +
                            `top-level domains (TLDs). Responses must be in plain text ` +
                            `without markdown formatting.`,
                    },
                    {
                        role: 'user',
                        content:
                            `Provide a concise description about the TLD ` +
                            `"${tld.name}" (max 2 sentences). Explain its purpose and ` +
                            `intended use case using plain text only without markdown.`,
                    },
                ],
            });
            const description = response.choices[0].message.content;
            await tldRepository.updateTLD(tld.name, { description: description ?? '' });
        }
        logger.info('TLD enrichment with description completed');
        return NextResponse.json({ message: 'TLD enrichment with description completed successfully' });
    } catch (error) {
        logger.error({ error }, 'Error during TLD enrichment with description');
        return NextResponse.json({ error: 'Failed to enrich TLDs with description' }, { status: 500 });
    }
}
