'use client';

import { CircleHelp, Flag, FlaskConical, Globe2, Handshake, type LucideIcon, Server, ShieldCheck } from 'lucide-react';

import { TLD, TLDType, TextDirection } from '@/models/tld';

import { Badge } from './ui/badge';

const TLD_TYPE_ICON_MAP: Record<TLDType, LucideIcon> = {
    [TLDType.COUNTRY_CODE]: Flag,
    [TLDType.GENERIC]: Globe2,
    [TLDType.GENERIC_RESTRICTED]: ShieldCheck,
    [TLDType.INFRASTRUCTURE]: Server,
    [TLDType.SPONSORED]: Handshake,
    [TLDType.TEST]: FlaskConical,
};

const DEFAULT_TLD_TYPE_ICON = CircleHelp;

export default function TLDSection({ name, punycodeName, description, type, direction }: TLD) {
    const ianaURL = `https://www.iana.org/domains/root/db/${punycodeName}.html`;
    const tldDescription = description ?? 'No additional information is available for this TLD.';
    const TypeIcon = type ? (TLD_TYPE_ICON_MAP[type] ?? DEFAULT_TLD_TYPE_ICON) : null;
    const formattedType = type?.replace(/_/g, ' ');
    
    // Determine if this is RTL text
    const isRTL = direction === TextDirection.RIGHT_TO_LEFT;
    
    return (
        <div className="space-y-2">
            <div className="flex justify-between">
                <span className="font-semibold uppercase text-muted-foreground">Top Level Domain</span>
                <div className="flex items-center gap-2">
                    <Badge 
                        variant="outline" 
                        className="uppercase"
                        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                        dir={isRTL ? 'rtl' : 'ltr'}
                    >
                        .{name}
                    </Badge>
                    {type && (
                        <Badge variant="outline" className="flex items-center gap-1 uppercase">
                            {TypeIcon && <TypeIcon className="h-3 w-3" aria-hidden="true" />}
                            <span>{formattedType}</span>
                        </Badge>
                    )}
                </div>
            </div>
            <p 
                className="gap-2 text-xs leading-relaxed"
                style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                <span>{tldDescription}</span>{' '}
                <a href={ianaURL} target="_blank" rel="noopener noreferrer" className="text-muted-foreground underline">
                    Learn more
                </a>
            </p>
        </div>
    );
}
