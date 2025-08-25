'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Domain, DomainStatus as DomainStatusEnum, DOMAIN_STATUS_DESCRIPTIONS } from '@/models/domain';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import TldSection from '@/components/TldSection';
import { WhoisInfo } from '@/models/whois';
import { WhoisInfoSection } from '@/components/WhoisInfoSection';
import { Badge } from '@/components/ui/badge';
import DomainStatusBadge from '@/components/DomainStatusBadge';
import DomainRegistrarButtons from '@/components/DomainRegistrarButtons';
import { apiService } from '@/services/api';
import { TldInfo } from '@/models/tld';
import { DNSRecordType } from '@/models/dig';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface DomainDetailDrawerProps {
    domain: Domain;
    status: DomainStatusEnum;
    open: boolean;
    onClose: () => void;
}

export function DomainDetailDrawer({ domain, status, open, onClose }: DomainDetailDrawerProps) {
    const [hasARecord, setHasARecord] = useState(false);
    const [whoisInfo, setWhoisInfo] = useState<WhoisInfo | null>(null);
    const [tldInfo, setTldInfo] = useState<TldInfo | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }

        setHasARecord(false);
        setWhoisInfo(null);
        setTldInfo(null);

        const fetchData = async () => {
            setLoading(true);
            try {
                const tldPromise = apiService.getTldInfo(domain.getName());
                if (!domain.isAvailable()) {
                    const [digData, whoisData, tldData] = await Promise.all([
                        apiService.digDomain(domain.getName(), DNSRecordType.A),
                        apiService.getDomainWhois(domain.getName()),
                        tldPromise,
                    ]);

                    if (digData.records[DNSRecordType.A]?.length) {
                        setHasARecord(true);
                    } else {
                        setHasARecord(false);
                    }

                    setWhoisInfo(whoisData as WhoisInfo);
                    setTldInfo(tldData as TldInfo);
                } else {
                    const tldData = await tldPromise;
                    setTldInfo(tldData as TldInfo);
                }
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
                    <DrawerHeader>
                        <VisuallyHidden>
                            <DrawerTitle>Loading domain details</DrawerTitle>
                        </VisuallyHidden>
                    </DrawerHeader>
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-sm text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Hang tight, fetching domain details...</span>
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
                        <div className="flex items-center gap-2">
                            {domain.getLevel() === 1 && <Badge variant="secondary">Exact match</Badge>}
                            <DomainStatusBadge domain={domain} status={status} className="min-w-[8rem]" />
                        </div>
                    </DrawerTitle>
                </DrawerHeader>
                <div className="space-y-4 p-6 pt-0">
                    <Separator />

                    {domain.isAvailable() && (
                        <>
                            <DomainRegistrarButtons domainName={domain.getName()} />
                            <Separator />
                        </>
                    )}

                    <div>
                        <p className="text-xs">
                            <span className="font-bold">{status}:</span> {DOMAIN_STATUS_DESCRIPTIONS[status]}
                            {!domain.isAvailable() && hasARecord && (
                                <span className="ml-2">
                                    <a
                                        href={`https://${domain.getName()}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline"
                                    >
                                        Visit website
                                    </a>
                                </span>
                            )}
                        </p>
                    </div>
                    <Separator />

                    {!domain.isAvailable() && whoisInfo && (
                        <>
                            <WhoisInfoSection whoisInfo={whoisInfo} />
                            <Separator />
                        </>
                    )}

                    {tldInfo && (
                        <div>
                            <TldSection tld={domain.getTLD()} {...tldInfo} />
                        </div>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}

export default DomainDetailDrawer;
