'use client';

import { useMemo } from 'react';
import { Configure, InstantSearch, useHits } from 'react-instantsearch';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { BookOpen } from 'lucide-react';

import DictionaryEntryCard from '@/components/DictionaryEntryCard';
import { DictionaryEntry } from '@/models/dictionary';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!;
const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);

function TLDDictionaryEntries() {
    const { items } = useHits<DictionaryEntry>();

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="rounded-lg border p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col gap-0">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Domain Hacks
                    </h3>
                    <span className="text-xs text-muted-foreground">
                        Here are some examples of available domain hacks for this TLD.
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {items.map((item) => (
                    <DictionaryEntryCard key={item.objectID} entry={item} />
                ))}
            </div>
        </div>
    );
}

export default function TLDDictionary({ tld }: { tld: string }) {
    const filters = useMemo(() => {
        return `tld:${tld} AND isAvailable:true`;
    }, [tld]);

    return (
        <InstantSearch searchClient={searchClient} indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!}>
            <Configure filters={filters} hitsPerPage={20} />
            <TLDDictionaryEntries />
        </InstantSearch>
    );
}
