'use client';

import type { Metadata } from 'next';
import { Suspense } from 'react';

import { SearchResults } from '@/components/SearchResults';

export const metadata: Metadata = {
    title: 'Search Domain Hacks | GetMyNa.me',
    description: 'Search and discover creative domain hacks. Find the perfect memorable domain name using our powerful domain search tool.',
    keywords: ['domain search', 'domain hacks search', 'find domains', 'domain availability', 'creative domain names', 'domain generator'],
    openGraph: {
        title: 'Search Domain Hacks | GetMyNa.me',
        description: 'Search and discover creative domain hacks. Find the perfect memorable domain name using our powerful domain search tool.',
        type: 'website',
        url: 'https://getmyna.me/search',
        siteName: 'GetMyNa.me',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Search Domain Hacks | GetMyNa.me',
        description: 'Search and discover creative domain hacks. Find the perfect memorable domain name using our powerful domain search tool.',
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
