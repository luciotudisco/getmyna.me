'use client';

import { useCallback, useState } from 'react';
import { Configure, Hits, InstantSearch, Pagination, SearchBox } from 'react-instantsearch';
import { liteClient as algoliasearch } from 'algoliasearch/lite';

import DomainDetailDrawer from '@/components/DomainDetailDrawer';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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

// Custom Hit component for displaying search results
function Hit({ hit, onDomainClick }: { hit: AlgoliaHit; onDomainClick: (domain: Domain) => void }) {
    const isAvailable = hit.isAvailable === true;

    return (
        <Badge
            key={hit.objectID}
            variant="outline"
            className={`cursor-pointer p-1 font-light transition-all duration-300 hover:scale-110 hover:bg-muted md:p-3 ${
                isAvailable ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100' : ''
            }`}
            onClick={() => onDomainClick(new Domain(hit.domain))}
        >
            {hit.domain}
        </Badge>
    );
}

export default function DictionaryPage() {
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

    const handleDomainClick = useCallback(async (domain: Domain) => {
        setSelectedDomain(domain);
        setIsDrawerOpen(true);
        const status = await apiClient.getDomainStatus(domain.getName());
        domain.setStatus(status);
    }, []);

    return (
        <div className="flex flex-col">
            <InstantSearch searchClient={searchClient} indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!}>
                <Configure filters={showOnlyAvailable ? 'isAvailable:true' : ''} />
                <main className="m-auto flex w-full max-w-6xl flex-grow flex-col items-center gap-2 p-5 md:p-10">
                    <div className="mb-5 text-center md:mb-10">
                        <Badge className="text-xs font-medium">DICTIONARY</Badge>
                        <h1 className="mt-4 text-2xl font-semibold lg:text-3xl">Domain Hacks Dictionary</h1>
                        <p className="mt-2 text-muted-foreground">
                            Search through words that have available domain hacks
                        </p>
                    </div>

                    <div className="w-full max-w-4xl">
                        <SearchBox
                            placeholder="Search for words with domain hacks (e.g., 'example', 'creative', 'domain')..."
                            classNames={{
                                root: 'w-full mb-3',
                                form: 'relative',
                                input: 'w-full px-4 py-2 !text-base border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ',
                                submit: 'hidden',
                                reset: 'absolute right-6 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground',
                            }}
                        />

                        <div className="mb-4 flex items-center justify-center gap-2">
                            <Switch
                                id="available-filter"
                                checked={showOnlyAvailable}
                                onCheckedChange={setShowOnlyAvailable}
                            />
                            <label htmlFor="available-filter" className="cursor-pointer text-sm text-muted-foreground">
                                Show only available domains
                            </label>
                        </div>
                    </div>

                    <div className="w-full max-w-4xl flex-grow">
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
                                list: 'flex flex-wrap gap-2 items-center justify-center',
                            }}
                        />
                    </div>

                    <div className="mt-auto p-6">
                        <div className="m-auto w-full max-w-6xl">
                            <Pagination
                                showNext={false}
                                showPrevious={false}
                                classNames={{
                                    root: 'flex items-center justify-center gap-1 text-muted-foreground',
                                    list: 'flex items-center',
                                    item: 'p-2 text-xs',
                                    selectedItem: 'bg-primary text-primary-foreground',
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
