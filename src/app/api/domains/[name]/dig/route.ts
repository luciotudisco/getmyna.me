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
                // Return empty records for failed types instead of failing the entire request
                return { type: recordType, records: [], error: 'Failed to resolve' };
            }
        });

        const results = await Promise.all(resolvePromises);

        // Build the response object
        const records: Partial<Record<DNSRecordType, string[]>> = {};
        const errors: Partial<Record<DNSRecordType, string>> = {};

        results.forEach(({ type, records: typeRecords, error }) => {
            if (error) {
                errors[type] = error;
                records[type] = [];
            } else {
                records[type] = typeRecords;
            }
        });

        const response: {
            records: Partial<Record<DNSRecordType, string[]>>;
            errors?: Partial<Record<DNSRecordType, string>>;
        } = { records };
        if (Object.keys(errors).length > 0) {
            response.errors = errors;
        }

        return NextResponse.json(response);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch DNS data' }, { status: 502 });
    }
}
