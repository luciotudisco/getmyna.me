'use client';

import { useEffect, useState } from 'react';
import {
    Domain,
    DomainStatus as DomainStatusEnum,
    DOMAIN_STATUS_DESCRIPTIONS,
} from '@/models/domain';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { getTldInfo, TldInfo } from '@/services/tld-info';

interface DomainDetailDrawerProps {
    domain: Domain;
    status: DomainStatusEnum;
    open: boolean;
    onClose: () => void;
}

export function DomainDetailDrawer({ domain, status, open, onClose }: DomainDetailDrawerProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [tldInfo, setTldInfo] = useState<TldInfo | null>(null);

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

                    <div>
                        <p className="text-xs">
                            <span className="font-bold">{status}:</span>{' '}
                            {DOMAIN_STATUS_DESCRIPTIONS[status]}
                        </p>
                    </div>

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

                    {domain.isAvailable() && (
                        <>
                            <Separator />
                            <div className="text-xs">
                                <p className="font-bold">Buy this domain:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>
                                        <a
                                            href={`https://www.godaddy.com/domainsearch/find?domainToCheck=${domain.getName()}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                            GoDaddy
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href={`https://www.namecheap.com/domains/registration/results/?domain=${domain.getName()}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                            Namecheap
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href={`https://domains.google.com/registrar/search?searchTerm=${domain.getName()}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                            Google Domains
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}

export default DomainDetailDrawer;

