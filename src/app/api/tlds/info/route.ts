import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const DOMAINR_INFO_URL = 'https://domainr.p.rapidapi.com/v2/info';
const RAPID_API_KEY = process.env.RAPID_API_KEY!;

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const tld = request.nextUrl.searchParams.get('tld');
        const params = { domain: tld! };
        const headers = { headers: { 'x-rapidapi-key': RAPID_API_KEY } };
        const url = `${DOMAINR_INFO_URL}?${new URLSearchParams(params).toString()}`;
        const response = await axios.get(url, headers);
        const info = response.data.info?.[0];
        const summary = info?.summary || 'No additional information is available for this TLD.';
        return NextResponse.json({ description: summary });
    } catch (error) {
        console.error('Error fetching TLD info:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

