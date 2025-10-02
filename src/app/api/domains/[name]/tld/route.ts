import { NextResponse } from 'next/server';

import { Domain } from '@/models/domain';
import { tldRepository } from '@/services/tld-repository';
import logger from '@/utils/logger';

export async function GET(_request: Request, ctx: { params: Promise<{ name: string }> }): Promise<NextResponse> {
    try {
        const { name: domain } = await ctx.params;
        if (!Domain.isValidDomain(domain)) {
            return NextResponse.json({ error: `The domain '${domain}' is not a valid domain` }, { status: 400 });
        }
        const tld = new Domain(domain).getTLD();
        const tldInfo = await tldRepository.getTLD(tld);
        if (!tldInfo) {
            return NextResponse.json({ error: `TLD not found for domain '${domain}'` }, { status: 404 });
        }
        return NextResponse.json({
            description: tldInfo?.description,
            punycodeName: tldInfo?.punycodeName,
            name: tld,
            type: tldInfo?.type,
            pricing: tldInfo?.pricing,
        });
    } catch (error) {
        logger.error({ error }, 'Error fetching TLD info');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
