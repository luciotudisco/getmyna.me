'use client';

import type { ReactNode } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/components/ui/utils';
import { Domain } from '@/models/domain';

export interface DictionaryAlgoliaHit {
    objectID: string;
    word: string;
    category?: string;
    locale?: string;
    rank?: number;
    domain: string;
    tld: string;
    isAvailable?: boolean;
}

export function DictionaryHitCard({
    hit,
    onDomainClick,
    titleAs = 'h3',
    details,
}: {
    hit: DictionaryAlgoliaHit;
    onDomainClick: (domain: Domain) => void;
    titleAs?: 'h3' | 'h4';
    details?: ReactNode;
}) {
    const isAvailable = hit.isAvailable === true;
    const domain = new Domain(hit.domain);

    const TitleTag = titleAs;

    return (
        <Card
            className={cn(
                'group relative cursor-pointer overflow-hidden rounded-sm border-[0.5px] transition-colors duration-200 hover:shadow-lg',
                isAvailable
                    ? 'border-green-400/40 bg-green-200/60 hover:border-green-500 hover:shadow-green-200/20 dark:border-green-500/20 dark:bg-green-950/10 dark:hover:border-green-400/40 dark:hover:shadow-green-900/20'
                    : 'border-gray-200 bg-gray-100/50 hover:border-gray-300 hover:shadow-gray-200/30 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-gray-700 dark:hover:shadow-gray-900/20',
            )}
            onClick={() => onDomainClick(domain)}
        >
            <CardContent className="p-3">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                        <TitleTag className="truncate text-sm font-semibold transition-colors group-hover:text-primary">
                            {domain.getName()}
                        </TitleTag>
                        {isAvailable && (
                            <div
                                className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-green-800 shadow shadow-green-500/40 dark:bg-green-800 dark:shadow-green-400/40"
                                aria-label="Available"
                            />
                        )}
                    </div>
                    {details}
                </div>
            </CardContent>
        </Card>
    );
}
