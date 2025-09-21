import { NextResponse } from 'next/server';

import { tldRepository } from '@/services/tld-repository';
import logger from '@/utils/logger';

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const url = new URL(request.url);
        const action = url.searchParams.get('action');

        if (action === 'count') {
            const count = await tldRepository.countTLDs();
            return NextResponse.json({ count });
        }

        const tlds = await tldRepository.listTLDs();
        return NextResponse.json({ tlds });
    } catch (error) {
        logger.error({ error }, 'Error fetching TLDs');
        return NextResponse.json({ error: 'Failed to fetch TLDs' }, { status: 500 });
    }
}
