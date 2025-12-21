'use client';

import { ExternalLinkIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Registrar, REGISTRAR_DISPLAY_NAMES, REGISTRAR_DOMAIN_SEARCH_URLS, TLDPricing } from '@/models/tld';

interface DomainRegistrarButtonsProps {
    domainName: string;
    pricing: Partial<Record<Registrar, TLDPricing>>;
    isPremiumDomain: boolean;
}

function DomainRegistrarButtons({ domainName, pricing, isPremiumDomain }: DomainRegistrarButtonsProps) {
    if (Object.keys(pricing).length === 0) {
        return (
            <div className="flex items-center rounded-md bg-stone-100 p-4 text-xs">
                <span>
                    We are not aware of any registrars that support this TLD. You may need to do some research to find
                    one.
                </span>
            </div>
        );
    }

    // Sort registrars by pricing in ASC order and take first 3
    const sortedRegistrars = Object.entries(pricing)
        .sort(([, aPricing], [, bPricing]) => {
            const aPrice = aPricing?.registration || Infinity;
            const bPrice = bPricing?.registration || Infinity;
            return aPrice - bPrice;
        })
        .slice(0, 3);

    return (
        <div className="space-y-2">
            {sortedRegistrars.map(([registrarKey, registrarPricing]) => {
                const registrar = registrarKey as Registrar;
                const searchUrl = REGISTRAR_DOMAIN_SEARCH_URLS[registrar];
                const displayName = REGISTRAR_DISPLAY_NAMES[registrar];
                const registrationPrice = registrarPricing?.registration;
                const hasPricing = typeof registrationPrice === 'number';
                const roundedRegistrationPrice = hasPricing ? `$${registrationPrice.toFixed(2)}` : null;
                return (
                    <div key={registrar} className="flex items-center gap-3">
                        <Button
                            className="min-h-10 flex-1 bg-blue-500 text-white hover:bg-blue-700"
                            onClick={() => window.open(searchUrl(domainName), '_blank')}
                        >
                            <ExternalLinkIcon className="mr-2 h-4 w-4" />
                            <div className="flex flex-1 items-center justify-between font-extrabold">
                                {displayName}
                                <div className="min-w-[100px] text-right text-xs">
                                    {hasPricing ? (
                                        <div>
                                            {isPremiumDomain ? (
                                                <div className="mb-1 text-xs font-extralight text-white/70">
                                                    premium price
                                                </div>
                                            ) : (
                                                <div className="font-extrabold text-white">
                                                    <span className="text-xs text-white/70">from</span>{' '}
                                                    {roundedRegistrationPrice}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-xs font-extralight text-white/70">No pricing data</div>
                                    )}
                                </div>
                            </div>
                        </Button>
                    </div>
                );
            })}
        </div>
    );
}

export default DomainRegistrarButtons;
