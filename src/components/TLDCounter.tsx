'use client';

import { useEffect, useState, useTransition } from 'react';

import NumberTicker from '@/components/ui/number-ticker';
import { apiClient } from '@/services/api';

function CountDisplay({ isPending, hasError, count }: { isPending: boolean; hasError: boolean; count: number }) {
    if (isPending) {
        return <span className="animate-pulse text-2xl font-semibold">....</span>;
    }

    if (hasError) {
        return (
            <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-2xl font-semibold text-muted-foreground">¯\_(ツ)_/¯ </span>
                <span className="text-xs text-muted-foreground">something went wrong counting our TLDs</span>
            </div>
        );
    }

    return (
        <>
            <NumberTicker value={count} className="min-w-20 text-2xl font-semibold tabular-nums text-primary" />
            <span className="text-lg font-medium text-muted-foreground">TLDs</span>
        </>
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
                const tlds = await apiClient.getTlds();
                setCount(tlds.length);
            } catch {
                setHasError(true);
                setCount(0);
            }
        });
    }, []);

    return (
        <div className="flex flex-col items-center justify-center gap-1 pb-8">
            <h2 className="text-muted-foreground">Powered by a collection of</h2>
            <div className="flex items-baseline gap-2">
                <CountDisplay isPending={isPending} hasError={hasError} count={count} />
            </div>
        </div>
    );
}

export default TLDCounter;
