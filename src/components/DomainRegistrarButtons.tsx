'use client';

import { Button } from '@/components/ui/button';
import { Registrar, TLDPricing, REGISTRARS_DOMAIN_SEARCH_URLS } from '@/models/tld';
import { ExternalLinkIcon, LocateOffIcon } from 'lucide-react';

interface DomainRegistrarButtonsProps {
    domainName: string;
    pricing: Partial<Record<Registrar, TLDPricing>>;
}

export function DomainRegistrarButtons({ domainName, pricing }: DomainRegistrarButtonsProps) {
    if (Object.keys(pricing).length === 0) {
        return (
            <div className="flex items-center gap-3 p-4 bg-red-100 rounded-md text-xs">
                <LocateOffIcon className="h-5 w-5" />
                <span>
                    Oops! This TLD seems to be flying under our radar. The registrar for this TLD is not yet supported.
                </span>
            </div>
        );
    }
    
    return (
        <div className="space-y-2">
            {Object.keys(pricing).map((registrarKey) => {
                const registrar = registrarKey as Registrar;
                const registrarPricing = pricing?.[registrar];
                const searchUrl = REGISTRARS_DOMAIN_SEARCH_URLS[registrar];
                return (
                    <div key={registrar} className="flex items-center gap-3">
                        <Button
                            className="min-h-14 flex-1 bg-blue-400 text-white hover:bg-blue-600"
                            onClick={() => window.open(searchUrl(domainName), '_blank')}
                        >
                            <ExternalLinkIcon className="mr-2 h-4 w-4" />
                            <div className="flex flex-1 items-center justify-between font-extrabold">
                                {registrar}
                                <div className="min-w-[100px] text-right text-xs">
                                    {registrarPricing ? (
                                        <div>
                                            <div className="font-extrabold text-white">
                                                ${registrarPricing.registration}
                                            </div>
                                            <div className="text-xs font-extralight text-white">
                                                renewal ${registrarPricing.renewal}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-gray-300">
                                            No pricing data
                                        </div>
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
