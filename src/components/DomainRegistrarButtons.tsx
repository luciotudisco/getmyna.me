'use client';

import { Button } from '@/components/ui/button';

interface DomainRegistrarButtonsProps {
    domainName: string;
}

const REGISTRARS = [
    {
        name: 'GoDaddy',
        url: (domain: string) => `https://www.godaddy.com/domainsearch/find?domainToCheck=${domain}`,
    },
    {
        name: 'Namecheap',
        url: (domain: string) => `https://www.namecheap.com/domains/registration/results/?domain=${domain}`,
    },
    {
        name: 'Porkbun',
        url: (domain: string) => `https://porkbun.com/checkout/search?q=${domain}`,
    },
];

export function DomainRegistrarButtons({ domainName }: DomainRegistrarButtonsProps) {
    return (
        <div className="space-y-2">
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

