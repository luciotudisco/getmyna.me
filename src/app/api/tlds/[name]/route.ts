import { NextResponse } from 'next/server';

import { tldRepository } from '@/services/tld-repository';
import logger from '@/utils/logger';

export async function GET(_request: Request, ctx: { params: Promise<{ name: string }> }): Promise<NextResponse> {
    try {
        let { name } = await ctx.params;
        if (!name) {
            return NextResponse.json({ error: 'TLD name is required' }, { status: 400 });
        }
        name = name.startsWith('.') ? name.slice(1) : name;
        const tld = await tldRepository.getTLD(name);
        if (!tld) {
            return NextResponse.json({ error: 'TLD not found' }, { status: 404 });
        }
        return NextResponse.json({ tld });
    } catch (error) {
        logger.error({ error }, 'Error fetching TLD by name');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
