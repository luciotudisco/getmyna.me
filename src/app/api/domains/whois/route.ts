import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const WHOIS_API_URL = 'https://whois-api6.p.rapidapi.com/dns/api/v1/getRecords';
const RAPID_API_KEY = process.env.RAPID_API_KEY!;
const RAPID_API_HOST = 'whois-api6.p.rapidapi.com';

export async function GET(request: NextRequest): Promise<NextResponse> {
    const domain = request.nextUrl.searchParams.get('domain');
    if (!domain) {
        return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 });
    }

    try {
        const response = await axios.post(
            WHOIS_API_URL,
            { query: domain },
            {
                headers: {
                    'x-rapidapi-key': RAPID_API_KEY,
                    'x-rapidapi-host': RAPID_API_HOST,
                    'Content-Type': 'application/json',
                },
            },
        );
        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error fetching WHOIS data:', error);
        return NextResponse.json({ error: 'Failed to fetch WHOIS data' }, { status: 500 });
    }
}

