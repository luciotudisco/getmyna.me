'use client';

import { TldInfo } from '@/services/api';

interface TldSectionProps extends TldInfo {
    tld: string;
}

export default function TldSection({ tld, description }: TldSectionProps) {
    const wikipediaUrl = `https://en.wikipedia.org/wiki/.${tld}`;
    return (
        <p className="text-xs">
            <span className="font-bold">.{tld}:</span> {description}{' '}
            <a
                href={wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
            >
                Learn more on Wikipedia
            </a>
        </p>
    );
}
