import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

const WHOIS_HOST = 'whois-api6.p.rapidapi.com';
const RAPID_API_KEY = process.env.RAPID_API_KEY!;

export async function GET(request: NextRequest): Promise<NextResponse> {
    const domain = request.nextUrl.searchParams.get('domain');
    if (!domain) {
        return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 });
    }

    const options: https.RequestOptions = {
        hostname: WHOIS_HOST,
        path: '/whois/api/v1/getData',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-key': RAPID_API_KEY,
            'x-rapidapi-host': WHOIS_HOST,
        },
    };

    return new Promise<NextResponse>((resolve) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(NextResponse.json(json));
                } catch (error) {
                    console.error('Error parsing whois data:', error);
                    resolve(
                        NextResponse.json({ error: 'Failed to fetch whois data' }, { status: 500 }),
                    );
                }
            });
        });

        req.on('error', (error) => {
            console.error('Error fetching whois data:', error);
            resolve(NextResponse.json({ error: 'Failed to fetch whois data' }, { status: 500 }));
        });

        req.write(JSON.stringify({ query: domain }));
        req.end();
    });
}

