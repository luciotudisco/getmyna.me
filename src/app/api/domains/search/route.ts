import { NextResponse } from 'next/server';

import { domainsService } from '@/services/domains';

export async function GET(request: Request): Promise<NextResponse> {
    const url = new URL(request.url);
    const includeSubdomains = url.searchParams.get('include_subdomains') === 'true';
    const domains = await domainsService.getDomainsHacks(url.searchParams.get('term') || '', includeSubdomains);
    return NextResponse.json({ domains });
}
