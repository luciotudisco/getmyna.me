import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Updated WHOIS API endpoint (https://rapidapi.com/api-ninjas/api/whois-by-api-ninjas)
// The new API returns structured information about a domain including
// creation and expiration dates and the registrar.
const WHOIS_URL = 'https://whois-by-api-ninjas.p.rapidapi.com/v1/whois';
const WHOIS_HOST = 'whois-by-api-ninjas.p.rapidapi.com';
const RAPID_API_KEY = process.env.RAPID_API_KEY!;

export async function GET(request: NextRequest): Promise<NextResponse> {
    const domain = request.nextUrl.searchParams.get('domain');
    if (!domain) {
        return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 });
    }

    try {
        const response = await axios.get(WHOIS_URL, {
            params: { domain },
            headers: {
                'x-rapidapi-key': RAPID_API_KEY,
                'x-rapidapi-host': WHOIS_HOST,
            },
        });

        const data = response.data as {
            creation_date?: string;
            expiration_date?: string;
            registrar?: string;
        };

        const creationDate = data.creation_date || null;
        const expirationDate = data.expiration_date || null;
        const registrar = data.registrar || null;

        let age: string | null = null;
        if (creationDate) {
            const diff = Date.now() - new Date(creationDate).getTime();
            const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
            age = `${years} years`;
        }

        return NextResponse.json({ creationDate, age, expirationDate, registrar });
    } catch (error) {
        console.error('Error fetching whois data:', error);
        return NextResponse.json({ error: 'Failed to fetch whois data' }, { status: 500 });
    }
}
