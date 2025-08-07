import { NextRequest, NextResponse } from 'next/server';
import { Resolver } from 'dns/promises';

const resolver = new Resolver();

export async function GET(request: NextRequest): Promise<NextResponse> {
    const domain = request.nextUrl.searchParams.get('domain');
    if (!domain) {
        return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 });
    }

    try {
        const records: Record<string, string[]> = {};
        const aRecords = await resolver.resolve(domain, 'A').catch(() => []);
        if (aRecords.length) {
            records.A = aRecords.map(String);
        }
        const cnameRecords = await resolver.resolve(domain, 'CNAME').catch(() => []);
        if (cnameRecords.length) {
            records.CNAME = cnameRecords.map(String);
        }

        return NextResponse.json({
            result: {
                domain,
                records,
            },
        });
    } catch (error) {
        console.error('Error fetching DNS data:', error);
        return NextResponse.json({ error: 'Failed to fetch DNS data' }, { status: 500 });
    }
}

