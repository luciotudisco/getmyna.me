'use client';

import { Button } from '@/components/ui/button';

interface DomainRegistrarButtonsProps {
    domainName: string;
}

const REGISTRARS = [
    {
        name: 'Porkbun',
        url: (domain: string) => `https://porkbun.com/checkout/search?q=${domain}`,
    },
    {
        name: 'Dynadot',
        url: (domain: string) => `https://www.dynadot.com/domain/search.html?domain=${domain}`,
    },
    {
        name: 'Name.com',
        url: (domain: string) => `https://www.name.com/domain/search/${domain}`,
    },
];

export function DomainRegistrarButtons({ domainName }: DomainRegistrarButtonsProps) {
    return (
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
            {REGISTRARS.map((registrar) => (
                <Button
                    key={registrar.name}
                    className="w-full bg-blue-400 text-white hover:bg-blue-600"
                    onClick={() => window.open(registrar.url(domainName), '_blank')}
                >
                    {registrar.name}
                </Button>
            ))}
        </div>
    );
}

export default DomainRegistrarButtons;
