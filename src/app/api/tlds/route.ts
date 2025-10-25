import { NextResponse } from 'next/server';

import { tldRepository } from '@/services/tld-repository';
import logger from '@/utils/logger';

export async function GET(): Promise<NextResponse> {
    try {
        const tlds = await tldRepository.list();
        return NextResponse.json({ tlds });
    } catch (error) {
        logger.error({ error }, 'Error fetching TLDs');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
