import { NextRequest, NextResponse } from 'next/server';
import { getDomains } from '@/services/domains';

export async function GET(request: NextRequest): Promise<NextResponse> {
    const domains = getDomains(request.nextUrl.searchParams.get('term') || '');
    return NextResponse.json({ domains });
}
