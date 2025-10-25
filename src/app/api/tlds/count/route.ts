import { NextResponse } from 'next/server';

import { tldRepository } from '@/services/tld-repository';
import logger from '@/utils/logger';

export async function GET(): Promise<NextResponse> {
    try {
        const count = await tldRepository.count();
        return NextResponse.json({ count });
    } catch (error) {
        logger.error({ error }, 'Error counting TLDs');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
