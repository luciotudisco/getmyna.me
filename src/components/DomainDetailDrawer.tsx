'use client';

import { useEffect, useState } from 'react';
import Loading from '@/components/Loading';
import { Domain, DomainStatus as DomainStatusEnum, DOMAIN_STATUS_DESCRIPTIONS } from '@/models/domain';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import TLDSection from '@/components/TLDSection';
import { WhoisInfo } from '@/models/whois';
import { WhoisInfoSection } from '@/components/WhoisInfoSection';
import DomainStatusBadge from '@/components/DomainStatusBadge';
import DomainRegistrarButtons from '@/components/DomainRegistrarButtons';
import { apiService } from '@/services/api';
import { TLD } from '@/models/tld';

interface DomainDetailDrawerProps {
    domain: Domain;
    status: DomainStatusEnum;
    open: boolean;
    onClose: () => void;
}

export function DomainDetailDrawer({ domain, status, open, onClose }: DomainDetailDrawerProps) {
    const [whoisInfo, setWhoisInfo] = useState<WhoisInfo | null>(null);
    const [tldInfo, setTldInfo] = useState<TLD | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }

        setWhoisInfo(null);
        setTldInfo(null);

        const fetchData = async () => {
            setLoading(true);
            try {
                const isAvailable = domain.isAvailable();
                const whoisPromise = isAvailable ? Promise.resolve(null) : apiService.getDomainWhois(domain.getName());
                const tldPromise = apiService.getTldInfo(domain.getName());
                const [whoisData, tldData] = await Promise.all([whoisPromise, tldPromise]);
                setWhoisInfo(whoisData as WhoisInfo);
                setTldInfo(tldData as TLD);
            } catch (error) {
                console.error('Error fetching domain details:', error);
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
                        <div className="flex items-center gap-2">{domain.getName()}</div>
                        <DomainStatusBadge domain={domain} status={status} className="min-w-[8rem]" />
                    </DrawerTitle>
                </DrawerHeader>
                <div className="space-y-4 p-6 pt-0">
                    {domain.isAvailable() && (
                        <>
                            <Separator />
                            <DomainRegistrarButtons domainName={domain.getName()} />
                        </>
                    )}

                    {!domain.isAvailable() && (
                        <>
                            <Separator />
                            <h3 className="text-xs font-medium uppercase text-muted-foreground">STATUS</h3>
                            <p className="text-xs">
                                <span className="font-bold">{status}:</span> {DOMAIN_STATUS_DESCRIPTIONS[status]}
                            </p>
                        </>
                    )}

                    {!domain.isAvailable() && whoisInfo && (
                        <>
                            <Separator />
                            <h3 className="text-xs font-medium uppercase text-muted-foreground">WHOIS INFO</h3>
                            <WhoisInfoSection whoisInfo={whoisInfo} />
                        </>
                    )}

                    {tldInfo && (
                        <>
                            <Separator />
                            <h3 className="text-xs font-medium uppercase text-muted-foreground">TLD INFO</h3>
                            <TLDSection tld={domain.getTLD()} {...tldInfo} />
                        </>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}

export default DomainDetailDrawer;
