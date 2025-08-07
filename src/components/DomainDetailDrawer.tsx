'use client';

import { useEffect, useState } from 'react';
import {
    Domain,
    DomainStatus as DomainStatusEnum,
    DOMAIN_STATUS_DESCRIPTIONS,
} from '@/models/domain';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { getTldInfo, TldInfo } from '@/services/tld-info';

interface DigInfo {
    result: {
        domain: string;
        records: Record<string, string[]>;
    };
}

interface DomainDetailDrawerProps {
    domain: Domain;
    status: DomainStatusEnum;
    open: boolean;
    onClose: () => void;
}

export function DomainDetailDrawer({ domain, status, open, onClose }: DomainDetailDrawerProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [tldInfo, setTldInfo] = useState<TldInfo | null>(null);
    const [digInfo, setDigInfo] = useState<DigInfo | null>(null);
    const [digError, setDigError] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 768px)');
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        setIsMobile(mq.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    useEffect(() => {
        getTldInfo(domain.getTLD()).then(setTldInfo);
    }, [domain]);

    useEffect(() => {
        if (!open || domain.isAvailable()) {
            return;
        }
        const fetchDig = async () => {
            try {
                setDigError(false);
                setDigInfo(null);
                const response = await fetch(`/api/domains/dig?domain=${domain.getName()}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setDigInfo(data);
            } catch (error) {
                console.error('Error fetching DNS data:', error);
                setDigError(true);
            }
        };
        fetchDig();
    }, [open, domain]);

    return (
        <Drawer
            open={open}
            onOpenChange={(openState: boolean) => !openState && onClose()}
            direction={isMobile ? 'bottom' : 'right'}
        >
            <DrawerContent className={isMobile ? '' : 'h-full w-80 rounded-none'}>
                <DrawerHeader>
                    <DrawerTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {domain.getName()}
                            {domain.getLevel() === 1 && (
                                <Badge variant="secondary">First level domain</Badge>
                            )}
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
                <div className="p-6 pt-0 space-y-4">
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
                            <span className="font-bold">{status}:</span>{' '}
                            {DOMAIN_STATUS_DESCRIPTIONS[status]}
                        </p>
                    </div>

                    {!domain.isAvailable() && (
                        <>
                            <Separator />
                            <div>
                                {digInfo ? (
                                    <>
                                        {digInfo.result.records.A && digInfo.result.records.A.length > 0 && (
                                            <p className="text-xs mt-2">
                                                <a
                                                    href={`https://${domain.getName()}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 underline"
                                                >
                                                    Visit website
                                                </a>
                                            </p>
                                        )}
                                        <p className="text-xs font-bold mt-2">DNS Records:</p>
                                        {Object.entries(digInfo.result.records).map(([type, values]) => (
                                            <p key={type} className="text-xs">
                                                <span className="font-bold">{type}:</span>{' '}
                                                {values.join(', ')}
                                            </p>
                                        ))}
                                    </>
                                ) : digError ? (
                                    <p className="text-xs">Failed to load DNS info</p>
                                ) : (
                                    <p className="text-sm">Loading DNS info...</p>
                                )}
                            </div>
                        </>
                    )}

                    <Separator />

                    <div>
                        {tldInfo ? (
                            <p className="text-xs">
                                <span className="font-bold">.{domain.getTLD()}:</span>{' '}
                                {tldInfo.description}{' '}
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

