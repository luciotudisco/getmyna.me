import { WhoisInfo } from '@/models/whois';

interface WhoisInfoSectionProps {
    whoisInfo: WhoisInfo;
}

export function WhoisInfoSection({ whoisInfo }: WhoisInfoSectionProps) {
    const { creationDate, registrarUrl, registrar, expirationDate } = whoisInfo;

    if (!creationDate || !registrarUrl || !expirationDate) {
        return null;
    }

    return (
        <p className="text-xs">
            This domain was created on {creationDate}. It is registered with{' '}
            <a
                href={registrarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
            >
                {registrar ?? registrarUrl}
            </a>
            . It is set to expire on {expirationDate}.
        </p>
    );
}

