import { Flag, Globe2, Handshake, LucideIcon, Server, ShieldCheck } from 'lucide-react';

import { cn } from '@/components/ui/utils';
import { TLD, TLDType } from '@/models/tld';

interface TLDTypeIconProps {
    tld: TLD;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const SIZE_CLASSES = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
};

const FLAG_SIZE_STYLES = {
    sm: { fontSize: '0.75rem' },
    md: { fontSize: '1.5rem' },
    lg: { fontSize: '2rem' },
};

export const TLD_TYPE_ICONS: Record<TLDType, LucideIcon> = {
    [TLDType.COUNTRY_CODE]: Flag,
    [TLDType.GENERIC]: Globe2,
    [TLDType.GENERIC_RESTRICTED]: ShieldCheck,
    [TLDType.INFRASTRUCTURE]: Server,
    [TLDType.SPONSORED]: Handshake,
};

function TLDTypeIcon({ tld, size = 'lg', className }: TLDTypeIconProps) {
    const isCountryCode = tld.type === TLDType.COUNTRY_CODE;
    const countryIso = tld.countryCode?.toLowerCase() || tld.name?.toLowerCase() || null;

    if (isCountryCode && countryIso && /^[a-z]{2}$/.test(countryIso)) {
        return (
            <span
                title={tld.name}
                aria-label={`Flag of ${tld.name}`}
                className={cn(`fi fi-${countryIso}`, className)}
                style={FLAG_SIZE_STYLES[size]}
            />
        );
    }

    const Icon = tld.type ? TLD_TYPE_ICONS[tld.type] : Globe2;
    return <Icon className={cn(SIZE_CLASSES[size], 'text-primary', className)} />;
}

export default TLDTypeIcon;
