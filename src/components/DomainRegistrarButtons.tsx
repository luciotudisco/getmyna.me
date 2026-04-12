'use client';

import { ChevronRight } from 'lucide-react';

import {
    Registrar,
    REGISTRAR_DISPLAY_NAMES,
    REGISTRAR_DOMAIN_SEARCH_URLS,
    REGISTRAR_ICON_COLORS,
    TLDPricing,
} from '@/models/tld';

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

    const sortedRegistrars = Object.entries(pricing)
        .sort(([, aPricing], [, bPricing]) => {
            const aPrice = aPricing?.registration || Infinity;
            const bPrice = bPricing?.registration || Infinity;
            return aPrice - bPrice;
        })
        .slice(0, 3);

    return (
        <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Buy at a registrar
            </span>
            <div className="space-y-3">
                {sortedRegistrars.map(([registrarKey, registrarPricing]) => {
                    const registrar = registrarKey as Registrar;
                    const searchUrl = REGISTRAR_DOMAIN_SEARCH_URLS[registrar];
                    const displayName = REGISTRAR_DISPLAY_NAMES[registrar];
                    const initials = displayName.slice(0, 2).toUpperCase();
                    const iconColor = REGISTRAR_ICON_COLORS[registrar];
                    const registrationPrice = registrarPricing?.registration;
                    const hasPricing = typeof registrationPrice === 'number';
                    return (
                        <a
                            key={registrar}
                            href={searchUrl(domainName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-400 hover:bg-blue-50/40 hover:shadow-sm"
                        >
                            <div
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${iconColor}`}
                            >
                                {initials}
                            </div>
                            <div className="flex min-w-0 flex-1 items-center justify-between">
                                <span className="text-base font-bold text-gray-900">{displayName}</span>
                                <div className="flex items-center gap-2">
                                    {hasPricing && (
                                        <span className="text-sm font-medium text-gray-500">
                                            {isPremiumDomain ? 'premium' : `$${registrationPrice.toFixed(2)}`}
                                        </span>
                                    )}
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}

export default DomainRegistrarButtons;
