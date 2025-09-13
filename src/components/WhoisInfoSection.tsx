import { WhoisInfo } from '@/models/whois';
import { format, parseISO } from 'date-fns';

interface WhoisInfoSectionProps {
    whoisInfo: WhoisInfo;
}

export function WhoisInfoSection({ whoisInfo }: WhoisInfoSectionProps) {
    const { creationDate, registrarUrl, registrar, expirationDate } = whoisInfo;

    if (!creationDate && !registrarUrl && !registrar && !expirationDate) {
        return null;
    }

    const formattedCreationDate = creationDate ? format(parseISO(creationDate), 'MMMM do, yyyy') : null;
    const formattedExpirationDate = expirationDate ? format(parseISO(expirationDate), 'MMMM do, yyyy') : null;

    return (
        <p className="text-xs">
            {creationDate && (
                <>
                    This domain was created on <span className="font-bold">{formattedCreationDate}</span>.
                    {(registrarUrl || registrar || expirationDate) && ' '}
                </>
            )}
            {(registrarUrl || registrar) && (
                <>
                    It is registered with{' '}
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
                    It is set to expire on <span className="font-bold">{formattedExpirationDate}</span>.
                </>
            )}
        </p>
    );
}
