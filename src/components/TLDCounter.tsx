'use client';

import { useEffect, useState, useTransition } from 'react';

import NumberTicker from '@/components/ui/number-ticker';
import { apiClient } from '@/services/api';

function TLDCounter() {
    const [count, setCount] = useState(0);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            try {
                const tlds = await apiClient.getTlds();
                setCount(tlds.length);
            } catch {
                // Silently handle error
            }
        });
    }, []);

    return (
        <div className="flex flex-col items-center justify-center gap-1 pb-8">
            <h2 className="text-muted-foreground">Powered by a collection of</h2>
            <div className="flex items-baseline gap-2">
                {isPending ? (
                    <span className="animate-pulse text-2xl font-semibold">....</span>
                ) : (
                    <>
                        <NumberTicker value={count} className="text-2xl font-semibold tabular-nums text-primary" />
                        <span className="text-lg font-medium text-muted-foreground">TLDs</span>
                    </>
                )}
            </div>
        </div>
    );
}

export default TLDCounter;
