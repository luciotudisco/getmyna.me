'use client';

import { useMemo, useState } from 'react';
import { Configure, Hits, InstantSearch, Pagination, SearchBox, useStats } from 'react-instantsearch';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { Sparkles } from 'lucide-react';

import DictionaryEntryCard from '@/components/DictionaryEntryCard';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DictionaryEntry } from '@/models/dictionary';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!;
const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);

function StatsDisplay() {
    const { nbHits } = useStats();
    return (
        <div className="mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">{nbHits.toLocaleString()}</span>
            <span>domains found</span>
        </div>
    );
}

export default function DictionaryPage() {
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);

    const filters = useMemo(() => {
        return [showOnlyAvailable ? 'isAvailable:true' : '', 'category:"common" OR category:"names"']
            .filter(Boolean)
            .join(' AND ');
    }, [showOnlyAvailable]);

    return (
        <div className="flex min-h-screen flex-col">
            <InstantSearch searchClient={searchClient} indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!}>
                <Configure filters={filters} />
                <main className="m-auto flex w-full max-w-7xl flex-grow flex-col items-center gap-6 p-5 md:p-10">
                    {/* Header Section */}
                    <div className="mb-2 text-center md:mb-6">
                        <Badge className="text-xs font-medium">DICTIONARY</Badge>
                        <h1 className="mt-4 text-2xl font-semibold lg:text-3xl">Domain Hacks Dictionary</h1>
                        <p className="mx-auto mt-2 max-w-2xl text-sm font-medium text-muted-foreground lg:text-base">
                            Browse through thousands of available domain hacks.
                        </p>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="w-full max-w-5xl">
                        <div className="mb-4 flex items-center justify-center gap-3 p-4">
                            <Switch
                                id="available-filter"
                                checked={showOnlyAvailable}
                                onCheckedChange={setShowOnlyAvailable}
                            />
                            <label htmlFor="available-filter" className="cursor-pointer text-sm font-medium">
                                Show only available domains
                            </label>
                        </div>
                        <SearchBox
                            placeholder="Search for words with domain hacks (e.g., 'example', 'creative', 'domain')..."
                            classNames={{
                                root: 'w-full mb-4',
                                form: 'relative',
                                input: 'w-full px-4 py-2.5 !text-base border border-input bg-background rounded-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all shadow-sm hover:shadow-md',
                                submit: 'hidden',
                                reset: 'absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors',
                            }}
                        />
                        <StatsDisplay />
                    </div>

                    {/* Results Grid */}
                    <div className="w-full max-w-5xl flex-grow">
                        <Hits
                            hitComponent={({ hit }) => (
                                <DictionaryEntryCard entry={hit as unknown as DictionaryEntry} key={hit.objectID} />
                            )}
                            classNames={{
                                root: 'w-full',
                                list: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3',
                            }}
                        />
                    </div>

                    {/* Pagination */}
                    <div className="mt-8 p-6">
                        <div className="m-auto w-full max-w-6xl">
                            <Pagination
                                showNext={false}
                                showPrevious={false}
                                classNames={{
                                    root: 'flex items-center justify-center gap-2 text-muted-foreground',
                                    list: 'flex items-center gap-1',
                                    item: 'px-3 py-2 text-sm rounded-sm transition-all hover:bg-muted',
                                    selectedItem: 'bg-primary text-primary-foreground font-semibold shadow-sm',
                                    disabledItem: 'opacity-50 cursor-not-allowed',
                                    link: 'block w-full h-full',
                                }}
                            />
                        </div>
                    </div>
                </main>
            </InstantSearch>
        </div>
    );
}
