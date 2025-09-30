import axios from 'axios';
import { NextResponse } from 'next/server';

import { Domain, DomainStatus } from '@/models/domain';
import logger from '@/utils/logger';

const DOMAINR_BASE_URL = 'https://domainr.p.rapidapi.com/v2/status';
const RAPID_API_KEY = process.env.RAPID_API_KEY!;

export async function GET(_request: Request, ctx: { params: Promise<{ name: string }> }): Promise<NextResponse> {
    try {
        const { name: domain } = await ctx.params;
        if (!Domain.isValidDomain(domain)) {
            return NextResponse.json({ error: `The provided domain '${domain}' is not valid` }, { status: 400 });
        }
        const config = { headers: { 'x-rapidapi-key': RAPID_API_KEY }, params: { domain } };
        const response = await axios.get(DOMAINR_BASE_URL, config);
        if (!response.data.status || response.data.status.length === 0 || !response.data.status[0].status) {
            logger.error({ domain }, `No valid status found for domain ${domain}`);
            return NextResponse.json({ status: DomainStatus.ERROR });
        }
        const status = response.data.status[0].status.split(' ').at(-1)?.toUpperCase() as DomainStatus;
        return NextResponse.json({ status });
    } catch (error) {
        logger.error({ error }, 'Error fetching data');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
