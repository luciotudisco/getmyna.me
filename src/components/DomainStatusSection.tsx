'use client';

import { DomainStatus as DomainStatusEnum, DOMAIN_STATUS_DESCRIPTIONS } from '@/models/domain';
import { WhoisInfo } from '@/models/whois';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { useMemo } from 'react';

interface DomainStatusSectionProps {
    status: DomainStatusEnum;
    whoisInfo?: WhoisInfo | null;
}

export function DomainStatusSection({ status, whoisInfo }: DomainStatusSectionProps) {
    const formattedCreationDate = useMemo(
        () => (whoisInfo?.creationDate ? format(parseISO(whoisInfo.creationDate), 'MMMM do, yyyy') : null),
        [whoisInfo?.creationDate],
    );

    const formattedExpirationDate = useMemo(
        () => (whoisInfo?.expirationDate ? format(parseISO(whoisInfo.expirationDate), 'MMMM do, yyyy') : null),
        [whoisInfo?.expirationDate],
    );

    const domainAge = useMemo(
        () =>
            whoisInfo?.creationDate
                ? formatDistanceToNow(parseISO(whoisInfo.creationDate), { addSuffix: false })
                : null,
        [whoisInfo?.creationDate],
    );

    return (
        <div className="space-y-3 text-xs">
            {/* Status Description */}
            {DOMAIN_STATUS_DESCRIPTIONS[status] && (
                <div className="flex gap-2">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">{DOMAIN_STATUS_DESCRIPTIONS[status]}</span>
                </div>
            )}

            {/* Creation Date */}
            {whoisInfo?.creationDate && (
                <div className="flex gap-2">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">
                        {formattedCreationDate}
                        {domainAge && <span className="text-muted-foreground"> ({domainAge} old)</span>}
                    </span>
                </div>
            )}

            {/* Registrar */}
            {(whoisInfo?.registrarUrl || whoisInfo?.registrar) && (
                <div className="flex gap-2">
                    <span className="text-muted-foreground">Registrar:</span>
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
                </div>
            )}

            {/* Expiration Date */}
            {whoisInfo?.expirationDate && (
                <div className="flex gap-2">
                    <span className="text-muted-foreground">Expires:</span>
                    <span className="font-medium">{formattedExpirationDate}</span>
                </div>
            )}
        </div>
    );
}
