import { NextResponse } from 'next/server';
import axios from 'axios';

const WHOIS_URL = 'https://whois-api6.p.rapidapi.com/whois/api/v1/getData';
const WHOIS_HOST = 'whois-api6.p.rapidapi.com';
const RAPID_API_KEY = process.env.RAPID_API_KEY!;

export async function GET(_request: Request, context: { params: { name: string } }): Promise<NextResponse> {
    const { name: domain } = context.params;

    try {
        const response = await axios.post(
            WHOIS_URL,
            { query: domain },
            {
                headers: {
                    'x-rapidapi-key': RAPID_API_KEY,
                    'x-rapidapi-host': WHOIS_HOST,
                },
            },
        );

        type WhoisResult = {
            creation_date?: string | string[];
            expiration_date?: string | string[];
            registrar?: string;
            registrar_url?: string;
        };

        const result = (response.data as { result?: WhoisResult }).result;
        const creationRaw = result?.creation_date;
        const expirationRaw = result?.expiration_date;
        const registrar = result?.registrar || null;
        const registrarUrl = result?.registrar_url || null;
        const creationDate = Array.isArray(creationRaw) ? creationRaw[0] : creationRaw || null;
        const expirationDate = Array.isArray(expirationRaw) ? expirationRaw[0] : expirationRaw || null;
        return NextResponse.json({ creationDate, expirationDate, registrar, registrarUrl });
    } catch (error) {
        console.error('Error fetching whois data:', error);
        return NextResponse.json({ error: 'Failed to fetch whois data' }, { status: 500 });
    }
}
