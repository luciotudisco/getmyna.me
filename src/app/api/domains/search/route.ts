import { NextResponse } from 'next/server';
import { getDomainsHacks } from '@/services/domains';

export async function GET(request: Request): Promise<NextResponse> {
    const url = new URL(request.url);
    const domains = await getDomainsHacks(url.searchParams.get('term') || '');
    return NextResponse.json({ domains });
}
