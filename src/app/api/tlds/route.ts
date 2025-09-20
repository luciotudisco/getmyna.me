import { NextResponse } from 'next/server';

import { tldRepository } from '@/services/tld-repository';

export async function GET(): Promise<NextResponse> {
    try {
        const tlds = await tldRepository.listTLDs();
        return NextResponse.json({ tlds });
    } catch (error) {
        console.error('Error fetching TLDs:', error);
        return NextResponse.json({ error: 'Failed to fetch TLDs' }, { status: 500 });
    }
}
