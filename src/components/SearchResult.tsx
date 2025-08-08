'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Domain, DomainStatus as DomainStatusEnum } from '@/models/domain';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, BadgeCheck, Loader2 } from 'lucide-react';
import { RateLimiter } from '@/lib/rate-limiter';
import DomainDetailDrawer from '@/components/DomainDetailDrawer';

// Create a shared rate limiter instance (1 call per second)
const statusRateLimiter = new RateLimiter(1);

export function SearchResult({ domain }: { domain: Domain }) {
    const [status, setStatus] = useState<DomainStatusEnum>(DomainStatusEnum.unknown);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const result = await statusRateLimiter.add(async () => {
                    const response = await axios.get('/api/domains/status', {
                        params: { domain: domain.getName() },
                    });
                    const data = response.data as { status?: { summary?: string }[] };
                    return (data.status?.[0]?.summary as DomainStatusEnum) ?? DomainStatusEnum.error;
                });

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
                    <p className="flex min-h-10 flex-grow flex-row items-center truncate align-middle font-extralight">
                        {domain.getName()}
                        {domain.isAvailable() && domain.getLevel() <= 2 && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <BadgeCheck className="ml-2 h-4 w-4 text-orange-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>This is a rare second level domain!</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </p>
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Badge
                            className={`inline-flex h-7 min-w-[6rem] items-center justify-center px-3 ${
                                status === DomainStatusEnum.unknown
                                    ? 'bg-gray-400'
                                    : status === DomainStatusEnum.error
                                      ? 'bg-yellow-400 hover:bg-yellow-500'
                                      : domain.isAvailable()
                                        ? 'bg-green-400 hover:bg-green-600'
                                        : 'bg-red-400 hover:bg-red-600'
                            }`}
                        >
                            {status === DomainStatusEnum.unknown ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                                </div>
                            ) : status === DomainStatusEnum.error ? (
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-white" />
                                    <span>Error</span>
                                </div>
                            ) : domain.isAvailable() ? (
                                'Available'
                            ) : (
                                'Taken'
                            )}
                        </Badge>
                    </div>
                </TableCell>
            </TableRow>
            <DomainDetailDrawer domain={domain} status={status} open={open} onClose={() => setOpen(false)} />
        </>
    );
}
