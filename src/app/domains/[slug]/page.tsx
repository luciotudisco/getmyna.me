'use client';

import { use, useEffect, useMemo, useState, useTransition } from 'react';

import DomainRegistrarButtons from '@/components/DomainRegistrarButtons';
import DomainStatusBadge from '@/components/DomainStatusBadge';
import { DomainStatusSection } from '@/components/DomainStatusSection';
import { DomainWhoisSection } from '@/components/DomainWhoisSection';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingMessage from '@/components/LoadingMessage';
import TLDSection from '@/components/TLDSection';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Domain, DomainStatus } from '@/models/domain';
import { TLD } from '@/models/tld';
import { WhoisInfo } from '@/models/whois';
import { apiClient } from '@/services/api';

export default function DomainPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const decodedSlug = useMemo(() => decodeURIComponent(slug), [slug]);
    const [domain, setDomain] = useState<Domain | null>(null);
    const [tldInfo, setTldInfo] = useState<TLD | null>(null);
    const [whoisInfo, setWhoisInfo] = useState<WhoisInfo | null>(null);
    const [hasError, setHasError] = useState(false);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            try {
                setHasError(false);
                setTldInfo(null);
                setWhoisInfo(null);

                const domainModel = new Domain(decodedSlug);
                setDomain(domainModel);

                const status = await apiClient.getDomainStatus(domainModel.getName());
                domainModel.setStatus(status);
                setDomain(domainModel);

                const whoisPromise = domainModel.isAvailable()
                    ? Promise.resolve(null)
                    : apiClient.getWhoisInfo(domainModel.getName());
                const tldPromise = apiClient.getDomainTLD(domainModel.getName());
                const [whoisData, tldData] = await Promise.all([whoisPromise, tldPromise]);

                setWhoisInfo(whoisData as WhoisInfo);
                setTldInfo(tldData as TLD);
            } catch {
                setHasError(true);
                setDomain(null);
            }
        });
    }, [decodedSlug]);

    if (hasError) {
        return <ErrorMessage />;
    }

    if (isPending) {
        return <LoadingMessage />;
    }

    if (!domain) {
        return <></>;
    }

    return (
        <div className="flex flex-col">
            <main className="m-auto flex w-full max-w-4xl flex-col items-center gap-5 px-2 py-5 md:py-10 md:px-10">
                <Badge className="text-xs font-medium">DOMAIN</Badge>

                <div className="w-full p-6">
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                        <h1 className="min-w-0 truncate text-xl font-semibold md:text-2xl">{domain.getName()}</h1>
                        <DomainStatusBadge status={domain.getStatus()} className="w-full md:w-auto" />
                    </div>

                    <div className="mt-4 space-y-4">
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
                </div>
            </main>
        </div>
    );
}
