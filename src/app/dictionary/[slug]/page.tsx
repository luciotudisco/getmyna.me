'use client';

import { use } from 'react';
import { Configure, InstantSearch, useHits } from 'react-instantsearch';
import { liteClient as algoliasearch } from 'algoliasearch/lite';

import DictionaryEntryCard from '@/components/DictionaryEntryCard';
import NoResultsMessage from '@/components/NoResultsMessage';
import { DictionaryEntry } from '@/models/dictionary';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!;
const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);

function SearchResults() {
    const { items } = useHits<DictionaryEntry>();

    if (items.length === 0) {
        return <NoResultsMessage />;
    }

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
                <DictionaryEntryCard key={item.objectID} entry={item as unknown as DictionaryEntry} />
            ))}
        </div>
    );
}

export default function DictionaryWordPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const decodedSlug = decodeURIComponent(slug);

    return (
        <div className="flex min-h-screen flex-col">
            <InstantSearch searchClient={searchClient} indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!}>
                <Configure filters={`word:${decodedSlug}`} />
                <main className="m-auto flex w-full max-w-7xl flex-grow flex-col items-center gap-6 p-5 md:p-10">
                    <h1 className="text-2xl font-bold">Domain hacks for &quot;{decodedSlug}&quot;</h1>
                    <SearchResults />
                </main>
            </InstantSearch>
        </div>
    );
}
