import { useEffect, useState, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DOMAIN_STATUS_LABELS, DomainStatus } from '@/models/domainr';

interface DomainStatusIndicatorProps {
    domain: string;
}

export default function DomainStatusIndicator(props: DomainStatusIndicatorProps) {
    const { domain } = props;
    const [domainStatus, setDomainStatus] = useState<DomainStatus | undefined>(DomainStatus.unknown);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            try {
                const response = await fetch('/api/domains/status?domain=' + domain);
                const data = await response.json();
                setDomainStatus(data.status.at(0).summary);
            } catch (error) {
                console.error('Error fetching domain status', error);
                setDomainStatus(DomainStatus.unknown);
            }
        });
    }, []);

    const tooltip = DOMAIN_STATUS_LABELS[domainStatus as DomainStatus].label;
    const color = DOMAIN_STATUS_LABELS[domainStatus as DomainStatus].color;

    return (
        <div className="flex flex-row gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Badge
                className="min-w-24 justify-center text-center text-black min-h-8 shadow-md"
                style={{
                    backgroundColor: color,
                }}
            >
                {isPending ? '...' : domainStatus}
            </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-52 text-balance p-2 font-mono text-xs text-center">{tooltip}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
