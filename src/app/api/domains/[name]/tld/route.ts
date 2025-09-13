import { NextResponse } from 'next/server';
import { storageService } from '@/services/storage';

export async function GET(
    _request: Request,
    { params }: { params: Promise<Record<string, string | string[]>> },
): Promise<NextResponse> {
    try {
        const resolvedParams = await params;
        const domain = Array.isArray(resolvedParams?.name) ? resolvedParams?.name[0] : resolvedParams?.name;
        const tld = domain.split('.').pop();
        if (tld === undefined) {
            return NextResponse.json({ error: `The provided domain '${domain}' is not valid` }, { status: 400 });
        }
        const tldInfo = await storageService.getTLD(tld);
        return NextResponse.json({
            description: tldInfo?.description ?? '',
            name: tld,
            type: tldInfo?.type,
            pricing: tldInfo?.pricing,
        });
    } catch (error) {
        console.error('Error fetching TLD info:', error);
        return NextResponse.json({});
    }
}
