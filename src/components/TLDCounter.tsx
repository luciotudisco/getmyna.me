'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';

import NumberTicker from '@/components/ui/number-ticker';
import { apiClient } from '@/services/api';

function CountDisplay({ isPending, hasError, count }: { isPending: boolean; hasError: boolean; count: number }) {
    if (hasError) {
        return (
            <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-2xl font-semibold text-muted-foreground">¯\_(ツ)_/¯ </span>
                <span className="text-xs text-muted-foreground">something went wrong counting our TLDs</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 align-bottom">
                <NumberTicker
                    value={isPending ? 0 : count}
                    className="min-h-8 min-w-20 text-2xl font-semibold tabular-nums text-primary"
                />
                <span className="align-bottom text-lg font-medium text-muted-foreground">TLDs</span>
            </div>
            <Link
                href="/tlds"
                className="mb-4 text-xs text-muted-foreground underline decoration-dotted underline-offset-2 transition-colors duration-200 hover:text-foreground"
                title="View all TLDs"
            >
                view them all
            </Link>
        </div>
    );
}

function TLDCounter() {
    const [count, setCount] = useState(0);
    const [isPending, startTransition] = useTransition();
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        startTransition(async () => {
            try {
                setHasError(false);
                const count = await apiClient.getTLDsCount();
                setCount(count);
            } catch {
                setHasError(true);
                setCount(0);
            }
        });
    }, []);

    return (
        <div className="flex flex-col items-center justify-center gap-1">
            <h2 className="text-muted-foreground">Powered by a collection of</h2>
            <CountDisplay isPending={isPending} hasError={hasError} count={count} />
        </div>
    );
}

export default TLDCounter;
