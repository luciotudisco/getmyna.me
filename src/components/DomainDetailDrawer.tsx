'use client';

import { useEffect, useState } from 'react';
import { Domain, DomainStatus as DomainStatusEnum, DOMAIN_STATUS_DESCRIPTIONS } from '@/models/domain';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { getTldInfo, TldInfo } from '@/services/tld-info';
import { DigInfo } from '@/models/dig';
import { WhoisInfo } from '@/models/whois';

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

    useEffect(() => {
        getTldInfo(domain.getTLD()).then(setTldInfo);
    }, [domain]);

    useEffect(() => {
        if (!open || domain.isAvailable()) {
            return;
        }

        const fetchDig = async () => {
            try {
                setHasARecord(false);
                const response = await fetch(`/api/domains/dig?domain=${domain.getName()}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: DigInfo = await response.json();
                if (data.result.records.A && data.result.records.A.length > 0) {
                    setHasARecord(true);
                }
            } catch (error) {
                console.error('Error fetching DNS data:', error);
            }
        };

        const fetchWhois = async () => {
            try {
                const response = await fetch(`/api/domains/whois?domain=${domain.getName()}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: WhoisInfo = await response.json();
                setWhoisInfo(data);
            } catch (error) {
                console.error('Error fetching whois data:', error);
            }
        };

        fetchDig();
        fetchWhois();
    }, [open, domain]);

    return (
        <Drawer open={open} onOpenChange={(openState: boolean) => !openState && onClose()} direction="bottom">
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {domain.getName()}
                            {domain.getLevel() === 1 && <Badge variant="secondary">First level domain</Badge>}
                        </div>
                        <Badge
                            className={`inline-flex h-7 min-w-[8rem] items-center justify-center px-3 ${
                                status === DomainStatusEnum.unknown
                                    ? 'bg-gray-400'
                                    : status === DomainStatusEnum.error
                                      ? 'bg-yellow-400 hover:bg-yellow-500'
                                      : domain.isAvailable()
                                        ? 'bg-green-400 hover:bg-green-600'
                                        : 'bg-red-400 hover:bg-red-600'
                            }`}
                        >
                            {status === DomainStatusEnum.unknown
                                ? 'Checking'
                                : status === DomainStatusEnum.error
                                  ? 'Error'
                                  : domain.isAvailable()
                                    ? 'Available'
                                    : 'Taken'}
                        </Badge>
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
