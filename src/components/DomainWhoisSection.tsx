'use client';

import { useMemo } from 'react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { DigInfo, DNSRecordType } from '@/models/dig';
import { WhoisInfo } from '@/models/whois';

interface DomainWhoisSectionProps {
    whoisInfo?: WhoisInfo | null;
    digInfo?: DigInfo | null;
}

export function DomainWhoisSection({ whoisInfo, digInfo }: DomainWhoisSectionProps) {
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
        <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
                <span className="font-semibold uppercase text-muted-foreground">Domain Whois</span>
                <div className="flex gap-2">
                    {aRecords && aRecords.aRecords.length > 0 && (
                        <Badge variant="outline" className="uppercase">
                            A Records
                        </Badge>
                    )}
                    {mxRecords && mxRecords.length > 0 && (
                        <Badge variant="outline" className="uppercase">
                            MX Records
                        </Badge>
                    )}
                </div>
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
        </div>
    );
}
