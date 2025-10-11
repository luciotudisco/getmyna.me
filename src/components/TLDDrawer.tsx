'use client';

import { useEffect, useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import ErrorMessage from '@/components/ErrorMessage';
import LoadingMessage from '@/components/LoadingMessage';
import TLDSection from '@/components/TLDSection';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { TLD } from '@/models/tld';
import { apiClient } from '@/services/api';

interface TLDDrawerProps {
    tld: TLD;
    open: boolean;
    onClose: () => void;
}

function TLDDrawer({ tld, open, onClose }: TLDDrawerProps) {
    const [hasError, setHasError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tldInfo, setTldInfo] = useState<TLD | null>(null);

    useEffect(() => {
        if (!open || !tld.name) {
            return;
        }

        setTldInfo(null);

        const fetchData = async () => {
            setLoading(true);
            try {
                setHasError(false);
                const tldData = await apiClient.getTLD(tld.name!);
                setTldInfo(tldData as TLD);
            } catch {
                setHasError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [open, tld.name]);

    if (loading) {
        return (
            <Drawer open={open} onOpenChange={(openState: boolean) => !openState && onClose()} direction="bottom">
                <DrawerContent className="min-h-[400px]">
                    <VisuallyHidden>
                        <DrawerTitle>Loading TLD details for .{tld.name}</DrawerTitle>
                    </VisuallyHidden>
                    <div className="flex flex-1 items-center justify-center">
                        <LoadingMessage />
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    if (hasError) {
        return (
            <Drawer open={open} onOpenChange={(openState: boolean) => !openState && onClose()} direction="bottom">
                <DrawerContent className="min-h-[400px]">
                    <VisuallyHidden>
                        <DrawerTitle>Loading TLD details for .{tld.name}</DrawerTitle>
                    </VisuallyHidden>
                    <div className="flex flex-1 items-center justify-center">
                        <ErrorMessage />
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
                        <div className="flex max-w-[400px] items-center gap-2 truncate">.{tld.name}</div>
                    </DrawerTitle>
                </DrawerHeader>
                <div className="space-y-4 p-6 pt-0">
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

export default TLDDrawer;
