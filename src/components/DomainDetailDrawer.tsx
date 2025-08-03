'use client';

import { useEffect, useState } from 'react';
import { Domain, DomainStatus as DomainStatusEnum } from '@/models/domain';
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
                    <DrawerTitle>{domain.getName()}</DrawerTitle>
                </DrawerHeader>
                <div className="p-6 pt-0 space-y-4">
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

                    <Separator />

                    <div className="text-sm">
                        <p className="font-medium">Top-level domain</p>
                        <p className="mb-2">.{domain.getTLD()}</p>
                        {tldInfo ? (
                            <p>
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
                            <p>Loading TLD info...</p>
                        )}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

export default DomainDetailDrawer;

