'use client';

import { TLD } from '@/models/tld';

export default function TLDSection({ name, punycodeName, description, type }: TLD) {
    console.log('punycodeName', punycodeName);
    console.log('name', name);
    const ianaURL = `https://www.iana.org/domains/root/db/${punycodeName}.html`;
    const tldDescription = description ?? 'No additional information is available for this TLD.';
    return (
        <p className="gap-2 text-xs leading-relaxed">
            {name !== punycodeName && (
                <span className="font-bold text-white">
                    <span className="rounded-md bg-slate-600 p-0.5 font-bold">INTERNATIONALIZED DOMAIN NAME (IDN)</span>{' '}
                </span>
            )}
            <span className="font-bold text-white">
                <span className="rounded-md bg-slate-600 p-0.5 font-bold">{type} TLD</span>
            </span>{' '}
            <span className="text-muted-foreground">{tldDescription}</span>{' '}
            <a href={ianaURL} target="_blank" rel="noopener noreferrer" className="text-muted-foreground underline">
                Learn more
            </a>
        </p>
    );
}
