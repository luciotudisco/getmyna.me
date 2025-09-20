'use client';

import { TLD } from '@/models/tld';

import { Badge } from './ui/badge';

export default function TLDSection({ name, punycodeName, description, type }: TLD) {
    const ianaURL = `https://www.iana.org/domains/root/db/${punycodeName}.html`;
    const tldDescription = description ?? 'No additional information is available for this TLD.';
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="uppercase">
                    .{name}
                </Badge>
                <Badge variant="outline">{type}</Badge>
                {name !== punycodeName && <Badge variant="outline">INTERNATIONALIZED DOMAIN NAME (IDN)</Badge>}
            </div>
            <p className="gap-2 text-xs leading-relaxed">
                <span>{tldDescription}</span>{' '}
                <a href={ianaURL} target="_blank" rel="noopener noreferrer" className="text-muted-foreground underline">
                    Learn more
                </a>
            </p>
        </div>
    );
}
