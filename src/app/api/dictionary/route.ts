import { NextResponse } from 'next/server';

import { dictionaryRepository } from '@/services/dictionary-repository';
import logger from '@/utils/logger';

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || undefined;
        const locale = searchParams.get('locale') || undefined;
        const limit = parseInt(searchParams.get('limit') || '1000', 10);
        const page = searchParams.get('page');
        const pageSize = searchParams.get('pageSize');
        
        const options = {
            category,
            locale,
            hasMatchingDomains: true,
            limit,
            page: page ? parseInt(page, 10) : undefined,
            pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
        };
        
        const result = await dictionaryRepository.list(options);
        return NextResponse.json(result);
    } catch (error) {
        logger.error({ error }, 'Error fetching dictionary entries');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
