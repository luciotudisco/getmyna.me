'use client';

import { useEffect, useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import DomainRegistrarButtons from '@/components/DomainRegistrarButtons';
import DomainStatusBadge from '@/components/DomainStatusBadge';
import { DomainStatusSection } from '@/components/DomainStatusSection';
import Loading from '@/components/Loading';
import TLDSection from '@/components/TldSection';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { DigInfo } from '@/models/dig';
import { Domain, DomainStatus as DomainStatusEnum } from '@/models/domain';
import { TLD } from '@/models/tld';
import { WhoisInfo } from '@/models/whois';
import { apiClient } from '@/services/api';

interface DomainDetailDrawerProps {
    domain: Domain;
    status: DomainStatusEnum;
    open: boolean;
    onClose: () => void;
}

export function DomainDetailDrawer({ domain, status, open, onClose }: DomainDetailDrawerProps) {
    const [whoisInfo, setWhoisInfo] = useState<WhoisInfo | null>(null);
    const [tldInfo, setTldInfo] = useState<TLD | null>(null);
    const [digInfo, setDigInfo] = useState<DigInfo | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }

        setWhoisInfo(null);
        setTldInfo(null);
        setDigInfo(null);

        const fetchData = async () => {
            setLoading(true);
            try {
                const isAvailable = domain.isAvailable();
                const whoisPromise = isAvailable ? Promise.resolve(null) : apiClient.getDomainWhois(domain.getName());
                const tldPromise = apiClient.getTldInfo(domain.getName());
                const digPromise = !isAvailable ? apiClient.digDomain(domain.getName()) : Promise.resolve(null);
                const [whoisData, tldData, digData] = await Promise.all([whoisPromise, tldPromise, digPromise]);
                setWhoisInfo(whoisData as WhoisInfo);
                setTldInfo(tldData as TLD);
                setDigInfo(digData as DigInfo);
            } catch {
                // Silently handle error
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [open, domain]);

    if (loading) {
        return (
            <Drawer open={open} onOpenChange={(openState: boolean) => !openState && onClose()} direction="bottom">
                <DrawerContent className="min-h-[400px]">
                    <VisuallyHidden>
                        <DrawerTitle>Loading domain details for {domain.getName()}</DrawerTitle>
                    </VisuallyHidden>
                    <div className="flex flex-1 items-center justify-center">
                        <Loading />
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Drawer open={open} onOpenChange={(openState: boolean) => !openState && onClose()} direction="bottom">
            <DrawerContent className="min-h-[400px]">
                <DrawerHeader>
                    <DrawerTitle className="flex items-center justify-between">
                        <div className="flex max-w-[400px] items-center gap-2 truncate">{domain.getName()}</div>
                        <DomainStatusBadge domain={domain} status={status} className="min-w-[8rem]" />
                    </DrawerTitle>
                </DrawerHeader>
                <div className="space-y-4 p-6 pt-0">
                    {domain.isAvailable() && (
                        <>
                            <Separator />
                            <DomainRegistrarButtons domainName={domain.getName()} pricing={tldInfo?.pricing || {}} />
                        </>
                    )}

                    {!domain.isAvailable() && (
                        <>
                            <Separator />
                            <DomainStatusSection status={status} whoisInfo={whoisInfo} digInfo={digInfo} />
                        </>
                    )}

                    {tldInfo && (
                        <>
                            <Separator />
                            <TLDSection {...tldInfo} />
                        </>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}

export default DomainDetailDrawer;
