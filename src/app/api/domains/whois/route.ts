import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const WHOIS_BASE_URL = 'https://domains-api.p.rapidapi.com/v1/whois';
const RAPID_API_KEY = process.env.RAPID_API_KEY!;
const RAPID_API_HOST = 'domains-api.p.rapidapi.com';

export async function GET(request: NextRequest): Promise<NextResponse> {
    const domain = request.nextUrl.searchParams.get('domain');
    if (!domain) {
        return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 });
    }

    try {
        const url = `${WHOIS_BASE_URL}?${new URLSearchParams({ domain }).toString()}`;
        const headers = {
            headers: {
                'x-rapidapi-key': RAPID_API_KEY,
                'x-rapidapi-host': RAPID_API_HOST,
            },
        };
        const response = await axios.get(url, headers);
        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error fetching WHOIS data:', error);
        return NextResponse.json({ error: 'Failed to fetch WHOIS data' }, { status: 500 });
    }
}

