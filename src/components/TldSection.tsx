'use client';

import { TLD, TLDType } from '@/models/tld';

import { Badge } from './ui/badge';
import type { LucideIcon } from 'lucide-react';
import { CircleHelp, Flag, FlaskConical, Globe2, Handshake, Server, ShieldCheck } from 'lucide-react';

const TLD_TYPE_ICON_MAP: Record<TLDType, LucideIcon> = {
    [TLDType.COUNTRY_CODE]: Flag,
    [TLDType.GENERIC]: Globe2,
    [TLDType.GENERIC_RESTRICTED]: ShieldCheck,
    [TLDType.INFRASTRUCTURE]: Server,
    [TLDType.SPONSORED]: Handshake,
    [TLDType.TEST]: FlaskConical,
};

const DEFAULT_TLD_TYPE_ICON = CircleHelp;

export default function TLDSection({ name, punycodeName, description, type }: TLD) {
    const ianaURL = `https://www.iana.org/domains/root/db/${punycodeName}.html`;
    const tldDescription = description ?? 'No additional information is available for this TLD.';
    const TypeIcon = type ? TLD_TYPE_ICON_MAP[type] ?? DEFAULT_TLD_TYPE_ICON : null;
    const formattedType = type?.replace(/_/g, ' ');
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="uppercase">
                    .{name}
                </Badge>
                {type && (
                    <Badge variant="outline" className="flex items-center gap-1 uppercase">
                        {TypeIcon && <TypeIcon className="h-3 w-3" aria-hidden="true" />}
                        <span>{formattedType}</span>
                    </Badge>
                )}
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
