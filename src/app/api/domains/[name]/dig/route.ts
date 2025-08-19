import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Resolver } from 'dns/promises';
import { DNSRecordType } from '@/models/dig';

const resolver = new Resolver();

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
    const domain = params.name;
    const recordTypeParam = request.nextUrl.searchParams.get('type')?.toUpperCase();

    if (!recordTypeParam) {
        return NextResponse.json({ error: 'Missing type parameter' }, { status: 400 });
    }

    const recordType = recordTypeParam as DNSRecordType;

    if (!Object.values(DNSRecordType).includes(recordType)) {
        return NextResponse.json({ error: 'Unsupported record type' }, { status: 400 });
    }

    try {
        const records: Partial<Record<DNSRecordType, string[]>> = {};

        const result = await resolver.resolve(domain, recordType).catch(() => []);
        if (Array.isArray(result) && result.length) {
            if (recordType === DNSRecordType.MX) {
                // Format as "priority exchange"
                records.MX = (result as { priority: number; exchange: string }[]).map(
                    (mx) => `${mx.priority} ${mx.exchange}`,
                );
            } else {
                records[recordType] = (result as string[]).map(String);
            }
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
