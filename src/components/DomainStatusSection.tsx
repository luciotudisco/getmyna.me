'use client';

import { Badge } from '@/components/ui/badge';
import { DomainStatus as DomainStatusEnum } from '@/models/domain';

const DOMAIN_STATUS_DESCRIPTIONS: Record<DomainStatusEnum, string> = {
    [DomainStatusEnum.ACTIVE]: 'This domain is alive and kicking, fully set up, and doing its job on the internet.',
    [DomainStatusEnum.CLAIMED]: "Someone owns this domain, so you'll need to wait, buy, or trade if you want it.",
    [DomainStatusEnum.DELETING]: 'The domain is currently being deleted and soon heading back into the wild.',
    [DomainStatusEnum.DISALLOWED]: "This domain is off-limits by rules or policy, so it can't be registered by anyone.",
    [DomainStatusEnum.DPML]: 'Locked down by the DPML. IT is shielded to protect trademarks from squatters.',
    [DomainStatusEnum.EXPIRING]: 'Time is ticking. The registration is almost up, and it may soon be up for grabs.',
    [DomainStatusEnum.INACTIVE]: "Wide open and ready—this domain isn't owned yet and can be registered right away.",
    [DomainStatusEnum.INVALID]: "Oops—this one doesn't even count as a proper domain name, so it's not usable.",
    [DomainStatusEnum.MARKETED]: 'This domain is up for sale and being advertised like digital real estate.',
    [DomainStatusEnum.PARKED]: 'The domain has an owner but is sitting there, usually pointing to ads or placeholders.',
    [DomainStatusEnum.PENDING]: 'In limbo—this domain is waiting for a registration or transfer to finish processing.',
    [DomainStatusEnum.PREMIUM]: 'This domain is considered "special" and comes with a price tag to match.',
    [DomainStatusEnum.PRICED]: "This domain has a set sticker price and can be bought directly if you're willing.",
    [DomainStatusEnum.RESERVED]: "The registry has this domain stashed away, so the public can't grab it.",
    [DomainStatusEnum.SUFFIX]: 'This is a known domain ending rather than a name you can register directly.',
    [DomainStatusEnum.TLD]: 'This domain sits at the top of the hierarchy—a top-level domain like .com or .org.',
    [DomainStatusEnum.TRANSFERABLE]: 'This domain can switch hands and registrars if the current owner approves.',
    [DomainStatusEnum.UNDELEGATED]: "The domain exists but hasn't been hooked up to the internet's plumbing yet.",
    [DomainStatusEnum.UNKNOWN]: "No one's quite sure what's going on with this domain—it is in the mystery box.",
    [DomainStatusEnum.ZONE]: 'This domain acts as a zone, meaning it can host records and subdomains under its roof.',
    [DomainStatusEnum.ERROR]: "Something went sideways while checking this domain's status. Try again later.",
};

interface DomainStatusSectionProps {
    status: DomainStatusEnum;
}

export function DomainStatusSection({ status }: DomainStatusSectionProps) {
    return (
        <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
                <span className="font-semibold uppercase text-muted-foreground">Domain Status</span>
                <Badge variant="outline" className="uppercase">
                    {status}
                </Badge>
            </div>
            {DOMAIN_STATUS_DESCRIPTIONS[status] && (
                <p>
                    <span className="font-medium">{DOMAIN_STATUS_DESCRIPTIONS[status]}</span>
                </p>
            )}
        </div>
    );
}
