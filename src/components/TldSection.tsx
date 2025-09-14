'use client';

import { TLD, TLDType } from '@/models/tld';

interface TLDSectionProps extends TLD {
    tld: string;
}

export default function TLDSection({ tld, description, type }: TLDSectionProps) {
    const wikipediaUrl = `https://en.wikipedia.org/wiki/.${tld}`;
    const tldDescription = description ?? 'No additional information is available for this TLD.';    
    return (
        <p className="text-xs leading-relaxed">
            <span className="font-bold text-white">
                <span className="rounded-md p-0.5 font-bold bg-slate-600">
                    {type} TLD
                </span>
            </span>{' '}
            <span className="text-muted-foreground">{tldDescription}</span>{' '}
            <a href={wikipediaUrl} target="_blank" rel="noopener noreferrer" className="underline text-muted-foreground">
                Learn more
            </a>
        </p>
    );
}
