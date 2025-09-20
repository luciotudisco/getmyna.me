'use client';

import { useEffect, useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import DomainRegistrarButtons from '@/components/DomainRegistrarButtons';
import DomainStatusBadge from '@/components/DomainStatusBadge';
import { DomainStatusSection } from '@/components/DomainStatusSection';
import Loading from '@/components/Loading';
import TLDSection from '@/components/TldSection';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { DigInfo, DNSRecordType } from '@/models/dig';
import { Domain, DomainStatus as DomainStatusEnum } from '@/models/domain';
import { TLD } from '@/models/tld';
import { WhoisInfo } from '@/models/whois';
import { apiService } from '@/services/api';

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

    // Helper function to check if there are valid A/AAAA records
    const hasValidARecords = (digInfo: DigInfo | null): boolean => {
        if (!digInfo?.records) return false;
        const aRecords = digInfo.records[DNSRecordType.A] || [];
        const aaaaRecords = digInfo.records[DNSRecordType.AAAA] || [];
        return aRecords.length > 0 || aaaaRecords.length > 0;
    };

    // Helper function to check if there are valid MX records
    const hasValidMXRecords = (digInfo: DigInfo | null): boolean => {
        if (!digInfo?.records) return false;
        const mxRecords = digInfo.records[DNSRecordType.MX] || [];
        return mxRecords.length > 0;
    };

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
                const whoisPromise = isAvailable ? Promise.resolve(null) : apiService.getDomainWhois(domain.getName());
                const tldPromise = apiService.getTldInfo(domain.getName());
                const digPromise = isAvailable ? apiService.digDomain(domain.getName()) : Promise.resolve(null);
                const [whoisData, tldData, digData] = await Promise.all([whoisPromise, tldPromise, digPromise]);
                setWhoisInfo(whoisData as WhoisInfo);
                setTldInfo(tldData as TLD);
                setDigInfo(digData as DigInfo);
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
                    {domain.isAvailable() && digInfo && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {hasValidARecords(digInfo) && <Badge className="text-xs">Valid A/AAAA Records</Badge>}
                            {hasValidMXRecords(digInfo) && <Badge className="text-xs">Valid MX Records</Badge>}
                        </div>
                    )}
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
                            <DomainStatusSection status={status} whoisInfo={whoisInfo} />
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
