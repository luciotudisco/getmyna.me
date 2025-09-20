'use client';

import { ExternalLinkIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Registrar, REGISTRARS_DOMAIN_SEARCH_URLS, TLDPricing } from '@/models/tld';

interface DomainRegistrarButtonsProps {
    domainName: string;
    pricing: Partial<Record<Registrar, TLDPricing>>;
}

export function DomainRegistrarButtons({ domainName, pricing }: DomainRegistrarButtonsProps) {
    if (Object.keys(pricing).length === 0) {
        return (
            <div className="flex items-center rounded-md bg-red-100 p-4 text-xs">
                <span>
                    Oops! This TLD seems to be flying under our radar. The registrar for this TLD is not yet supported.
                </span>
            </div>
        );
    }

    // Sort registrars by pricing in descending order and take first 3
    const sortedRegistrars = Object.entries(pricing)
        .sort(([, aPricing], [, bPricing]) => {
            const aPrice = aPricing?.registration || 0;
            const bPrice = bPricing?.registration || 0;
            return bPrice - aPrice; // DESC order (highest first)
        })
        .slice(0, 3); // Take first 3

    return (
        <div className="space-y-2">
            {sortedRegistrars.map(([registrarKey, registrarPricing]) => {
                const registrar = registrarKey as Registrar;
                const searchUrl = REGISTRARS_DOMAIN_SEARCH_URLS[registrar];
                return (
                    <div key={registrar} className="flex items-center gap-3">
                        <Button
                            className="min-h-10 flex-1 bg-blue-400 text-white hover:bg-blue-600"
                            onClick={() => window.open(searchUrl(domainName), '_blank')}
                        >
                            <ExternalLinkIcon className="mr-2 h-4 w-4" />
                            <div className="flex flex-1 items-center justify-between font-extrabold">
                                {registrar}
                                <div className="min-w-[100px] text-right text-xs">
                                    {registrarPricing && registrarPricing.registration && registrarPricing.renewal ? (
                                        <div>
                                            <div className="font-extrabold text-white">
                                                ${registrarPricing.registration}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-xs font-extralight text-white">No pricing data</div>
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
