import { NextResponse } from 'next/server';

import { DomainHacksGenerator } from '@/services/domain-hacks';
import { tldRepository } from '@/services/tld-repository';
import logger from '@/utils/logger';

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const url = new URL(request.url);
        const includeSubdomains = url.searchParams.get('include_subdomains') === 'true';
        const tlds = await tldRepository.listTLDs();
        const domainHacksGenerator = new DomainHacksGenerator(tlds);
        const domainHacks = domainHacksGenerator.getDomainsHacks(url.searchParams.get('term') || '', includeSubdomains);
        return NextResponse.json({ domainHacks });
    } catch (error) {
        logger.error({ error }, 'Error searching for domain hacks');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
