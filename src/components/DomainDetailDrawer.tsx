'use client';

import { useEffect, useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import { DomainDetailSections } from '@/components/DomainDetailSections';
import DomainStatusBadge from '@/components/DomainStatusBadge';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingMessage from '@/components/LoadingMessage';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
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
                        <div className="flex max-w-[300px] items-center truncate">{domain.getName()}</div>
                        <DomainStatusBadge status={domain.getStatus()} className="min-w-[8rem]" />
                    </DrawerTitle>
                </DrawerHeader>
                <DomainDetailSections domain={domain} tldInfo={tldInfo} whoisInfo={whoisInfo} />
            </DrawerContent>
        </Drawer>
    );
}

export default DomainDetailDrawer;
