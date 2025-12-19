'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { BookOpen, Sparkles } from 'lucide-react';

import DomainDetailDrawer from '@/components/DomainDetailDrawer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/components/ui/utils';
import { Domain } from '@/models/domain';
import { apiClient } from '@/services/api';

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

interface AlgoliaLiteSearchResponse {
    results?: Array<{
        hits?: unknown[];
    }>;
}

interface AlgoliaLiteClient {
    search: (
        queries: Array<{ indexName: string; query: string; params?: Record<string, unknown> }>,
    ) => Promise<AlgoliaLiteSearchResponse>;
}

function escapeAlgoliaFilterValue(value: string) {
    // Algolia filter string values use double quotes. Escape backslashes and quotes.
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;
const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;

const searchClient: AlgoliaLiteClient | null =
    ALGOLIA_APP_ID && ALGOLIA_SEARCH_KEY
        ? (algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY) as unknown as AlgoliaLiteClient)
        : null;

export default function TLDDictionaryEntriesSection({ tld }: { tld: string }) {
    const [hits, setHits] = useState<AlgoliaHit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const filters = useMemo(() => {
        const safeTld = escapeAlgoliaFilterValue(tld.replace(/^\./, '').toLowerCase());
        return `tld:"${safeTld}" AND isAvailable:true`;
    }, [tld]);

    useEffect(() => {
        let cancelled = false;

        async function run() {
            try {
                setHasError(false);
                setIsLoading(true);

                if (!searchClient || !ALGOLIA_INDEX_NAME) {
                    if (!cancelled) setHits([]);
                    return;
                }

                const response = await searchClient.search([
                    {
                        indexName: ALGOLIA_INDEX_NAME,
                        query: '',
                        params: {
                            hitsPerPage: 20,
                            filters,
                            attributesToRetrieve: [
                                'objectID',
                                'word',
                                'category',
                                'domain',
                                'tld',
                                'isAvailable',
                                'rank',
                            ],
                        },
                    },
                ]);

                const nextHits = (response?.results?.[0]?.hits ?? []) as AlgoliaHit[];
                if (!cancelled) setHits(nextHits.filter((h) => h?.isAvailable === true).slice(0, 20));
            } catch {
                if (!cancelled) setHasError(true);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        void run();

        return () => {
            cancelled = true;
        };
    }, [filters]);

    const handleDomainClick = useCallback(async (domain: Domain) => {
        setSelectedDomain(domain);
        setIsDrawerOpen(true);
        const status = await apiClient.getDomainStatus(domain.getName());
        domain.setStatus(status);
    }, []);

    return (
        <div className="rounded-lg border p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Dictionary entries
                    </h3>
                </div>
                <Badge className="text-xs font-medium">ALGOLIA</Badge>
            </div>

            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>
                    Up to <span className="font-medium">20</span> currently available domain hacks using{' '}
                    <span className="font-medium">.{tld.replace(/^\./, '')}</span>
                </span>
            </div>

            {hasError && <p className="text-sm text-muted-foreground">Couldn&apos;t load entries right now.</p>}

            {!hasError && isLoading && <p className="text-sm text-muted-foreground">Loading entries…</p>}

            {!hasError && !isLoading && hits.length === 0 && (
                <p className="text-sm text-muted-foreground">No available dictionary entries found for this TLD.</p>
            )}

            {!hasError && !isLoading && hits.length > 0 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {hits.map((hit) => {
                        const domain = new Domain(hit.domain);
                        return (
                            <Card
                                key={hit.objectID}
                                className={cn(
                                    'group relative cursor-pointer overflow-hidden rounded-sm border-[0.5px] transition-colors duration-200 hover:shadow-lg',
                                    'border-green-400/40 bg-green-200/60 hover:border-green-500 hover:shadow-green-200/20 dark:border-green-500/20 dark:bg-green-950/10 dark:hover:border-green-400/40 dark:hover:shadow-green-900/20',
                                )}
                                onClick={() => handleDomainClick(domain)}
                            >
                                <CardContent className="p-3">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="truncate text-sm font-semibold transition-colors group-hover:text-primary">
                                                {domain.getName()}
                                            </h4>
                                            <div
                                                className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-green-800 shadow shadow-green-500/40 dark:bg-green-800 dark:shadow-green-400/40"
                                                aria-label="Available"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="truncate text-xs text-muted-foreground">{hit.word}</p>
                                            {hit.category && (
                                                <span className="flex-shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                                    {hit.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

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
