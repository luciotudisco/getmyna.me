'use client';

import { Badge } from '@/components/ui/badge';
import { TLD, TLD_TYPE_DISPLAY_NAMES, TLD_TYPE_ICONS } from '@/models/tld';

export default function TLDSection({ name, punycodeName, description, type }: TLD) {
    const ianaURL = `https://www.iana.org/domains/root/db/${punycodeName}.html`;
    const tldDescription = description ?? 'No additional information is available for this TLD, just yet.';
    const tldDisplayName = type ? TLD_TYPE_DISPLAY_NAMES[type] : null;
    const Icon = type ? TLD_TYPE_ICONS[type] : null;

    return (
        <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
                <span className="font-semibold uppercase text-muted-foreground">Top Level Domain</span>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="uppercase">
                        .{name}
                    </Badge>
                    {type && (
                        <Badge variant="outline" className="flex items-center gap-1 uppercase">
                            {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
                            <span>{tldDisplayName}</span>
                        </Badge>
                    )}
                </div>
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
