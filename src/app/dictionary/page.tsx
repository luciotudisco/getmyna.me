'use client';

import { useCallback, useState } from 'react';
import { Configure, Hits, InstantSearch, Pagination, SearchBox, useStats } from 'react-instantsearch';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { Globe2, Sparkles } from 'lucide-react';

import DomainDetailDrawer from '@/components/DomainDetailDrawer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/components/ui/utils';
import { Domain } from '@/models/domain';
import { apiClient } from '@/services/api';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!;
const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);

interface AlgoliaHit {
    objectID: string;
    word: string;
    category?: string;
    locale?: string;
    rank?: number;
    domain: string;
    tld: string;
    isAvailable?: boolean;
}

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

function Hit({ hit, onDomainClick }: { hit: AlgoliaHit; onDomainClick: (domain: Domain) => void }) {
    const isAvailable = hit.isAvailable === true;
    const domain = new Domain(hit.domain);
    const tld = domain.getTLD();

    return (
        <Card
            className={cn(
                'group relative cursor-pointer overflow-hidden border-[0.5px] transition-colors duration-200 hover:shadow-lg',
                isAvailable
                    ? 'border-green-400/60 bg-green-50/50 hover:border-green-500 hover:shadow-green-200/40 dark:border-green-500/40 dark:bg-green-950/20 dark:hover:border-green-400/60 dark:hover:shadow-green-900/30'
                    : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:shadow-gray-200/30 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-gray-700 dark:hover:shadow-gray-900/20',
            )}
            onClick={() => onDomainClick(domain)}
        >
            <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                                <h3 className="truncate text-sm font-semibold transition-colors group-hover:text-primary">
                                    {domain.getName()}
                                </h3>
                                {isAvailable && (
                                    <div
                                        className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-green-500 shadow shadow-green-500/40 dark:bg-green-400 dark:shadow-green-400/40"
                                        aria-label="Available"
                                    />
                                )}
                            </div>
                            <Badge
                                variant="outline"
                                className="flex-shrink-0 border-muted-foreground/20 bg-muted/50 font-mono text-xs"
                            >
                                <Globe2 className="mr-1 h-3 w-3" />.{tld}
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function DictionaryPage() {
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);

    const handleDomainClick = useCallback(async (domain: Domain) => {
        setSelectedDomain(domain);
        setIsDrawerOpen(true);
        const status = await apiClient.getDomainStatus(domain.getName());
        domain.setStatus(status);
    }, []);

    return (
        <div className="flex min-h-screen flex-col">
            <InstantSearch searchClient={searchClient} indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!}>
                <Configure filters={showOnlyAvailable ? 'isAvailable:true' : ''} />
                <main className="m-auto flex w-full max-w-7xl flex-grow flex-col items-center gap-6 p-5 md:p-10">
                    {/* Header Section */}
                    <div className="mb-2 text-center md:mb-6">
                        <Badge className="text-xs font-medium">DICTIONARY</Badge>
                        <h1 className="mt-4 text-2xl font-semibold lg:text-3xl">Domain Hacks Dictionary</h1>
                        <p className="mx-auto mt-2 max-w-2xl text-sm font-medium text-muted-foreground lg:text-base">
                            Discover creative domain hacks from thousands of words. Find the perfect domain that
                            combines your word with the perfect TLD.
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
                                input: 'w-full px-4 py-2.5 !text-sm lg:!text-base border border-input bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all shadow-sm hover:shadow-md',
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
                                <Hit
                                    hit={hit as unknown as AlgoliaHit}
                                    onDomainClick={handleDomainClick}
                                    key={hit.objectID}
                                />
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
                                    item: 'px-3 py-2 text-sm rounded-lg transition-all hover:bg-muted',
                                    selectedItem: 'bg-primary text-primary-foreground font-semibold shadow-sm',
                                    disabledItem: 'opacity-50 cursor-not-allowed',
                                    link: 'block w-full h-full',
                                }}
                            />
                        </div>
                    </div>
                </main>
            </InstantSearch>

            {selectedDomain && (
                <DomainDetailDrawer
                    domain={selectedDomain}
                    open={isDrawerOpen}
                    onClose={() => {
                        setIsDrawerOpen(false);
                        setSelectedDomain(null);
                    }}
                />
            )}
        </div>
    );
}
