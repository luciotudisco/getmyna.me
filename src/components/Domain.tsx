import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DOMAIN_STATUS_LABELS, DomainStatus } from '@/models/domainr';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface DomainProps {
    domain: string;
}

export default function Domain(props: DomainProps) {
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

    return (
        <div
            className="bg-gradient-to-t-100 min-h-16 w-full rounded-none p-5 align-middle font-mono shadow-sm"
            key={domain}
        >
            <div className="flex flex-row justify-between">
                <p className="font-extralight lowercase">{domain}</p>
                <div className="flex flex-row gap-2">
                    <Badge
                        className="min-w-24 justify-center text-center text-black"
                        style={{
                            backgroundColor:
                                DOMAIN_STATUS_LABELS[
                                    (domainStatus || DomainStatus.unknown) as DomainStatus
                                ].color,
                        }}
                    >
                        {isLoading ? '...' : domainStatus}
                    </Badge>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Info />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="p-5 font-mono text-sm">
                                {
                                    DOMAIN_STATUS_LABELS[
                                        (domainStatus || DomainStatus.unknown) as DomainStatus
                                    ].label
                                }
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    );
}
