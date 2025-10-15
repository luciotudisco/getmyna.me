import { NextRequest, NextResponse } from 'next/server';

import { tldRepository } from '@/services/tld-repository';
import logger from '@/utils/logger';

export async function GET(request: NextRequest, { params }: { params: { name: string } }): Promise<NextResponse> {
    try {
        const { name } = params;
        if (!name) {
            return NextResponse.json({ error: 'TLD name is required' }, { status: 400 });
        }
        const tld = await tldRepository.getTLD(name);
        if (!tld) {
            return NextResponse.json({ error: 'TLD not found' }, { status: 404 });
        }
        return NextResponse.json({ tld });
    } catch (error) {
        logger.error({ error }, 'Error fetching TLD by name');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
