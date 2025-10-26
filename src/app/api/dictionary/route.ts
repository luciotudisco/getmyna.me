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

        // Validate required pagination parameters
        if (!pageParam || !pageSizeParam) {
            return NextResponse.json(
                { error: 'Missing required parameters: page and pageSize are required' },
                { status: 400 },
            );
        }

        const page = parseInt(pageParam, 10);
        const pageSize = parseInt(pageSizeParam, 10);

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
