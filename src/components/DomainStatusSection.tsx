'use client';

import { useMemo } from 'react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { DigInfo, DNSRecordType } from '@/models/dig';
import { DomainStatus as DomainStatusEnum } from '@/models/domain';
import { WhoisInfo } from '@/models/whois';

const DOMAIN_STATUS_DESCRIPTIONS: Record<DomainStatusEnum, string> = {
    [DomainStatusEnum.active]: 'This domain is alive and kicking, fully set up, and doing its job on the internet.',
    [DomainStatusEnum.claimed]: "Someone owns this domain, so you'll need to wait, buy, or trade if you want it.",
    [DomainStatusEnum.deleting]: 'The domain is currently being deleted and soon heading back into the wild.',
    [DomainStatusEnum.disallowed]: "This domain is off-limits by rules or policy, so it can't be registered by anyone.",
    [DomainStatusEnum.dpml]: 'Locked down by the DPML. IT is shielded to protect trademarks from squatters.',
    [DomainStatusEnum.expiring]: 'Time is ticking. The registration is almost up, and it may soon be up for grabs.',
    [DomainStatusEnum.inactive]: "Wide open and ready—this domain isn't owned yet and can be registered right away.",
    [DomainStatusEnum.invalid]: "Oops—this one doesn't even count as a proper domain name, so it's not usable.",
    [DomainStatusEnum.marketed]: 'This domain is up for sale and being advertised like digital real estate.',
    [DomainStatusEnum.parked]: 'The domain has an owner but is sitting there, usually pointing to ads or placeholders.',
    [DomainStatusEnum.pending]: 'In limbo—this domain is waiting for a registration or transfer to finish processing.',
    [DomainStatusEnum.premium]: 'This domain is considered "special" and comes with a price tag to match.',
    [DomainStatusEnum.priced]: "This domain has a set sticker price and can be bought directly if you're willing.",
    [DomainStatusEnum.reserved]: "The registry has this domain stashed away, so the public can't grab it.",
    [DomainStatusEnum.suffix]: 'This is a known domain ending rather than a name you can register directly.',
    [DomainStatusEnum.tld]: 'This domain sits at the top of the hierarchy—a top-level domain like .com or .org.',
    [DomainStatusEnum.transferable]: 'This domain can switch hands and registrars if the current owner approves.',
    [DomainStatusEnum.undelegated]: "The domain exists but hasn't been hooked up to the internet's plumbing yet.",
    [DomainStatusEnum.unknown]: "No one's quite sure what's going on with this domain—it is in the mystery box.",
    [DomainStatusEnum.zone]: 'This domain acts as a zone, meaning it can host records and subdomains under its roof.',
    [DomainStatusEnum.error]: "Something went sideways while checking this domain's status. Try again later.",
};

interface DomainStatusSectionProps {
    status: DomainStatusEnum;
    whoisInfo?: WhoisInfo | null;
    digInfo?: DigInfo | null;
}

export function DomainStatusSection({ status, whoisInfo, digInfo }: DomainStatusSectionProps) {
    const formattedCreationDate = useMemo(
        () => (whoisInfo?.creationDate ? format(parseISO(whoisInfo.creationDate), 'MMMM do, yyyy') : null),
        [whoisInfo?.creationDate],
    );

    const formattedExpirationDate = useMemo(
        () => (whoisInfo?.expirationDate ? format(parseISO(whoisInfo.expirationDate), 'MMMM do, yyyy') : null),
        [whoisInfo?.expirationDate],
    );

    const formattedLastUpdatedDate = useMemo(
        () => (whoisInfo?.lastUpdatedDate ? format(parseISO(whoisInfo.lastUpdatedDate), 'MMMM do, yyyy') : null),
        [whoisInfo?.lastUpdatedDate],
    );

    const domainAge = useMemo(
        () =>
            whoisInfo?.creationDate
                ? formatDistanceToNow(parseISO(whoisInfo.creationDate), { addSuffix: false })
                : null,
        [whoisInfo?.creationDate],
    );

    const aRecords = useMemo(() => {
        if (!digInfo?.records) {
            return false;
        }
        const aRecords = digInfo.records[DNSRecordType.A] || [];
        const aaaaRecords = digInfo.records[DNSRecordType.AAAA] || [];
        return { aRecords, aaaaRecords };
    }, [digInfo]);

    const mxRecords = useMemo(() => {
        if (!digInfo?.records) return false;
        const mxRecords = digInfo.records[DNSRecordType.MX] || [];
        return mxRecords;
    }, [digInfo]);

    return (
        <div className="space-y-3 text-xs">
            {/* Status Description */}
            <div className="flex justify-between">
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

            {/* Creation Date */}
            {whoisInfo?.creationDate && (
                <p>
                    <span className="text-muted-foreground">Created:</span>{' '}
                    <span className="font-medium">
                        {formattedCreationDate}
                        {domainAge && <span className="text-muted-foreground"> ({domainAge} old)</span>}
                    </span>
                </p>
            )}

            {/* Registrar */}
            {(whoisInfo?.registrarUrl || whoisInfo?.registrar) && (
                <p>
                    <span className="text-muted-foreground">Registrar:</span>{' '}
                    {whoisInfo.registrarUrl ? (
                        <a
                            href={whoisInfo.registrarUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 underline hover:text-blue-800"
                        >
                            {whoisInfo.registrar ?? whoisInfo.registrarUrl}
                        </a>
                    ) : (
                        <span className="font-medium">{whoisInfo.registrar}</span>
                    )}
                </p>
            )}

            {/* Expiration Date */}
            {whoisInfo?.expirationDate && (
                <p>
                    <span className="text-muted-foreground">Expires:</span>{' '}
                    <span className="font-medium">{formattedExpirationDate}</span>
                </p>
            )}

            {/* Last Updated Date */}
            {whoisInfo?.lastUpdatedDate && (
                <p>
                    <span className="text-muted-foreground">Last Updated:</span>{' '}
                    <span className="font-medium">{formattedLastUpdatedDate}</span>
                </p>
            )}

            {/* A Records */}
            {aRecords && aRecords.aRecords.length > 0 && (
                <p>
                    <span className="text-muted-foreground">A Records:</span>{' '}
                    <span className="font-medium">
                        {aRecords.aRecords.slice(0, 2).join(', ')}
                        {aRecords.aRecords.length > 2 ? ', ...' : ''}
                    </span>
                </p>
            )}

            {/* MX Records */}
            {mxRecords && mxRecords.length > 0 && (
                <p>
                    <span className="text-muted-foreground">MX Records:</span>{' '}
                    <span className="font-medium">
                        {mxRecords.slice(0, 2).join(', ')}
                        {mxRecords.length > 2 ? ', ...' : ''}
                    </span>
                </p>
            )}
        </div>
    );
}
