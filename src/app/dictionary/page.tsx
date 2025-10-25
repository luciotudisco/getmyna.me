'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { motion } from 'framer-motion';

import DomainDetailDrawer from '@/components/DomainDetailDrawer';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingMessage from '@/components/LoadingMessage';
import { Badge } from '@/components/ui/badge';
import { Domain } from '@/models/domain';
import { apiClient } from '@/services/api';

export default function DictionaryPage() {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [hasError, setHasError] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        startTransition(async () => {
            try {
                const data = await apiClient.listWords({ hasMatchingDomains: true });
                const flatList = data.flatMap((e) => e.matchingDomains?.map((d) => d.domain) || []);
                const uniqueDomains = Array.from(new Set(flatList));
                setDomains(uniqueDomains.map((domain) => new Domain(domain)));
            } catch {
                setHasError(true);
            }
        });
    }, []);

    const handleDomainClick = useCallback(async (domain: Domain) => {
        setSelectedDomain(domain);
        const status = await apiClient.getDomainStatus(domain.getName());
        domain.setStatus(status);
        setIsDrawerOpen(true);
    }, []);

    if (hasError) {
        return <ErrorMessage />;
    }

    if (isPending) {
        return <LoadingMessage />;
    }

    return (
        <div className="min-h-screen">
            <main className="m-auto flex w-full max-w-4xl flex-col items-center gap-5 p-5 md:p-10">
                <div className="text-center">
                    <Badge className="text-xs font-medium">DICTIONARY</Badge>
                    <h1 className="mt-4 text-2xl font-semibold lg:text-3xl">Domain Hacks Dictionary</h1>
                </div>

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
                                onClick={() => handleDomainClick(domain)}
                            >
                                {domain.getName()}
                            </Badge>
                        </motion.div>
                    ))}
                </div>
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
