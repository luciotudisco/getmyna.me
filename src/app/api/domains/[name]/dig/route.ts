import { NextResponse } from 'next/server';
import { Resolver } from 'dns/promises';
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
        let records: string[] = [];
        const recordType = recordTypeParam as DNSRecordType;
        switch (recordType) {
            case DNSRecordType.A: {
                const res = await resolver.resolve4(domain);
                records = res.map(String);
                break;
            }
            case DNSRecordType.AAAA: {
                const res = await resolver.resolve6(domain);
                records = res.map(String);
                break;
            }
            case DNSRecordType.CNAME: {
                const res = await resolver.resolveCname(domain);
                records = res.map(String);
                break;
            }
            case DNSRecordType.NS: {
                const res = await resolver.resolveNs(domain);
                records = res.map(String);
                break;
            }
            case DNSRecordType.MX: {
                const res = await resolver.resolveMx(domain);
                records = res.map((mx) => `${mx.priority} ${mx.exchange}`);
                break;
            }
            case DNSRecordType.TXT: {
                const res = await resolver.resolveTxt(domain); // string[][]
                records = res.map((group) => group.join(''));
                break;
            }
            default: {
                const res = (await resolver.resolve(domain, recordType)) as unknown as string[];
                records = Array.isArray(res) ? res.map(String) : [];
            }
        }
        return NextResponse.json({ records: { [recordType]: records } });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch DNS data' }, { status: 502 });
    }
}
