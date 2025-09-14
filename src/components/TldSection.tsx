'use client';

import { TLD } from '@/models/tld';

interface TLDSectionProps extends TLD {
    tld: string;
}

export default function TLDSection({ tld, description, type }: TLDSectionProps) {
    const wikipediaUrl = `https://en.wikipedia.org/wiki/.${tld}`;
    const tldDescription = description ?? 'No additional information is available for this TLD.';
    return (
        <p className="text-xs">
            <span className="font-bold">
                .{tld} ({type}):
            </span>{' '}
            {tldDescription}{' '}
            <a href={wikipediaUrl} target="_blank" rel="noopener noreferrer" className="underline">
                Learn more
            </a>
        </p>
    );
}
