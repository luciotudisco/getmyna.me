import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TableCell, TableRow } from '@/components/ui/table';
import { BadgeCheck } from 'lucide-react';
import { Domain, DomainStatus as DomainStatusEnum } from '@/models/domain';

interface SearchResultProps {
    domain: Domain;
}

export function SearchResult({ domain }: SearchResultProps) {
    const [isAvailable, setIsAvailable] = useState(domain.isAvailable());

    return (
        <TableRow>
            <TableCell>
                <p className="flex min-h-10 flex-grow flex-row items-center truncate align-middle font-extralight">
                    {domain.getName()}
                    {isAvailable && domain.getLevel() <= 2 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <BadgeCheck className="ml-2 h-4 w-4 text-orange-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>This is a rare second level domain!</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </p>
            </TableCell>
            <TableCell className="flex justify-end">
                <DomainStatus domain={domain} onStatusChange={setIsAvailable} />
            </TableCell>
        </TableRow>
    );
}

function DomainStatus({ domain, onStatusChange }: { domain: Domain; onStatusChange: (available: boolean) => void }) {
    const [status, setStatus] = useState<DomainStatusEnum>(domain.getStatus());

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch('/api/domains/status?domain=' + domain.getName());
                const data = await response.json();
                const fetchedStatus = data.status.at(0).summary as DomainStatusEnum;
                domain.setStatus(fetchedStatus);
                setStatus(fetchedStatus);
                onStatusChange(domain.isAvailable());
            } catch (error) {
                console.error('Error fetching domain status:', error);
            }
        };

        fetchStatus();
    }, [domain, onStatusChange]);

    if (status === DomainStatusEnum.unknown) {
        return (
            <Badge className="flex min-h-7 min-w-24 justify-center text-center bg-slate-200 text-slate-800">
                Checking...
            </Badge>
        );
    }

    return (
        <Badge
            className={`flex min-h-7 min-w-24 justify-center text-center ${
                domain.isAvailable() ? 'bg-green-400 hover:bg-green-600' : 'bg-red-400 hover:bg-red-600'
            }`}
        >
            {domain.isAvailable() ? 'Available' : 'Taken'}
        </Badge>
    );
}

