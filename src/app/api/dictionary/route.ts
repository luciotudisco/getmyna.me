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

        // Set defaults: page=1, pageSize=5000
        const page = pageParam ? parseInt(pageParam, 10) : 1;
        const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 5000;

        // Validate parameter values
        if (isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1) {
            return NextResponse.json(
                { error: 'Invalid parameters: page and pageSize must be positive integers' },
                { status: 400 },
            );
        }

        const options = {
            category,
            locale,
            hasMatchingDomains: true,
            page,
            pageSize,
        };

        const result = await dictionaryRepository.list(options);
        return NextResponse.json(result);
    } catch (error) {
        logger.error({ error }, 'Error fetching dictionary entries');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
