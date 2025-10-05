'use client';

import { Suspense } from 'react';
import type { Metadata } from 'next';

import { SearchResults } from '@/components/SearchResults';

export const metadata: Metadata = {
    title: 'Search Domain Hacks',
    description: 'Search for the perfect domain hack. Find creative domain names that combine your brand with clever TLD combinations.',
    openGraph: {
        title: 'Search Domain Hacks | GetMyNa.me',
        description: 'Search for the perfect domain hack. Find creative domain names that combine your brand with clever TLD combinations.',
        url: 'https://getmyna.me/search',
    },
    twitter: {
        title: 'Search Domain Hacks | GetMyNa.me',
        description: 'Search for the perfect domain hack. Find creative domain names that combine your brand with clever TLD combinations.',
    },
    alternates: {
        canonical: 'https://getmyna.me/search',
    },
};

export default function SearchPage() {
    return (
        <Suspense>
            <SearchResults />
        </Suspense>
    );
}
