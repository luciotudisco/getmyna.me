'use client';

import { Button } from '@/components/ui/button';
import { Registrar, TLDPricing } from '@/models/tld';
import { ExternalLinkIcon } from 'lucide-react';

interface DomainRegistrarButtonsProps {
    domainName: string;
    pricing: Partial<Record<Registrar, TLDPricing>>;
}

const REGISTRARS = [
    {
        name: 'Porkbun',
        key: Registrar.PORKBUN,
        url: (domain: string) => `https://porkbun.com/checkout/search?q=${domain}`,
    },
    {
        name: 'Dynadot',
        key: 'DYNADOT' as Registrar,
        url: (domain: string) => `https://www.dynadot.com/domain/search.html?domain=${domain}`,
    },
    {
        name: 'Name.com',
        key: 'NAMECOM' as Registrar,
        url: (domain: string) => `https://www.name.com/domain/search/${domain}`,
    },
];

export function DomainRegistrarButtons({ domainName, pricing }: DomainRegistrarButtonsProps) {
    console.log(pricing);
    return (
        <div className="space-y-2">
            {REGISTRARS.map((registrar) => {
                const registrarPricing = pricing?.[registrar.key];

                return (
                    <div key={registrar.name} className="flex items-center gap-3">
                        <Button
                            className="min-h-14 flex-1 bg-blue-400 text-white hover:bg-blue-600"
                            onClick={() => window.open(registrar.url(domainName), '_blank')}
                        >
                            <ExternalLinkIcon className="mr-2 h-4 w-4" />
                            <div className="flex flex-1 items-center justify-between font-extrabold">
                                {registrar.name}
                                <div className="min-w-[100px] text-right text-xs text-gray-600">
                                    {registrarPricing && (
                                        <div>
                                            <div className="font-extrabold text-white">
                                                ${registrarPricing.registration}
                                            </div>
                                            <div className="text-xs font-extralight text-white">
                                                renewal ${registrarPricing.renewal}
                                            </div>
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
