'use client';

import { useCallback, useState } from 'react';
import { Hits, InstantSearch, Pagination, SearchBox } from 'react-instantsearch';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { motion } from 'framer-motion';

import DomainDetailDrawer from '@/components/DomainDetailDrawer';
import { Badge } from '@/components/ui/badge';
import { Domain } from '@/models/domain';
import { apiClient } from '@/services/api';

// Algolia search client
const searchClient = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!,
);

// Custom Hit component for displaying search results
function Hit({ hit, onDomainClick }: { hit: any; onDomainClick: (domain: Domain) => void }) {
    const domains = hit.matchingDomains || [];

    // Don't render if no matching domains (additional safeguard)
    if (domains.length === 0) {
        return null;
    }

    return (
        <div className="mb-4 rounded-lg border p-4">
            <h3 className="mb-2 text-lg font-semibold">{hit.word}</h3>
            <div className="flex flex-wrap gap-2">
                {domains.map((domainData: any, index: number) => (
                    <motion.div
                        key={`${hit.objectID}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.3,
                            delay: index * 0.05,
                            ease: 'easeOut',
                        }}
                    >
                        <Badge
                            variant="outline"
                            className="cursor-pointer font-light transition-all duration-300 hover:scale-110 hover:bg-muted"
                            onClick={() => onDomainClick(new Domain(domainData.domain))}
                        >
                            {domainData.domain}
                        </Badge>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default function DictionaryPage() {
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleDomainClick = useCallback(async (domain: Domain) => {
        setSelectedDomain(domain);
        setIsDrawerOpen(true);
        const status = await apiClient.getDomainStatus(domain.getName());
        domain.setStatus(status);
    }, []);

    return (
        <div className="min-h-screen">
            <main className="m-auto flex w-full max-w-6xl flex-col items-center gap-2 p-5 md:p-10">
                <div className="text-center">
                    <Badge className="text-xs font-medium">DICTIONARY</Badge>
                    <h1 className="mt-4 text-2xl font-semibold lg:text-3xl">Domain Hacks Dictionary</h1>
                    <p className="mt-2 text-muted-foreground">Search through words that have available domain hacks</p>
                </div>

                <InstantSearch searchClient={searchClient} indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!}>
                    {/* Search Box */}
                    <div className="w-full max-w-4xl">
                        <SearchBox
                            placeholder="Search for words with domain hacks (e.g., 'example', 'creative', 'domain')..."
                            classNames={{
                                root: 'w-full',
                                form: 'relative',
                                input: 'w-full px-4 py-3 text-md border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                                submit: 'absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground',
                                reset: 'absolute right-12 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground',
                            }}
                        />
                    </div>

                    {/* Search Results */}
                    <div className="w-full max-w-4xl">
                        <Hits
                            hitComponent={({ hit }) => <Hit hit={hit} onDomainClick={handleDomainClick} />}
                            classNames={{
                                root: 'w-full',
                                list: 'space-y-4',
                                item: 'w-full',
                            }}
                        />
                    </div>

                    {/* Pagination */}
                    <div className="mt-8">
                        <Pagination
                            classNames={{
                                root: 'flex items-center justify-center gap-2',
                                list: 'flex items-center gap-1',
                                item: 'px-3 py-2 text-sm border border-input rounded-md hover:bg-muted transition-colors',
                                selectedItem: 'bg-primary text-primary-foreground border-primary',
                                disabledItem: 'opacity-50 cursor-not-allowed',
                                link: 'block w-full h-full',
                            }}
                        />
                    </div>
                </InstantSearch>
            </main>

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
