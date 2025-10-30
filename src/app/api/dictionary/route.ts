import { NextResponse } from 'next/server';

import { dictionaryRepository } from '@/services/dictionary-repository';
import logger from '@/utils/logger';

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || undefined;
        const locale = searchParams.get('locale') || undefined;
        const pageParam = searchParams.get('page');
        const pageSizeParam = searchParams.get('pageSize');
        const page = pageParam ? parseInt(pageParam, 10) : 1;
        const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 5000;
        const options = { category, locale, page, pageSize };
        const result = await dictionaryRepository.list(options);
        return NextResponse.json(result);
    } catch (error) {
        logger.error({ error }, 'Error fetching dictionary entries');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
