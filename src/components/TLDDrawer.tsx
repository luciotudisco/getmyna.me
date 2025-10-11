'use client';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import TLDSection from '@/components/TLDSection';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { TLD } from '@/models/tld';

interface TLDDrawerProps {
    tld: TLD;
    open: boolean;
    onClose: () => void;
}

function TLDDrawer({ tld, open, onClose }: TLDDrawerProps) {
    return (
        <Drawer open={open} onOpenChange={(openState: boolean) => !openState && onClose()} direction="bottom">
            <DrawerContent className="min-h-[400px]">
                <DrawerHeader>
                    <VisuallyHidden>
                        <DrawerTitle>TLD details for .{tld.name}</DrawerTitle>
                    </VisuallyHidden>
                    <DrawerTitle className="flex items-center justify-between">
                        <div className="flex max-w-[400px] items-center gap-2 truncate">.{tld.name}</div>
                    </DrawerTitle>
                </DrawerHeader>
                <div className="space-y-4 p-6 pt-0">
                    <Separator />
                    <TLDSection {...tld} />
                </div>
            </DrawerContent>
        </Drawer>
    );
}

export default TLDDrawer;
