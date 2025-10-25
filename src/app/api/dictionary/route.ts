import { NextResponse } from 'next/server';

import { dictionaryRepository } from '@/services/dictionary-repository';
import logger from '@/utils/logger';

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || undefined;
        const locale = searchParams.get('locale') || undefined;
        const limit = parseInt(searchParams.get('limit') || '1000', 10);
        const options = { category, locale, limit, hasMatchingDomains: true };
        const entries = await dictionaryRepository.list(options);
        return NextResponse.json({ entries, count: entries.length, filters: options });
    } catch (error) {
        logger.error({ error }, 'Error fetching dictionary entries');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
