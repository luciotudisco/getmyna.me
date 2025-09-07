'use client';

import { TLD } from '@/models/tld';

interface TldSectionProps extends TLD {
    tld: string;
}

export default function TldSection({ tld, description }: TldSectionProps) {
    const wikipediaUrl = `https://en.wikipedia.org/wiki/.${tld}`;
    const tldDescription = description ?? 'No additional information is available for this TLD.';
    return (
        <p className="text-xs">
            <span className="font-bold">.{tld}:</span> {tldDescription}{' '}
            <a href={wikipediaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                Learn more on Wikipedia
            </a>
        </p>
    );
}
