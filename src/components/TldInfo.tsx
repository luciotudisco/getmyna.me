'use client';

import { TldInfo as TldInfoType } from '@/services/api';

interface TldInfoProps {
    tld: string;
    info: TldInfoType;
}

export default function TldInfo({ tld, info }: TldInfoProps) {
    return (
        <p className="text-xs">
            <span className="font-bold">.{tld}:</span> {info.description}{' '}
            <a
                href={info.wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
            >
                Learn more on Wikipedia
            </a>
        </p>
    );
}
