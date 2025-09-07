import { NextResponse } from 'next/server';
import { storageService } from '@/services/storage';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] });

export const maxDuration = 300; // This function can run for a maximum of 5 minutes

export async function GET(): Promise<NextResponse> {
    try {
        console.log('Starting TLD enrichment ...');

        const tlds = await storageService.listTLDs();
        for (const tld of tlds) {
            if (!tld.name || tld.description !== null) {
                continue;
            }

            const response = await client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert on internet domain name system and top-level domains (TLDs). Classify TLDs into these categories:
                            - INFRASTRUCTURE: Technical network infrastructure (.arpa)
                            - GENERIC: Open registration domains (.com, .net, .org, .app, .dev)
                            - GENERIC_RESTRICTED: Generic domains with registration restrictions (.biz, .name, .pro)
                            - SPONSORED: Community-specific domains run by sponsors (.edu, .gov, .mil, .museum)
                            - COUNTRY_CODE: Two-letter country codes (.us, .uk, .de, .jp)
                            - TEST: Reserved domains for testing (.test, .localhost, .invalid, .example)`,
                    },
                    {
                        role: 'user',
                        content: `Classify the TLD "${tld.name}" and provide a concise description. Consider its purpose, registration requirements, and intended use case.`,
                    },
                ],
                response_format: {
                    type: 'json_schema',
                    json_schema: {
                        name: 'tld_info',
                        schema: {
                            type: 'object',
                            properties: {
                                type: {
                                    type: 'string',
                                    enum: [
                                        'INFRASTRUCTURE',
                                        'GENERIC',
                                        'GENERIC_RESTRICTED',
                                        'SPONSORED',
                                        'COUNTRY_CODE',
                                        'TEST',
                                    ],
                                    description: 'The category/type of this TLD according to the TLDType enum',
                                },
                                description: {
                                    type: 'string',
                                    description: 'A concise 1-2 sentence description of the TLD',
                                },
                            },
                            required: ['type', 'description'],
                            additionalProperties: false,
                        },
                    },
                },
            });
            const content = response.choices[0].message.content;
            if (!content) {
                continue;
            }
            const tldInfo = JSON.parse(content);
            await storageService.updateTld(tld.name, {
                type: tldInfo.type,
                description: tldInfo.description,
            });
        }

        console.log('TLD enrichment completed');
        return NextResponse.json({ message: 'TLD enrichment completed successfully' });
    } catch (error) {
        console.error('Error during TLD enrichment:', error);
        return NextResponse.json({ error: 'Failed to enrichment TLDs' }, { status: 500 });
    }
}
