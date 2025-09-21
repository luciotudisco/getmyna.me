import { format, parseISO } from 'date-fns';

import { WhoisInfo } from '@/models/whois';

interface WhoisInfoSectionProps {
    whoisInfo: WhoisInfo;
}

export function WhoisInfoSection({ whoisInfo }: WhoisInfoSectionProps) {
    const { creationDate, registrarUrl, registrar, expirationDate, lastUpdatedDate } = whoisInfo;

    if (!creationDate && !registrarUrl && !registrar && !expirationDate && !lastUpdatedDate) {
        return null;
    }

    const formattedCreationDate = creationDate ? format(parseISO(creationDate), 'MMMM do, yyyy') : null;
    const formattedExpirationDate = expirationDate ? format(parseISO(expirationDate), 'MMMM do, yyyy') : null;
    const formattedLastUpdatedDate = lastUpdatedDate ? format(parseISO(lastUpdatedDate), 'MMMM do, yyyy') : null;

    return (
        <p className="text-xs">
            {creationDate && (
                <>
                    Domain created on <span className="font-bold">{formattedCreationDate}</span>.
                    {(registrarUrl || registrar || expirationDate) && ' '}
                </>
            )}
            {(registrarUrl || registrar) && (
                <>
                    Registered with{' '}
                    {registrarUrl ? (
                        <a
                            href={registrarUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-blue-600 underline"
                        >
                            {registrar ?? registrarUrl}
                        </a>
                    ) : (
                        <span className="font-bold">{registrar}</span>
                    )}
                    {expirationDate && ' '}
                </>
            )}
            {expirationDate && (
                <>
                    Set to expire on <span className="font-bold">{formattedExpirationDate}</span>.
                    {lastUpdatedDate && ' '}
                </>
            )}
            {lastUpdatedDate && (
                <>
                    Last updated on <span className="font-bold">{formattedLastUpdatedDate}</span>.
                </>
            )}
        </p>
    );
}
