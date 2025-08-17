import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const DOMAINR_BASE_URL = 'https://domainr.p.rapidapi.com/v2/status';
const RAPID_API_KEY = process.env.RAPID_API_KEY!;

export async function GET(
    _request: NextRequest,
    { params }: { params: { domain: string } },
): Promise<NextResponse> {
    try {
        const { domain } = params;
        const query = { domain };
        const headers = { headers: { 'x-rapidapi-key': RAPID_API_KEY } };
        const url = `${DOMAINR_BASE_URL}?${new URLSearchParams(query).toString()}`;
        const response = await axios.get(url, headers);
        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
