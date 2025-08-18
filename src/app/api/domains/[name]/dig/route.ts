import { NextResponse } from 'next/server';
import { Resolver } from 'dns/promises';
import { DNSRecordType } from '@/models/dig';

const resolver = new Resolver();

export async function GET(request: Request, { params }: { params: { name: string } }): Promise<NextResponse> {
    const { name: domain } = params;
    const recordTypeParam = new URL(request.url).searchParams.get('type')?.toUpperCase();

    if (!recordTypeParam) {
        return NextResponse.json({ error: 'Missing type parameter' }, { status: 400 });
    }

    const recordType = recordTypeParam as DNSRecordType;

    if (!Object.values(DNSRecordType).includes(recordType)) {
        return NextResponse.json({ error: 'Unsupported record type' }, { status: 400 });
    }

    const recordTypes: DNSRecordType[] = [recordType];

    try {
        const records: Partial<Record<DNSRecordType, string[]>> = {};

        for (const type of recordTypes) {
            const result = await resolver.resolve(domain, type as any).catch(() => []);
            if (!result.length) {
                continue;
            }

            if (type === DNSRecordType.MX) {
                // Format as "priority exchange"
                records[DNSRecordType.MX] = (result as { priority: number; exchange: string }[]).map(
                    (mx) => `${mx.priority} ${mx.exchange}`,
                );
            } else {
                records[type] = (result as string[]).map(String);
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
