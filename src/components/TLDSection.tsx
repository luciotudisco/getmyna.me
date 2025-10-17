'use client';

import { Badge } from '@/components/ui/badge';
import { TLD, TLD_TYPE_DISPLAY_NAMES } from '@/models/tld';

import { TLDTypeIcon } from './TLDTypeIcon';

export default function TLDSection({ name, description, type }: TLD) {
    const tldDescription = description ?? 'No additional information is available for this TLD, just yet.';
    const tldDisplayName = type ? TLD_TYPE_DISPLAY_NAMES[type] : null;

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
                            <TLDTypeIcon tld={{ name, type }} size="sm" />
                            <span>{tldDisplayName}</span>
                        </Badge>
                    )}
                </div>
            </div>
            <p className="gap-2 text-xs leading-relaxed">
                <span>{tldDescription}</span>{' '}
                <a href={`/tlds/${name}`} className="text-muted-foreground underline">
                    Learn more
                </a>
            </p>
        </div>
    );
}
