import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const DOMAINR_BASE_URL = 'https://domainr.p.rapidapi.com/v2/status';
const RAPID_API_KEY = '1420927789mshb407bf1f219396fp17ebc1jsnaf8d37a27aca';

export async function GET(request: NextRequest): Promise<NextResponse> {
    const domain = request.nextUrl.searchParams.get('domain');
    if (!domain) {
        return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 });
    }
    const params = { domain: domain! };
    const headers = { headers: { 'x-rapidapi-key': RAPID_API_KEY } };
    const url = `${DOMAINR_BASE_URL}?${new URLSearchParams(params).toString()}`;

    try {
        const response = await axios.get(url, headers);
        console.log('Response Data:', response.data);
        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
