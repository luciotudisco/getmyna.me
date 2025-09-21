import { NextResponse } from 'next/server';

import { DomainHackGenerator } from '@/services/domain-hack-generator';
import { tldRepository } from '@/services/tld-repository';

export async function GET(request: Request): Promise<NextResponse> {
    const url = new URL(request.url);
    const includeSubdomains = url.searchParams.get('include_subdomains') === 'true';
    const tlds = await tldRepository.listTLDs();
    const domainHackGenerator = new DomainHackGenerator(tlds);
    const domains = domainHackGenerator.getDomainsHacks(url.searchParams.get('term') || '', includeSubdomains);
    return NextResponse.json({ domains });
}
