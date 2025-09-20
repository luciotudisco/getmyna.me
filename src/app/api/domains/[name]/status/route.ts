import axios from 'axios';
import { NextResponse } from 'next/server';

const DOMAINR_BASE_URL = 'https://domainr.p.rapidapi.com/v2/status';
const RAPID_API_KEY = process.env.RAPID_API_KEY!;

export async function GET(
    _request: Request,
    { params }: { params: Promise<Record<string, string | string[]>> },
): Promise<NextResponse> {
    try {
        const resolvedParams = await params;
        const domain = Array.isArray(resolvedParams?.name) ? resolvedParams?.name[0] : resolvedParams?.name;
        const headers = { headers: { 'x-rapidapi-key': RAPID_API_KEY } };
        const url = `${DOMAINR_BASE_URL}?${new URLSearchParams({ domain }).toString()}`;
        const response = await axios.get(url, headers);
        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
