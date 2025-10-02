import axios from 'axios';
import { NextResponse } from 'next/server';

import { Domain } from '@/models/domain';
import logger from '@/utils/logger';

const WHOIS_URL = 'https://whois-api6.p.rapidapi.com/whois/api/v1/getData';
const RAPID_API_KEY = process.env.RAPID_API_KEY!;

/**
 * The result of the external WHOIS API call.
 */
interface WhoisResult {
    creation_date?: string | string[];
    expiration_date?: string | string[];
    last_updated?: string | string[];
    registrant_name?: string | string[];
    registrar_url?: string;
    registrar?: string;
    updated_date?: string | string[];
}

export async function GET(_request: Request, ctx: { params: Promise<{ name: string }> }): Promise<NextResponse> {
    try {
        const { name: domain } = await ctx.params;
        if (!Domain.isValidDomain(domain)) {
            return NextResponse.json({ error: `The domain '${domain}' is not a valid domain` }, { status: 400 });
        }
        const config = { headers: { 'x-rapidapi-key': RAPID_API_KEY } };
        const response = await axios.post(WHOIS_URL, { query: domain }, config);
        const result = (response.data.result || {}) as WhoisResult;
        return NextResponse.json({
            creationDate: _extract(result?.creation_date),
            expirationDate: _extract(result?.expiration_date),
            lastUpdatedDate: _extract(result?.updated_date),
            registrar: _extract(result?.registrar),
            registrarUrl: _extract(result?.registrar_url),
            registrantName: _extract(result?.registrant_name),
        });
    } catch (error) {
        logger.error({ error }, 'Error fetching whois data');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * Extracts the first value from an array of strings or returns the value if it is a string.
 */
const _extract = (value: string | string[] | undefined | null): string | undefined | null => {
    if (!value) {
        return value;
    }
    return Array.isArray(value) ? value[0] : value;
};
