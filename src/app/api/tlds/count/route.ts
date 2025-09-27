import { NextResponse } from 'next/server';

import { tldRepository } from '@/services/tld-repository';
import logger from '@/utils/logger';

export async function GET(): Promise<NextResponse> {
    try {
        const count = await tldRepository.countTLDs();
        return NextResponse.json({ count });
    } catch (error) {
        logger.error({ error }, 'Error counting TLDs');
        return NextResponse.json({ error: 'Failed to count TLDs' }, { status: 500 });
    }
}
