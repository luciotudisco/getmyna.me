import axios from 'axios';
import { NextResponse } from 'next/server';

import { Domain } from '@/models/domain';
import logger from '@/utils/logger';

const WHOIS_URL = 'https://whois-api6.p.rapidapi.com/whois/api/v1/getData';
const RAPID_API_KEY = process.env.RAPID_API_KEY!;

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
            return NextResponse.json({ error: `The provided domain '${domain}' is not valid` }, { status: 400 });
        }
        const config = { headers: { 'x-rapidapi-key': RAPID_API_KEY } };
        const response = await axios.post(WHOIS_URL, { query: domain }, config);
        const result = (response.data as { result?: WhoisResult }).result;
        const creationRaw = result?.creation_date;
        const expirationRaw = result?.expiration_date;
        const updatedRaw = result?.updated_date;
        const registrar = result?.registrar ?? null;
        const registrarUrl = result?.registrar_url ?? null;
        const creationDate = Array.isArray(creationRaw) ? creationRaw[0] : (creationRaw ?? null);
        const expirationDate = Array.isArray(expirationRaw) ? expirationRaw[0] : (expirationRaw ?? null);
        const lastUpdatedDate = Array.isArray(updatedRaw) ? updatedRaw[0] : (updatedRaw ?? null);
        const registrantName = result?.registrant_name ?? null;
        return NextResponse.json({
            creationDate,
            expirationDate,
            lastUpdatedDate,
            registrar,
            registrarUrl,
            registrantName,
        });
    } catch (error) {
        logger.error({ error }, 'Error fetching whois data');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
