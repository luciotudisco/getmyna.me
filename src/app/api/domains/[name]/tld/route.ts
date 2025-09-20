import { NextResponse } from 'next/server';

import { tldRepository } from '@/services/tld-repository';

export async function GET(
    _request: Request,
    { params }: { params: Promise<Record<string, string | string[]>> },
): Promise<NextResponse> {
    try {
        const resolvedParams = await params;
        const domain = Array.isArray(resolvedParams?.name) ? resolvedParams?.name[0] : resolvedParams?.name;
        
        // Validate domain input
        if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
            return NextResponse.json({ error: 'Domain parameter is required and must be a non-empty string' }, { status: 400 });
        }
        
        const domainParts = domain.split('.');
        if (domainParts.length < 2) {
            return NextResponse.json({ error: `The provided domain '${domain}' is not valid - must contain at least one dot` }, { status: 400 });
        }
        
        const tld = domainParts[domainParts.length - 1];
        if (!tld || tld.trim().length === 0) {
            return NextResponse.json({ error: `The provided domain '${domain}' does not have a valid TLD` }, { status: 400 });
        }
        
        const tldInfo = await tldRepository.getTLD(tld);
        return NextResponse.json({
            description: tldInfo?.description ?? '',
            punycodeName: tldInfo?.punycodeName ?? '',
            name: tld,
            type: tldInfo?.type,
            pricing: tldInfo?.pricing,
        });
    } catch (error) {
        console.error('Error fetching TLD info:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
