'use client';

import { TLD } from '@/models/tld';

export default function TLDSection({ description }: TLD) {
    const tldDescription = description ?? 'No additional information is available for this TLD, just yet.';

    return (
        <div className="space-y-2 text-xs">
            <p className="text-xs leading-relaxed">{tldDescription}</p>
        </div>
    );
}
