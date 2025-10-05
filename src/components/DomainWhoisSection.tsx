'use client';

import { format, formatDistanceToNow, parseISO } from 'date-fns';

import { WhoisInfo } from '@/models/whois';

interface DomainWhoisSectionProps {
    whoisInfo?: WhoisInfo | null;
}

export function DomainWhoisSection({ whoisInfo }: DomainWhoisSectionProps) {
    const formattedCreationDate = formatDate(whoisInfo?.creationDate);
    const formattedExpirationDate = formatDate(whoisInfo?.expirationDate);
    const domainAge = getDomainAge(whoisInfo?.creationDate);

    function formatDate(dateString: string | undefined): string | null {
        if (!dateString) return null;
        return format(parseISO(dateString), 'MMMM do, yyyy');
    }

    function getDomainAge(dateString: string | undefined): string | null {
        if (!dateString) return null;
        return formatDistanceToNow(parseISO(dateString), { addSuffix: false });
    }

    return (
        <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
                <span className="font-semibold uppercase text-muted-foreground">Domain Whois</span>
            </div>

            {formattedCreationDate && (
                <p>
                    <span className="text-muted-foreground">Created:</span>{' '}
                    <span className="font-medium">
                        {formattedCreationDate}
                        {domainAge && <span className="text-muted-foreground"> ({domainAge} old)</span>}
                    </span>
                </p>
            )}

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

            {formattedExpirationDate && (
                <p>
                    <span className="text-muted-foreground">Expires:</span>{' '}
                    <span className="font-medium">{formattedExpirationDate}</span>
                </p>
            )}

            {whoisInfo?.registrantName && (
                <p>
                    <span className="text-muted-foreground">Registrant:</span>{' '}
                    <span className="font-medium">{whoisInfo.registrantName}</span>
                </p>
            )}
        </div>
    );
}
