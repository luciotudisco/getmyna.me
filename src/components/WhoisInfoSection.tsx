import { WhoisInfo } from '@/models/whois';
import { format, parseISO } from 'date-fns';

interface WhoisInfoSectionProps {
    whoisInfo: WhoisInfo;
}

export function WhoisInfoSection({ whoisInfo }: WhoisInfoSectionProps) {
    const { creationDate, registrarUrl, registrar, expirationDate } = whoisInfo;

    if (!creationDate || !registrarUrl || !expirationDate) {
        return null;
    }

    const formattedCreationDate = format(parseISO(creationDate), 'MMMM do, yyyy');
    const formattedExpirationDate = format(parseISO(expirationDate), 'MMMM do, yyyy');

    return (
        <p className="text-xs">
            This domain was created on <span className="font-bold">{formattedCreationDate}</span>. It is registered
            with{' '}
            <a
                href={registrarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-600 underline"
            >
                {registrar ?? registrarUrl}
            </a>
            . It is set to expire on <span className="font-bold">{formattedExpirationDate}</span>.
        </p>
    );
}

