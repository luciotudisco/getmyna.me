import { NextResponse } from 'next/server';

import { DomainsService } from '@/services/domains';
import { tldRepository } from '@/services/tld-repository';

export async function GET(request: Request): Promise<NextResponse> {
    const url = new URL(request.url);
    const includeSubdomains = url.searchParams.get('include_subdomains') === 'true';

    // Fetch TLDs and create the service
    const tlds = await tldRepository.listTLDs();
    const domainsService = new DomainsService(tlds);

    const domains = domainsService.getDomainsHacks(url.searchParams.get('term') || '', includeSubdomains);
    return NextResponse.json({ domains });
}
