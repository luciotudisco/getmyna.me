import { NextResponse } from 'next/server';

import { DomainHacksGenerator } from '@/services/domain-hacks';
import { tldRepository } from '@/services/tld-repository';

export async function GET(request: Request): Promise<NextResponse> {
    const url = new URL(request.url);
    const includeSubdomains = url.searchParams.get('include_subdomains') === 'true';
    const tlds = await tldRepository.listTLDs();
    const domainHacksGenerator = new DomainHacksGenerator(tlds);
    const domainHacks = domainHacksGenerator.getDomainsHacks(url.searchParams.get('term') || '', includeSubdomains);
    return NextResponse.json({ domainHacks });
}
