import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const WIKIPEDIA_SUMMARY_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const FALLBACK_DESCRIPTION = 'No additional information is available for this TLD.';

export async function GET(request: NextRequest): Promise<NextResponse> {
    const tld = request.nextUrl.searchParams.get('tld');
    if (!tld) {
        return NextResponse.json({ error: 'Missing tld parameter' }, { status: 400 });
    }

    try {
        const url = `${WIKIPEDIA_SUMMARY_URL}/.${tld}`;
        const response = await axios.get(url);
        const extract: string | undefined = response.data?.extract;
        if (!extract) {
            return NextResponse.json({ description: FALLBACK_DESCRIPTION });
        }
        const description = extract
            .split(/(?<=\.)\s+/)
            .slice(0, 2)
            .join(' ');
        return NextResponse.json({ description });
    } catch (error) {
        console.error('Error fetching TLD info:', error);
        return NextResponse.json({ description: FALLBACK_DESCRIPTION });
    }
}
