import { DomainStatus as DomainStatusEnum, DOMAIN_STATUS_DESCRIPTIONS } from '@/models/domain';
import { WhoisInfo } from '@/models/whois';
import { format, parseISO } from 'date-fns';

interface DomainInfoTableProps {
    status: DomainStatusEnum;
    whoisInfo?: WhoisInfo | null;
}

export function DomainInfoTable({ status, whoisInfo }: DomainInfoTableProps) {
    const { creationDate, registrarUrl, registrar, expirationDate } = whoisInfo || {};

    const formattedCreationDate = creationDate ? format(parseISO(creationDate), 'MMMM do, yyyy') : null;
    const formattedExpirationDate = expirationDate ? format(parseISO(expirationDate), 'MMMM do, yyyy') : null;

    return (
        <table className="w-full text-xs">
            <tbody className="[&_td:first-child]:pr-4 [&_td:first-child]:font-bold [&_td:first-child]:align-top">
                <tr>
                    <td>Status</td>
                    <td>
                        <span className="font-bold">{status}</span>: {DOMAIN_STATUS_DESCRIPTIONS[status]}
                    </td>
                </tr>
                {formattedCreationDate && (
                    <tr>
                        <td>Created</td>
                        <td>{formattedCreationDate}</td>
                    </tr>
                )}
                {(registrarUrl || registrar) && (
                    <tr>
                        <td>Registrar</td>
                        <td>
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
                        </td>
                    </tr>
                )}
                {formattedExpirationDate && (
                    <tr>
                        <td>Expires</td>
                        <td>{formattedExpirationDate}</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}

export default DomainInfoTable;
