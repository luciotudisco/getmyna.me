'use client';

import { useEffect, useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Share2Icon } from 'lucide-react';

import DomainRegistrarButtons from '@/components/DomainRegistrarButtons';
import DomainStatusBadge from '@/components/DomainStatusBadge';
import { DomainStatusSection } from '@/components/DomainStatusSection';
import { DomainWhoisSection } from '@/components/DomainWhoisSection';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingMessage from '@/components/LoadingMessage';
import TLDSection from '@/components/TLDSection';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { Domain, DomainStatus } from '@/models/domain';
import { TLD } from '@/models/tld';
import { WhoisInfo } from '@/models/whois';
import { apiClient } from '@/services/api';

interface DomainDetailDrawerProps {
    domain: Domain;
    open: boolean;
    onClose: () => void;
}

function DomainDetailDrawer({ domain, open, onClose }: DomainDetailDrawerProps) {
    const [hasError, setHasError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [didCopyShareLink, setDidCopyShareLink] = useState(false);
    const [tldInfo, setTldInfo] = useState<TLD | null>(null);
    const [whoisInfo, setWhoisInfo] = useState<WhoisInfo | null>(null);

    const copyShareLink = async () => {
        const shareUrl =
            typeof window === 'undefined'
                ? `/domain/${encodeURIComponent(domain.getName())}`
                : `${window.location.origin}/domain/${encodeURIComponent(domain.getName())}`;

        try {
            await navigator.clipboard.writeText(shareUrl);
            setDidCopyShareLink(true);
            window.setTimeout(() => setDidCopyShareLink(false), 1500);
        } catch {
            // Fallback for browsers without clipboard permissions (or non-secure contexts).
            try {
                const textarea = document.createElement('textarea');
                textarea.value = shareUrl;
                textarea.setAttribute('readonly', '');
                textarea.style.position = 'fixed';
                textarea.style.top = '0';
                textarea.style.left = '0';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);

                setDidCopyShareLink(true);
                window.setTimeout(() => setDidCopyShareLink(false), 1500);
            } catch {
                // If even the fallback fails, we silently no-op.
            }
        }
    };

    useEffect(() => {
        if (!open) {
            return;
        }

        setWhoisInfo(null);
        setTldInfo(null);

        const fetchData = async () => {
            setLoading(true);
            try {
                setHasError(false);
                const isAvailable = domain.isAvailable();
                const whoisPromise = isAvailable ? Promise.resolve(null) : apiClient.getWhoisInfo(domain.getName());
                const tldPromise = apiClient.getDomainTLD(domain.getName());
                const [whoisData, tldData] = await Promise.all([whoisPromise, tldPromise]);
                setWhoisInfo(whoisData as WhoisInfo);
                setTldInfo(tldData as TLD);
            } catch {
                setHasError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [open, domain]);

    if (loading) {
        return (
            <Drawer open={open} onOpenChange={(openState: boolean) => !openState && onClose()} direction="bottom">
                <DrawerContent className="min-h-[400px] px-0 md:px-4 lg:px-10">
                    <VisuallyHidden>
                        <DrawerTitle>Loading domain details for {domain.getName()}</DrawerTitle>
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
                <DrawerContent className="min-h-[400px] px-0 md:px-4 lg:px-10">
                    <VisuallyHidden>
                        <DrawerTitle>Loading domain details for {domain.getName()}</DrawerTitle>
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
            <DrawerContent className="min-h-[400px] p-6 md:p-10">
                <DrawerHeader className="px-0">
                    <DrawerTitle className="flex items-center justify-between px-0">
                        <div className="flex max-w-[300px] items-center truncate">{domain.getName()}</div>
                        <DomainStatusBadge status={domain.getStatus()} className="min-w-[8rem]" />
                    </DrawerTitle>
                </DrawerHeader>
                <div className="space-y-4">
                    {domain.isAvailable() && (
                        <>
                            <Separator />
                            <DomainRegistrarButtons
                                domainName={domain.getName()}
                                pricing={tldInfo?.pricing || {}}
                                isPremiumDomain={domain.getStatus() === DomainStatus.PREMIUM}
                            />
                        </>
                    )}

                    {!domain.isAvailable() && (
                        <>
                            <Separator />
                            <DomainStatusSection status={domain.getStatus()} />
                        </>
                    )}

                    {!domain.isAvailable() && whoisInfo && whoisInfo.creationDate && (
                        <>
                            <Separator />
                            <DomainWhoisSection whoisInfo={whoisInfo} />
                        </>
                    )}

                    {tldInfo && (
                        <>
                            <Separator />
                            <TLDSection {...tldInfo} />
                        </>
                    )}
                </div>

                {domain.isAvailable() && (
                    <DrawerFooter className="mt-6 p-0">
                        <Button
                            type="button"
                            variant="outline"
                            className="min-h-10 w-full"
                            onClick={copyShareLink}
                            aria-label={`Copy share link for ${domain.getName()}`}
                        >
                            <Share2Icon className="mr-2 h-4 w-4" />
                            {didCopyShareLink ? 'Copied' : 'Share'}
                        </Button>
                    </DrawerFooter>
                )}
            </DrawerContent>
        </Drawer>
    );
}

export default DomainDetailDrawer;
