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

        const whoisDataByServer = await whoisDomain(domain, { follow: 2, timeout: WHOIS_TIMEOUT_MS });
        const whois = whoisDataByServer ? (Object.values(whoisDataByServer)[0] as Record<string, unknown>) : undefined;
        if (!whois) {
            return NextResponse.json({});
        }
        return NextResponse.json({
            creationDate: get(whois, 'Created Date'),
            expirationDate: get(whois, 'Expiry Date'),
            lastUpdatedDate: get(whois, 'Updated Date'),
            registrar: get(whois, 'Registrar'),
            registrarUrl: get(whois, 'Registrar URL'),
            registrantName: get(whois, 'Registrant Name') || get(whois, 'Registrant Organization'),
            nameServer: get(whois, 'Name Server'),
        });
    } catch (error) {
        logger.error({ error }, 'Error fetching whois data');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

const get = (whoisData: Record<string, unknown>, key: string): string | undefined => {
    const raw = whoisData[key];
    if (Array.isArray(raw)) return typeof raw[0] === 'string' && raw[0].trim() ? raw[0] : undefined;
    return typeof raw === 'string' && raw.trim() ? raw : undefined;
};
