'use client';

import { TLD } from '@/models/tld';

export default function TLDSection({ name, punycodeName, description, type }: TLD) {
    const ianaURL = `https://www.iana.org/domains/root/db/${punycodeName}.html`;
    const tldDescription = description ?? 'No additional information is available for this TLD.';
    return (
        <p className="gap-2 text-xs leading-relaxed">
            <span className="mr-1">
                <span className="rounded-md bg-slate-100 p-0.5 font-bold px-1">{type}</span>
            </span>
            {name !== punycodeName && (
                <span className="mr-1">
                    <span className="rounded-md bg-slate-100 p-0.5 font-bold px-1">INTERNATIONALIZED DOMAIN NAME (IDN)</span>{' '}
                </span>
            )}
            <span>{tldDescription}</span>{' '}
            <a href={ianaURL} target="_blank" rel="noopener noreferrer" className="text-muted-foreground underline">
                Learn more
            </a>
        </p>
    );
}
