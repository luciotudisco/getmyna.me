import { Resolver } from 'dns/promises';
import { NextResponse } from 'next/server';

import { DNSRecordType } from '@/models/dig';

const resolver = new Resolver();

export async function GET(
    request: Request,
    { params }: { params: Promise<Record<string, string | string[]>> },
): Promise<NextResponse> {
    try {
        const resolvedParams = await params;
        const domain = Array.isArray(resolvedParams?.name) ? resolvedParams?.name[0] : resolvedParams?.name;
        const recordTypeParam = new URL(request.url).searchParams.get('type')?.toUpperCase();
        if (!recordTypeParam || !Object.values(DNSRecordType).includes(recordTypeParam as DNSRecordType)) {
            return NextResponse.json({ error: `Invalid record type: ${recordTypeParam}` }, { status: 400 });
        }
        const recordType = recordTypeParam as DNSRecordType;
        const res = (await resolver.resolve(domain, recordType)) as unknown;
        let records: string[];
        switch (recordType) {
            case DNSRecordType.MX:
                records = (res as Array<{ priority: number; exchange: string }>).map(
                    (mx) => `${mx.priority} ${mx.exchange}`,
                );
                break;
            case DNSRecordType.TXT:
                records = (res as string[][]).map((group) => group.join(''));
                break;
            default:
                records = Array.isArray(res) ? (res as string[]).map(String) : [];
        }
        return NextResponse.json({ records: { [recordType]: records } });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch DNS data' }, { status: 502 });
    }
}
