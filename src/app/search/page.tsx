'use client';

import { SearchResults } from '@/components/SearchResults';
import { Suspense } from 'react';

export default function SearchPage() {
    return (
        <Suspense>
            <SearchResults />
        </Suspense>
    );
}
