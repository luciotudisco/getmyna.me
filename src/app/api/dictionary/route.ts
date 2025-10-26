import { NextResponse } from 'next/server';

import { dictionaryRepository } from '@/services/dictionary-repository';
import logger from '@/utils/logger';

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || undefined;
        const locale = searchParams.get('locale') || undefined;
        const limit = parseInt(searchParams.get('limit') || '1000', 10);

        // Check if pagination parameters are provided
        const page = searchParams.get('page');
        const pageSize = searchParams.get('pageSize');

        if (page || pageSize) {
            // Use paginated endpoint
            const paginatedOptions = {
                category,
                locale,
                hasMatchingDomains: true,
                page: page ? parseInt(page, 10) : 1,
                pageSize: pageSize ? parseInt(pageSize, 10) : 50,
            };
            const result = await dictionaryRepository.listPaginated(paginatedOptions);
            return NextResponse.json(result);
        } else {
            // Use legacy non-paginated endpoint
            const options = { category, locale, limit, hasMatchingDomains: true };
            const entries = await dictionaryRepository.list(options);
            return NextResponse.json(entries);
        }
    } catch (error) {
        logger.error({ error }, 'Error fetching dictionary entries');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
