'use client';

import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { TLD, TLD_TYPE_DISPLAY_NAMES, TLD_TYPE_ICONS } from '@/models/tld';

interface TLDDrawerProps {
    tld: TLD;
    open: boolean;
    onClose: () => void;
}

function TLDDrawer({ tld, open, onClose }: TLDDrawerProps) {
    const ianaURL = `https://www.iana.org/domains/root/db/${tld.punycodeName}.html`;
    const tldDescription = tld.description ?? 'No additional information is available for this TLD, just yet.';
    const tldDisplayName = tld.type ? TLD_TYPE_DISPLAY_NAMES[tld.type] : null;
    const Icon = tld.type ? TLD_TYPE_ICONS[tld.type] : null;

    return (
        <Drawer open={open} onOpenChange={(openState: boolean) => !openState && onClose()} direction="bottom">
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="flex items-center justify-between">
                        <div className="flex max-w-[400px] items-center gap-2 truncate">.{tld.name}</div>
                        <div className="flex items-center gap-2">
                            {tld.type && (
                                <Badge variant="outline" className="flex items-center gap-1 uppercase">
                                    {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
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
                <div className="space-y-4 p-6 pt-0">
                    <Separator />
                    <div className="space-y-2 text-xs">
                        <p className="gap-2 text-xs leading-relaxed">
                            <span>{tldDescription}</span>{' '}
                            <a
                                href={ianaURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground underline"
                            >
                                Learn more
                            </a>
                        </p>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

export default TLDDrawer;
