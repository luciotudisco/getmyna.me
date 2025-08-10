import { WhoisInfo } from '@/models/whois';

interface WhoisInfoSectionProps {
    whoisInfo: WhoisInfo;
}

export function WhoisInfoSection({ whoisInfo }: WhoisInfoSectionProps) {
    return (
        <div className="space-y-1">
            {whoisInfo.creationDate && (
                <p className="text-xs">
                    <span className="font-bold">Created:</span> {whoisInfo.creationDate}
                </p>
            )}
            {whoisInfo.age && (
                <p className="text-xs">
                    <span className="font-bold">Age:</span> {whoisInfo.age}
                </p>
            )}
            {whoisInfo.expirationDate && (
                <p className="text-xs">
                    <span className="font-bold">Expires:</span> {whoisInfo.expirationDate}
                </p>
            )}
            {whoisInfo.registrar && (
                <p className="text-xs">
                    <span className="font-bold">Registrar:</span> {whoisInfo.registrar}
                </p>
            )}
        </div>
    );
}

