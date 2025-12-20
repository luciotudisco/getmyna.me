'use client';

import DomainRegistrarButtons from '@/components/DomainRegistrarButtons';
import { DomainStatusSection } from '@/components/DomainStatusSection';
import { DomainWhoisSection } from '@/components/DomainWhoisSection';
import TLDSection from '@/components/TLDSection';
import { Separator } from '@/components/ui/separator';
import { Domain, DomainStatus } from '@/models/domain';
import { TLD } from '@/models/tld';
import { WhoisInfo } from '@/models/whois';

interface DomainDetailSectionsProps {
    domain: Domain;
    tldInfo: TLD | null;
    whoisInfo: WhoisInfo | null;
}

export function DomainDetailSections({ domain, tldInfo, whoisInfo }: DomainDetailSectionsProps) {
    return (
        <div className="space-y-4">
            {domain.isAvailable() && (
                <>
                    <Separator />
                    <DomainRegistrarButtons
                        domainName={domain.getName()}
                        pricing={tldInfo?.pricing || {}}
                        isPremiumDomain={domain.getStatus() === DomainStatus.PREMIUM}
                    />
                </>
            )}

            {!domain.isAvailable() && (
                <>
                    <Separator />
                    <DomainStatusSection status={domain.getStatus()} />
                </>
            )}

            {!domain.isAvailable() && whoisInfo && whoisInfo.creationDate && (
                <>
                    <Separator />
                    <DomainWhoisSection whoisInfo={whoisInfo} />
                </>
            )}

            {tldInfo && (
                <>
                    <Separator />
                    <TLDSection {...tldInfo} />
                </>
            )}
        </div>
    );
}

