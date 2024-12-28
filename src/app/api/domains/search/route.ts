import { NextRequest, NextResponse } from 'next/server';
import { getDomainsHacks } from '@/services/domains';

export async function GET(request: NextRequest): Promise<NextResponse> {
    const domains = getDomainsHacks(request.nextUrl.searchParams.get('term') || '');
    return NextResponse.json({ domains });
}
