import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DOMAIN_STATUS_LABELS, DomainStatus } from '@/models/domainr';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface DomainStatusIndicatorProps {
    domain: string;
}

export default function DomainStatusIndicator(props: DomainStatusIndicatorProps) {
    const { domain } = props;
    const [domainStatus, setDomainStatus] = useState<DomainStatus | undefined>();
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatus();
    }, [domain]);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/domains/status?domain=' + domain);
            const data = await response.json();
            setDomainStatus(data.status.at(0).summary);
        } catch {
            setDomainStatus(DomainStatus.unknown);
        } finally {
            setLoading(false);
        }
    };

    const tooltip = DOMAIN_STATUS_LABELS[(domainStatus || DomainStatus.unknown) as DomainStatus].label;
    const color = DOMAIN_STATUS_LABELS[(domainStatus || DomainStatus.unknown) as DomainStatus].color;

    return (
        <div className="flex flex-row gap-2">
            <Badge
                className="min-w-24 justify-center text-center text-black"
                style={{
                    backgroundColor: color,
                }}
            >
                {isLoading ? '...' : domainStatus}
            </Badge>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className='hover:bg-transparent'>
                            <Info />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="p-5 font-mono text-sm">{tooltip}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
