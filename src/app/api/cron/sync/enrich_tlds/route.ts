import { NextResponse } from 'next/server';
import { storageService } from '@/services/storage';
import OpenAI from 'openai';

export const maxDuration = 300; // This function can run for a maximum of 5 minutes

export async function GET(): Promise<NextResponse> {
    try {
        console.log('Starting TLD enrichment ...');
        const openaiClient = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] });
        const tlds = await storageService.listTLDs();
        for (const tld of tlds) {
            if (!tld.name || tld.description !== null) {
                continue;
            }
            const response = await openaiClient.chat.completions.create({
                model: 'gpt-5',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert on internet domain name system and top-level domains (TLDs).`,
                    },
                    {
                        role: 'user',
                        content: `Classify the TLD "${tld.name}" and provide a concise description. Consider its purpose, registration requirements, and intended use case.`,
                    },
                ],
            });
            const description = response.choices[0].message.content;
            await storageService.updateTld(tld.name, { description: description ?? '' });
        }
        console.log('TLD enrichment completed');
        return NextResponse.json({ message: 'TLD enrichment completed successfully' });
    } catch (error) {
        console.error('Error during TLD enrichment:', error);
        return NextResponse.json({ error: 'Failed to enrichment TLDs' }, { status: 500 });
    }
}
