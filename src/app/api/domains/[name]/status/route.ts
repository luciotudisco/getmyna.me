import axios from 'axios';
import { NextResponse } from 'next/server';

import logger from '@/utils/logger';

const DOMAINR_BASE_URL = 'https://domainr.p.rapidapi.com/v2/status';
const RAPID_API_KEY = process.env.RAPID_API_KEY!;

export async function GET(
    _request: Request,
    { params }: { params: Promise<Record<string, string | string[]>> },
): Promise<NextResponse> {
    try {
        const resolvedParams = await params;
        const domain = Array.isArray(resolvedParams?.name) ? resolvedParams?.name[0] : resolvedParams?.name;
        
        if (!domain) {
            logger.warn('No domain provided in request');
            return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
        }

        if (!RAPID_API_KEY) {
            logger.error('RAPID_API_KEY environment variable is not set');
            return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
        }

        const headers = { headers: { 'x-rapidapi-key': RAPID_API_KEY } };
        const url = `${DOMAINR_BASE_URL}?${new URLSearchParams({ domain }).toString()}`;
        
        logger.debug({ domain, url }, 'Fetching domain status from Domainr API');
        
        const response = await axios.get(url, headers);
        
        // Validate the response structure
        if (!response.data || typeof response.data !== 'object') {
            logger.warn({ domain, response: response.data }, 'Invalid response structure from Domainr API');
            return NextResponse.json({ error: 'Invalid response from domain status service' }, { status: 502 });
        }

        logger.debug({ domain, statusCount: response.data.status?.length }, 'Successfully fetched domain status');
        
        return NextResponse.json(response.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const statusCode = error.response?.status || 500;
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
            
            logger.error({ 
                error: errorMessage, 
                domain: resolvedParams?.name,
                statusCode,
                response: error.response?.data 
            }, 'Domainr API error');
            
            return NextResponse.json({ 
                error: 'Failed to fetch domain status',
                details: errorMessage 
            }, { status: statusCode >= 400 && statusCode < 500 ? statusCode : 502 });
        }
        
        logger.error({ error, domain: resolvedParams?.name }, 'Unexpected error fetching domain status');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
