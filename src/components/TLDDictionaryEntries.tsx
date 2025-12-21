'use client';

import { useMemo } from 'react';
import { Configure, InstantSearch, useHits } from 'react-instantsearch';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { BookOpen, SearchX } from 'lucide-react';

import DictionaryEntryCard from '@/components/DictionaryEntryCard';
import { DictionaryEntry } from '@/models/dictionary';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!;
const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);

function TLDDictionaryHits() {
    const { items } = useHits();

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                <SearchX className="h-6 w-6" />
                <p className="text-sm">No available domain hacks for this TLD.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {items.map((item) => (
                <DictionaryEntryCard key={item.objectID} entry={item as unknown as DictionaryEntry} variant="compact" />
            ))}
        </div>
    );
}

export default function TLDDictionaryEntries({ tld }: { tld: string }) {
    const filters = useMemo(() => {
        return `tld:${tld} AND isAvailable:true AND (category:common OR category:names)`;
    }, [tld]);

    return (
        <div className="rounded-lg border p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col gap-0">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Dictionary entries
                    </h3>
                    <span className="text-xs text-muted-foreground">
                        Here are just some examples of available domain hacks for this TLD.
                    </span>
                </div>
            </div>
            <InstantSearch searchClient={searchClient} indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!}>
                <Configure filters={filters} hitsPerPage={20} />
                <TLDDictionaryHits />
            </InstantSearch>
        </div>
    );
}
