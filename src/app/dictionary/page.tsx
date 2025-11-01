'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import DomainDetailDrawer from '@/components/DomainDetailDrawer';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingMessage from '@/components/LoadingMessage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PaginationMetadata } from '@/models/common';
import { Domain } from '@/models/domain';
import { apiClient } from '@/services/api';

export default function DictionaryPage() {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [hasError, setHasError] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState<PaginationMetadata>({
        page: 1,
        pageSize: 500,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    });

    const loadData = useCallback(
        (page: number) => {
            startTransition(async () => {
                try {
                    setHasError(false);
                    const response = await apiClient.listWords({ page, pageSize: currentPage.pageSize });
                    const flatList = response.data.flatMap((e) => e.matchingDomains?.map((d) => d.domain) || []);
                    const uniqueDomains = Array.from(new Set(flatList));
                    setDomains(uniqueDomains.map((domain) => new Domain(domain)));
                    setCurrentPage(response.pagination);
                } catch {
                    setHasError(true);
                }
            });
        },
        [currentPage.pageSize],
    );

    useEffect(() => {
        loadData(1);
    }, [loadData]);

    const handleItemClick = useCallback(async (domain: Domain) => {
        setSelectedDomain(domain);
        setIsDrawerOpen(true);
        const status = await apiClient.getDomainStatus(domain.getName());
        domain.setStatus(status);
    }, []);

    const handlePreviousPage = useCallback(() => {
        if (currentPage.hasPreviousPage) {
            loadData(currentPage.page - 1);
        }
    }, [currentPage.hasPreviousPage, currentPage.page, loadData]);

    const handleNextPage = useCallback(() => {
        if (currentPage.hasNextPage) {
            loadData(currentPage.page + 1);
        }
    }, [currentPage.hasNextPage, currentPage.page, loadData]);

    if (hasError) {
        return <ErrorMessage />;
    }

    return (
        <div className="min-h-screen">
            <main className="m-auto flex w-full max-w-4xl flex-col items-center gap-5 p-5 md:p-10">
                <div className="text-center">
                    <Badge className="text-xs font-medium">DICTIONARY</Badge>
                    <h1 className="mt-4 text-2xl font-semibold lg:text-3xl">Domain Hacks Dictionary</h1>
                </div>

                {/* Pagination Controls */}
                <div className="mt-8 flex items-center justify-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={!currentPage.hasPreviousPage || isPending}
                        className="flex min-w-24 items-center gap-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex w-full items-center gap-2 text-sm text-muted-foreground">
                        <span>
                            {' '}
                            {currentPage.page} / {currentPage.totalPages}
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={!currentPage.hasNextPage || isPending}
                        className="flex min-w-24 items-center gap-2"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {isPending ? (
                    <LoadingMessage />
                ) : (
                    <div className="mt-3 flex w-full flex-wrap justify-center gap-2 lg:mt-6">
                        {domains.map((domain) => (
                            <motion.div
                                key={domain.getName()}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: Math.random() * 0.8,
                                    ease: 'easeOut',
                                }}
                            >
                                <Badge
                                    variant="outline"
                                    className="cursor-pointer font-light transition-all duration-300 hover:scale-110 hover:bg-muted"
                                    onClick={() => handleItemClick(domain)}
                                >
                                    {domain.getName()}
                                </Badge>
                            </motion.div>
                        ))}
                    </div>
                )}
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
