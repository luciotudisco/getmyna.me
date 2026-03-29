import { NextResponse } from 'next/server';
import { whoisDomain } from 'whoiser';

import { Domain } from '@/models/domain';
import logger from '@/utils/logger';

const WHOIS_TIMEOUT_MS = 15_000;

export async function GET(_request: Request, ctx: { params: Promise<{ name: string }> }): Promise<NextResponse> {
    try {
        const { name: domain } = await ctx.params;
        if (!Domain.isValidDomain(domain)) {
            return NextResponse.json({ error: `The domain '${domain}' is not a valid domain` }, { status: 400 });
        }

        const byServer = await whoisDomain(domain, { follow: 2, timeout: WHOIS_TIMEOUT_MS });
        const whoisData = byServer ? (Object.values(byServer)[0] as Record<string, unknown>) : undefined;
        if (!whoisData) {
            return NextResponse.json({});
        }
        console.log(whoisData);

        return NextResponse.json({
            creationDate: readWhoisValue(whoisData, 'Created Date'),
            expirationDate: readWhoisValue(whoisData, 'Expiry Date'),
            lastUpdatedDate: readWhoisValue(whoisData, 'Updated Date'),
            registrar: readWhoisValue(whoisData, 'Registrar'),
            registrarUrl: readWhoisValue(whoisData, 'Registrar URL'),
            registrantName:
                readWhoisValue(whoisData, 'Registrant Name') || readWhoisValue(whoisData, 'Registrant Organization'),
            nameServer: readWhoisValue(whoisData, 'Name Server'),
        });
    } catch (error) {
        logger.error({ error }, 'Error fetching whois data');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

const readWhoisValue = (data: Record<string, unknown>, key: string): string | undefined => {
    const raw = data[key];
    if (Array.isArray(raw)) return typeof raw[0] === 'string' && raw[0].trim() ? raw[0] : undefined;
    return typeof raw === 'string' && raw.trim() ? raw : undefined;
};
