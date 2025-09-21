import { Resolver } from 'dns/promises';
import { NextResponse } from 'next/server';

import { DNSRecordType } from '@/models/dig';
import logger from '@/utils/logger';

const resolver = new Resolver();
const RECORD_TYPES = [DNSRecordType.A, DNSRecordType.AAAA, DNSRecordType.MX];

export async function GET(
    request: Request,
    { params }: { params: Promise<Record<string, string | string[]>> },
): Promise<NextResponse> {
    try {
        const resolvedParams = await params;
        const domain = Array.isArray(resolvedParams?.name) ? resolvedParams?.name[0] : resolvedParams?.name;
        const resolvePromises = RECORD_TYPES.map(async (recordType) => {
            try {
                const resolvedRecords = (await resolver.resolve(domain, recordType)) as unknown;
                let records: string[];
                switch (recordType) {
                    case DNSRecordType.MX:
                        const exchangeRecords = resolvedRecords as Array<{ priority: number; exchange: string }>;
                        exchangeRecords.sort((a, b) => a.priority - b.priority);
                        records = [...new Set(exchangeRecords.map((mx) => mx.exchange))];
                        break;
                    default:
                        records = Array.isArray(resolvedRecords) ? [...new Set(resolvedRecords as string[])] : [];
                }
                return { type: recordType, records };
            } catch (error) {
                logger.error({ error }, `Ignoring ${recordType} for ${domain}`);
                return null;
            }
        });

        const results = await Promise.all(resolvePromises);
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
