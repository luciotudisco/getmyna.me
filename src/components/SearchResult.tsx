import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Domain, DomainStatus as DomainStatusEnum } from '@/models/domain';
import { useEffect, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BadgeCheck, Loader2 } from 'lucide-react';
import { RateLimiter } from '@/lib/rate-limiter';

// Create a shared rate limiter instance (2 calls per second)
const statusRateLimiter = new RateLimiter(2);

export function SearchResult({ domain }: { domain: Domain }) {
    const [status, setStatus] = useState<DomainStatusEnum>(DomainStatusEnum.unknown);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const result = await statusRateLimiter.add(async () => {
                    const response = await fetch('/api/domains/status?domain=' + domain.getName());
                    const data = await response.json();
                    return data.status.at(0).summary as DomainStatusEnum;
                });
                
                domain.setStatus(result);
                setStatus(result);
            } catch (error) {
                console.error('Error fetching domain status:', error);
                // Keep the unknown status on error
            }
        };

        fetchStatus();
    }, [domain]);

    return (
        <TableRow>
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
                <Badge
                    className={`flex min-h-7 min-w-24 justify-center text-center ${
                        status === DomainStatusEnum.unknown
                            ? 'bg-gray-400'
                            : domain.isAvailable()
                            ? 'bg-green-400 hover:bg-green-600'
                            : 'bg-red-400 hover:bg-red-600'
                    }`}
                >
                    {status === DomainStatusEnum.unknown ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                            <span>Checking</span>
                        </div>
                    ) : (
                        domain.isAvailable() ? 'Available' : 'Taken'
                    )}
                </Badge>
            </TableCell>
        </TableRow>
    );
}

