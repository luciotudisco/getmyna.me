'use client';

import { useEffect, useState } from 'react';

import DomainDetailDrawer from '@/components/DomainDetailDrawer';
import DomainStatusBadge from '@/components/DomainStatusBadge';
import { TableCell, TableRow } from '@/components/ui/table';
import { Domain, DomainStatus as DomainStatusEnum } from '@/models/domain';
import { apiService } from '@/services/api';
import { RateLimiter } from '@/utils/rate-limiter';

// Create a shared rate limiter instance (1 call per second to be more conservative)
const statusRateLimiter = new RateLimiter(1, 500);

export function SearchResult({ domain }: { domain: Domain }) {
    const [status, setStatus] = useState<DomainStatusEnum>(DomainStatusEnum.unknown);
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                setIsLoading(true);
                const result = await statusRateLimiter.add(() => apiService.getDomainStatus(domain.getName()));
                domain.setStatus(result);
                setStatus(result);
            } catch (error) {
                console.error('Error fetching domain status:', error);
                domain.setStatus(DomainStatusEnum.error);
                setStatus(DomainStatusEnum.error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStatus();
    }, [domain]);

    return (
        <>
            <TableRow onClick={() => setOpen(true)} className="cursor-pointer">
                <TableCell>
                    <p className="flex min-h-10 max-w-[400px] flex-grow flex-row items-center truncate align-middle font-extralight">
                        {domain.getName()}
                    </p>
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        {isLoading ? (
                            <div className="h-6 w-16 animate-pulse rounded bg-muted" />
                        ) : (
                            <DomainStatusBadge domain={domain} status={status} />
                        )}
                    </div>
                </TableCell>
            </TableRow>
            <DomainDetailDrawer domain={domain} status={status} open={open} onClose={() => setOpen(false)} />
        </>
    );
}
