'use client';

import { useMemo, useState } from 'react';
import {
    Configure,
    InstantSearch,
    Pagination,
    SearchBox,
    useHits,
    useInstantSearch,
    useRefinementList,
    useStats,
} from 'react-instantsearch';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { Sparkles } from 'lucide-react';

import DictionaryEntryCard from '@/components/DictionaryEntryCard';
import LoadingMessage from '@/components/LoadingMessage';
import NoResultsMessage from '@/components/NoResultsMessage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Switch } from '@/components/ui/switch';
import { DictionaryEntry } from '@/models/dictionary';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!;
const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);

function SearchStats() {
    const { nbHits } = useStats();
    return (
        <div className="mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">{nbHits.toLocaleString()}</span>
            <span>domains found</span>
        </div>
    );
}

function SearchPagination() {
    const { nbPages } = useStats();

    // Only show pagination if there's more than 1 page
    if (!nbPages || nbPages <= 1) {
        return null;
    }

    return (
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
    );
}

function SearchCategories() {
    const { items, refine } = useRefinementList({
        attribute: 'category',
        operator: 'or',
    });

    if (!items.length) {
        return null;
    }

    const handleCategoryClick = (item: { value: string; isRefined: boolean }) => {
        if (item.isRefined) {
            refine(item.value);
        } else {
            items.forEach((i) => {
                if (i.isRefined) {
                    refine(i.value);
                }
            });
            refine(item.value);
        }
    };

    return (
        <div className="mb-4 hidden w-full flex-wrap justify-center gap-2 md:flex">
            <ButtonGroup orientation="horizontal" className="w-full rounded-sm">
                {items
                    .sort((a, b) => a.label.localeCompare(b.label))
                    .map((item) => (
                        <Button
                            key={item.value}
                            variant={item.isRefined ? 'default' : 'secondary'}
                            size="sm"
                            onClick={() => handleCategoryClick(item)}
                            className="min-h-10 w-full min-w-32 gap-2 text-xs"
                        >
                            <span className="uppercase">{item.label}</span>
                            <span className="text-xs text-muted-foreground">({item.count.toLocaleString()})</span>
                        </Button>
                    ))}
            </ButtonGroup>
        </div>
    );
}

function SearchStatus() {
    const { status } = useInstantSearch();

    if (status !== 'loading' && status !== 'stalled') {
        return null;
    }

    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <LoadingMessage className="min-h-[400px]" />
        </div>
    );
}

function SearchResults() {
    const { status } = useInstantSearch();
    const { items } = useHits<DictionaryEntry>();

    if (items.length === 0 && status === 'idle') {
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

export default function DictionaryPage() {
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);

    const filters = useMemo(() => {
        return [showOnlyAvailable ? 'isAvailable:true' : ''].filter(Boolean).join(' AND ');
    }, [showOnlyAvailable]);

    return (
        <div className="flex min-h-screen flex-col">
            <InstantSearch searchClient={searchClient} indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!}>
                <Configure filters={filters} />
                <main className="m-auto flex w-full max-w-7xl flex-grow flex-col items-center gap-6 p-5 md:p-10">
                    {/* Header Section */}
                    <div className="mb-2 text-center">
                        <Badge className="text-xs font-medium">DICTIONARY</Badge>
                        <h1 className="mt-4 text-2xl font-semibold lg:text-3xl">Domain Hacks Dictionary</h1>
                        <p className="mx-auto mt-2 max-w-2xl text-sm font-medium text-muted-foreground lg:text-base">
                            Browse through available domain hacks
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
                            placeholder="Search for available domain hacks in the dictionary ..."
                            classNames={{
                                root: 'w-full mb-4',
                                form: 'relative',
                                input: 'w-full px-4 py-2.5 !text-base border border-input bg-background rounded-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all shadow-sm hover:shadow-md',
                                submit: 'hidden',
                                reset: 'absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors',
                            }}
                        />
                        <SearchCategories />
                        <SearchStats />
                    </div>

                    {/* Results Grid */}
                    <div className="relative w-full max-w-5xl flex-grow">
                        <SearchStatus />
                        <SearchResults />
                    </div>

                    {/* Pagination */}
                    <SearchPagination />
                </main>
            </InstantSearch>
        </div>
    );
}
