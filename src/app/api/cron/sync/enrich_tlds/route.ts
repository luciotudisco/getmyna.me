import { NextResponse } from 'next/server';
import { storageService } from '@/services/storage';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const maxDuration = 300; // This function can run for a maximum of 5 minutes

export async function GET(): Promise<NextResponse> {
    try {
        console.log('Starting TLD enrichment ...');
        const tlds = await storageService.listTLDs();
        for (const tld of tlds) {
            if (tld.name && tld.description === null) {
                const response = await client.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'user',
                            content: `Provide a concise max 2 sentences description of the TLD ${tld.name}?`,
                        },
                    ],
                });
                const description = response.choices[0].message.content;
                await storageService.updateTld(tld.name, { description: description ?? '' });
            }
        }
        console.log('TLD enrichment completed');
        return NextResponse.json({ message: 'TLD enrichment completed successfully' });
    } catch (error) {
        console.error('Error during TLD enrichment:', error);
        return NextResponse.json({ error: 'Failed to enrichment TLDs' }, { status: 500 });
    }
}
