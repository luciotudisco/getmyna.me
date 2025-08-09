'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { Domain, DomainStatus as DomainStatusEnum, DOMAIN_STATUS_DESCRIPTIONS } from '@/models/domain';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { getTldInfo, TldInfo } from '@/services/tld-info';
import { DigInfo } from '@/models/dig';
import { WhoisInfo } from '@/models/whois';
import { Badge } from '@/components/ui/badge';
import DomainStatusBadge from '@/components/DomainStatusBadge';

interface DomainDetailDrawerProps {
    domain: Domain;
    status: DomainStatusEnum;
    open: boolean;
    onClose: () => void;
}

export function DomainDetailDrawer({ domain, status, open, onClose }: DomainDetailDrawerProps) {
    const [tldInfo, setTldInfo] = useState<TldInfo | null>(null);
    const [hasARecord, setHasARecord] = useState(false);
    const [whoisInfo, setWhoisInfo] = useState<WhoisInfo | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getTldInfo(domain.getTLD()).then(setTldInfo);
    }, [domain]);

    useEffect(() => {
        if (!open || domain.isAvailable()) {
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const [digResponse, whoisResponse] = await Promise.all([
                    axios.get('/api/domains/dig', {
                        params: { domain: domain.getName() },
                    }),
                    axios.get('/api/domains/whois', {
                        params: { domain: domain.getName() },
                    }),
                ]);

                const digData = digResponse.data as DigInfo;
                if (digData.result.records.A && digData.result.records.A.length > 0) {
                    setHasARecord(true);
                } else {
                    setHasARecord(false);
                }

                setWhoisInfo(whoisResponse.data as WhoisInfo);
            } catch (error) {
                console.error('Error fetching domain details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [open, domain]);

    if (!domain.isAvailable() && loading) {
        return (
            <Drawer open={open} onOpenChange={(openState: boolean) => !openState && onClose()} direction="bottom">
                <DrawerContent className="min-h-[400px]">
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
                            <div className="space-y-2">
                                <Button
                                    className="w-full bg-blue-400 text-white hover:bg-blue-600"
                                    onClick={() =>
                                        window.open(
                                            `https://www.godaddy.com/domainsearch/find?domainToCheck=${domain.getName()}`,
                                            '_blank',
                                        )
                                    }
                                >
                                    GoDaddy
                                </Button>
                                <Button
                                    className="w-full bg-blue-400 text-white hover:bg-blue-600"
                                    onClick={() =>
                                        window.open(
                                            `https://www.namecheap.com/domains/registration/results/?domain=${domain.getName()}`,
                                            '_blank',
                                        )
                                    }
                                >
                                    Namecheap
                                </Button>
                                <Button
                                    className="w-full bg-blue-400 text-white hover:bg-blue-600"
                                    onClick={() =>
                                        window.open(
                                            `https://porkbun.com/checkout/search?q=${domain.getName()}`,
                                            '_blank',
                                        )
                                    }
                                >
                                    Porkbun
                                </Button>
                            </div>
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
                            <Separator />
                        </>
                    )}

                    <div>
                        {tldInfo ? (
                            <p className="text-xs">
                                <span className="font-bold">.{domain.getTLD()}:</span> {tldInfo.description}{' '}
                                <a
                                    href={tldInfo.wikipediaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    Learn more on Wikipedia
                                </a>
                            </p>
                        ) : (
                            <p className="text-sm">Loading TLD info...</p>
                        )}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

export default DomainDetailDrawer;
