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

        // Always resolve A, AAAA, and MX record types
        const recordTypes = [DNSRecordType.A, DNSRecordType.AAAA, DNSRecordType.MX];

        // Resolve all record types simultaneously
        const resolvePromises = recordTypes.map(async (recordType) => {
            try {
                const res = (await resolver.resolve(domain, recordType)) as unknown;
                let records: string[];
                switch (recordType) {
                    case DNSRecordType.MX:
                        records = (res as Array<{ priority: number; exchange: string }>).map(
                            (mx) => `${mx.priority} ${mx.exchange}`,
                        );
                        break;
                    default:
                        records = Array.isArray(res) ? (res as string[]).map(String) : [];
                }
                return { type: recordType, records };
            } catch {
                // Ignore failed types and return null
                return null;
            }
        });

        const results = await Promise.all(resolvePromises);

        // Build the response object with only successful records
        const records: Partial<Record<DNSRecordType, string[]>> = {};

        results.forEach((result) => {
            if (result) {
                records[result.type] = result.records;
            }
        });

        return NextResponse.json({ records });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch DNS data' }, { status: 502 });
    }
}
