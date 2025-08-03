'use client';

import { useEffect, useState } from 'react';
import { Domain, DomainStatus as DomainStatusEnum } from '@/models/domain';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

interface DomainDetailDrawerProps {
    domain: Domain;
    status: DomainStatusEnum;
    open: boolean;
    onClose: () => void;
}

export function DomainDetailDrawer({ domain, status, open, onClose }: DomainDetailDrawerProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 768px)');
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        setIsMobile(mq.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    return (
        <Drawer open={open} onOpenChange={(o) => !o && onClose()} direction={isMobile ? 'bottom' : 'right'}>
            <DrawerContent className={isMobile ? '' : 'h-full w-80 rounded-none'}>
                <DrawerHeader>
                    <DrawerTitle>{domain.getName()}</DrawerTitle>
                </DrawerHeader>
                <div className="p-6 pt-0">
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
                </div>
            </DrawerContent>
        </Drawer>
    );
}

export default DomainDetailDrawer;

