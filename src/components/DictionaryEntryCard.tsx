'use client';

import { useCallback, useMemo, useState } from 'react';

import DomainDetailDrawer from '@/components/DomainDetailDrawer';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/components/ui/utils';
import { DictionaryEntry } from '@/models/dictionary';
import { Domain } from '@/models/domain';
import { apiClient } from '@/services/api';

interface DictionaryEntryCardProps {
    entry: DictionaryEntry;
    variant?: 'compact' | 'normal';
}

export default function DictionaryEntryCard({ entry, variant = 'normal' }: DictionaryEntryCardProps) {
    const isAvailable = entry.isAvailable === true;
    const domain = useMemo(() => new Domain(entry.domain), [entry.domain]);
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const isCompact = variant === 'compact';

    const handleDomainClick = useCallback(async () => {
        setSelectedDomain(domain);
        setIsDrawerOpen(true);
        const status = await apiClient.getDomainStatus(domain.getName());
        domain.setStatus(status);
    }, [domain]);

    return (
        <>
            <Card
                className={cn(
                    'group relative cursor-pointer overflow-hidden rounded-sm border-[0.5px] transition-colors duration-200 hover:shadow-lg',
                    isAvailable
                        ? 'border-green-400/40 bg-green-200/60 hover:border-green-500 hover:shadow-green-200/20'
                        : 'border-gray-400/40 bg-gray-200/60 hover:border-gray-500 hover:shadow-gray-200/20',
                )}
                onClick={handleDomainClick}
            >
                <CardContent className={cn(isCompact ? 'p-1' : 'p-3')}>
                    <div className={cn('flex flex-col', isCompact ? 'gap-1' : 'gap-2')}>
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="truncate text-xs font-semibold transition-colors group-hover:text-primary">
                                {domain.getName()}
                            </h3>
                            {isAvailable && (
                                <div
                                    className="h-1.5 w-1.5 flex-shrink-0 animate-pulse rounded-full bg-green-800 shadow shadow-green-500/40 dark:bg-green-800 dark:shadow-green-400/40"
                                    aria-label="Available"
                                />
                            )}
                        </div>
                        {entry.category && <p className="text-xs text-muted-foreground">{entry.category}</p>}
                    </div>
                </CardContent>
            </Card>
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
        </>
    );
}
