import { NextResponse } from 'next/server';
import axios from 'axios';

const WIKIPEDIA_SUMMARY_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary';

export async function GET(
    _request: Request,
    context: { params: { name: string } },
): Promise<NextResponse> {
    const { name: tld } = context.params;

    try {
        const url = `${WIKIPEDIA_SUMMARY_URL}/.${tld}`;
        const response = await axios.get(url);
        const extract: string | undefined = response.data?.extract;
        if (!extract) {
            return NextResponse.json({});
        }
        const description = extract
            .split(/(?<=\.)\s+/)
            .slice(0, 2)
            .join(' ');
        return NextResponse.json({ description });
    } catch (error) {
        console.error('Error fetching TLD info:', error);
        return NextResponse.json({});
    }
}
