import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const WHOIS_URL = 'https://whois-api6.p.rapidapi.com/whois/api/v1/getData';
const WHOIS_HOST = 'whois-api6.p.rapidapi.com';
const RAPID_API_KEY = process.env.RAPID_API_KEY!;

export async function GET(request: NextRequest): Promise<NextResponse> {
    const domain = request.nextUrl.searchParams.get('domain');
    if (!domain) {
        return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 });
    }

    try {
        const response = await axios.post(
            WHOIS_URL,
            { query: domain },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-rapidapi-key': RAPID_API_KEY,
                    'x-rapidapi-host': WHOIS_HOST,
                },
            },
        );
        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error fetching whois data:', error);
        return NextResponse.json({ error: 'Failed to fetch whois data' }, { status: 500 });
    }
}
