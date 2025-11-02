'use client';

import { useEffect, useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import DomainRegistrarButtons from '@/components/DomainRegistrarButtons';
import DomainStatusBadge from '@/components/DomainStatusBadge';
import { DomainStatusSection } from '@/components/DomainStatusSection';
import { DomainWhoisSection } from '@/components/DomainWhoisSection';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingMessage from '@/components/LoadingMessage';
import TLDSection from '@/components/TLDSection';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { Domain, DomainStatus } from '@/models/domain';
import { TLD } from '@/models/tld';
import { WhoisInfo } from '@/models/whois';
import { apiClient } from '@/services/api';

interface DomainDetailDrawerProps {
    domain: Domain;
    open: boolean;
    onClose: () => void;
}

function DomainDetailDrawer({ domain, open, onClose }: DomainDetailDrawerProps) {
    const [hasError, setHasError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tldInfo, setTldInfo] = useState<TLD | null>(null);
    const [whoisInfo, setWhoisInfo] = useState<WhoisInfo | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        setWhoisInfo(null);
        setTldInfo(null);

        const fetchData = async () => {
            setLoading(true);
            try {
                setHasError(false);
                const isAvailable = domain.isAvailable();
                const whoisPromise = isAvailable ? Promise.resolve(null) : apiClient.getWhoisInfo(domain.getName());
                const tldPromise = apiClient.getDomainTLD(domain.getName());
                const [whoisData, tldData] = await Promise.all([whoisPromise, tldPromise]);
                setWhoisInfo(whoisData as WhoisInfo);
                setTldInfo(tldData as TLD);
            } catch {
                setHasError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [open, domain]);

    if (loading) {
        return (
            <Drawer open={open} onOpenChange={(openState: boolean) => !openState && onClose()} direction="bottom">
                <DrawerContent className="min-h-[400px] px-0 md:px-4 lg:px-10">
                    <VisuallyHidden>
                        <DrawerTitle>Loading domain details for {domain.getName()}</DrawerTitle>
                    </VisuallyHidden>
                    <div className="flex flex-1 items-center justify-center">
                        <LoadingMessage />
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    if (hasError) {
        return (
            <Drawer open={open} onOpenChange={(openState: boolean) => !openState && onClose()} direction="bottom">
                <DrawerContent className="min-h-[400px] px-0 md:px-4 lg:px-10">
                    <VisuallyHidden>
                        <DrawerTitle>Loading domain details for {domain.getName()}</DrawerTitle>
                    </VisuallyHidden>
                    <div className="flex flex-1 items-center justify-center">
                        <ErrorMessage />
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Drawer open={open} onOpenChange={(openState: boolean) => !openState && onClose()} direction="bottom">
            <DrawerContent className="min-h-[400px] p-6 md:p-10">
                <DrawerHeader className="px-0">
                    <DrawerTitle className="flex items-center justify-between px-0">
                        <div className="flex max-w-[400px] items-center truncate">{domain.getName()}</div>
                        <DomainStatusBadge status={domain.getStatus()} className="min-w-[8rem]" />
                    </DrawerTitle>
                </DrawerHeader>
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
            </DrawerContent>
        </Drawer>
    );
}

export default DomainDetailDrawer;
