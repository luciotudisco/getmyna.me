'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { BookOpen, Sparkles } from 'lucide-react';

import { type DictionaryAlgoliaHit, DictionaryHitCard } from '@/components/DictionaryHitCard';
import DomainDetailDrawer from '@/components/DomainDetailDrawer';
import { Badge } from '@/components/ui/badge';
import { Domain } from '@/models/domain';
import { apiClient } from '@/services/api';

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
    const [hits, setHits] = useState<DictionaryAlgoliaHit[]>([]);
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

                const nextHits = (response?.results?.[0]?.hits ?? []) as DictionaryAlgoliaHit[];
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
                        return (
                            <DictionaryHitCard
                                key={hit.objectID}
                                hit={hit}
                                onDomainClick={(domain) => handleDomainClick(domain)}
                                titleAs="h4"
                                details={
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="truncate text-xs text-muted-foreground">{hit.word}</p>
                                        {hit.category && (
                                            <span className="flex-shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                                {hit.category}
                                            </span>
                                        )}
                                    </div>
                                }
                            />
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
