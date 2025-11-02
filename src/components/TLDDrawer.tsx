'use client';

import { ExternalLink } from 'lucide-react';

import TLDTypeIcon from '@/components/TLDTypeIcon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { TLD, TLD_TYPE_DISPLAY_NAMES } from '@/models/tld';

interface TLDDrawerProps {
    tld: TLD;
    open: boolean;
    onClose: () => void;
}

function TLDDrawer({ tld, open, onClose }: TLDDrawerProps) {
    const tldDescription = tld.description ?? 'No additional information is available for this TLD, just yet.';
    const tldDisplayName = tld.type ? TLD_TYPE_DISPLAY_NAMES[tld.type] : null;

    return (
        <Drawer open={open} onOpenChange={(openState: boolean) => !openState && onClose()} direction="bottom">
            <DrawerContent className="min-h-[200px] p-6 md:p-10">
                <DrawerHeader className="px-0">
                    <DrawerTitle className="flex items-center justify-between">
                        <div className="flex max-w-[400px] items-center gap-2 truncate">.{tld.name}</div>
                        <div className="flex items-center gap-2">
                            {tld.type && (
                                <Badge variant="outline" className="flex items-center gap-1 uppercase">
                                    <TLDTypeIcon tld={tld} size="sm" />
                                    <span>{tldDisplayName}</span>
                                </Badge>
                            )}
                            {tld.yearEstablished && (
                                <Badge variant="outline" className="flex items-center gap-1 uppercase">
                                    <span>{tld.yearEstablished}</span>
                                </Badge>
                            )}
                        </div>
                    </DrawerTitle>
                </DrawerHeader>
                <div className="space-y-4">
                    <Separator />
                    <div className="space-y-4 text-xs">
                        <p className="gap-2 text-xs leading-relaxed">
                            <span>{tldDescription}</span>
                        </p>
                        <Button asChild variant="outline" className="w-full">
                            <a href={`/tlds/${tld.name}`} className="flex items-center gap-2">
                                <span className="w-full text-center">Learn more</span>
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

export default TLDDrawer;
