'use client';

import { TLD, TLDType } from '@/models/tld';

interface TLDSectionProps extends TLD {
    tld: string;
}

export default function TLDSection({ tld, description, type }: TLDSectionProps) {
    const ianaURL = `https://www.iana.org/domains/root/db/${tld}.html`;
    const tldDescription = description ?? 'No additional information is available for this TLD.';
    return (
        <p className="text-xs leading-relaxed">
            <span className="font-bold text-white">
                <span className="rounded-md bg-slate-600 p-0.5 font-bold">{type} TLD</span>
            </span>{' '}
            <span className="text-muted-foreground">{tldDescription}</span>{' '}
            <a
                href={ianaURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground underline"
            >
                Learn more
            </a>
        </p>
    );
}
