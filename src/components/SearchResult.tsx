'use client';

import { useEffect, useState } from 'react';

import DomainDetailDrawer from '@/components/DomainDetailDrawer';
import DomainStatusBadge from '@/components/DomainStatusBadge';
import { TableCell, TableRow } from '@/components/ui/table';
import { Domain, DomainStatus as DomainStatusEnum } from '@/models/domain';
import { apiClient } from '@/services/api';
import { RateLimiter } from '@/utils/rate-limiter';

// Create a shared rate limiter instance (2 calls per second / 500ms delay)
const statusRateLimiter = new RateLimiter(2);

export function SearchResult({ domain }: { domain: Domain }) {
    const [status, setStatus] = useState<DomainStatusEnum>(DomainStatusEnum.unknown);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const result = await statusRateLimiter.add(() => apiClient.getDomainStatus(domain.getName()));
                domain.setStatus(result);
                setStatus(result);
            } catch (error) {
                console.error('Error fetching domain status:', error);
                domain.setStatus(DomainStatusEnum.error);
                setStatus(DomainStatusEnum.error);
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
                        <DomainStatusBadge domain={domain} status={status} />
                    </div>
                </TableCell>
            </TableRow>
            <DomainDetailDrawer domain={domain} status={status} open={open} onClose={() => setOpen(false)} />
        </>
    );
}
