import { NextResponse } from 'next/server';

import { tldRepository } from '@/services/tld-repository';
import logger from '@/utils/logger';

export async function GET(): Promise<NextResponse> {
    try {
        const tlds = await tldRepository.listTLDs();
        return NextResponse.json({ tlds });
    } catch (error) {
        logger.error({ error }, 'Error fetching TLDs');
        return NextResponse.json({ error: 'Failed to fetch TLDs' }, { status: 500 });
    }
}
