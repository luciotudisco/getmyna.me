'use client';

import { useEffect, useState, useTransition } from 'react';

import NumberTicker from '@/components/ui/number-ticker';
import { apiService } from '@/services/api';

export function TLDCounter() {
    const [count, setCount] = useState(0);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const fetchTLDCount = async () => {
            try {
                const tlds = await apiService.listTLDs();
                setCount(tlds.length);
            } catch (error) {
                console.error('Error fetching TLD count:', error);
                setCount(1500); // Fallback number
            }
        };

        startTransition(() => {
            fetchTLDCount();
        });
    }, []);

    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <h2 className="text-muted-foreground">Powered by a collection of</h2>
            {!isPending && count > 0 && (
                <div className="flex items-baseline gap-2">
                    <NumberTicker value={count} className="text-2xl font-semibold tabular-nums text-primary" />
                    <span className="text-lg font-medium text-muted-foreground">TLDs</span>
                </div>
            )}
        </div>
    );
}

export default TLDCounter;
