'use client';

import { useEffect, useState } from 'react';
import { getTldInfo, TldInfo as TldInfoType } from '@/services/tld-info';

interface TldInfoProps {
    tld: string;
}

export default function TldInfo({ tld }: TldInfoProps) {
    const [tldInfo, setTldInfo] = useState<TldInfoType | null>(null);

    useEffect(() => {
        getTldInfo(tld).then(setTldInfo);
    }, [tld]);

    if (!tldInfo) {
        return <p className="text-sm">Loading TLD info...</p>;
    }

    return (
        <p className="text-xs">
            <span className="font-bold">.{tld}:</span> {tldInfo.description}{' '}
            <a
                href={tldInfo.wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
            >
                Learn more on Wikipedia
            </a>
        </p>
    );
}
