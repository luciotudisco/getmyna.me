'use client';

import { useMemo } from 'react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

import { WhoisInfo } from '@/models/whois';

interface DomainWhoisSectionProps {
    whoisInfo?: WhoisInfo | null;
}

export function DomainWhoisSection({ whoisInfo }: DomainWhoisSectionProps) {
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
        <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
                <span className="font-semibold uppercase text-muted-foreground">Domain Whois</span>
            </div>

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

            {/* Registrar Name */}
            {whoisInfo?.registrantName && (
                <p>
                    <span className="text-muted-foreground">Registrant:</span>{' '}
                    <span className="font-medium">{whoisInfo.registrantName}</span>
                </p>
            )}
        </div>
    );
}
