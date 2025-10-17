import { Globe2 } from 'lucide-react';

import { cn } from '@/components/ui/utils';
import { TLD, TLD_TYPE_ICONS, TLDType } from '@/models/tld';

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
    sm: { fontSize: '1rem' }, // matches h-4/w-4
    md: { fontSize: '1.5rem' }, // matches h-6/w-6
    lg: { fontSize: '2rem' }, // matches h-8/w-8
};

export function TLDTypeIcon({ tld, size = 'lg', className }: TLDTypeIconProps) {
    const isCountryCode = tld.type === TLDType.COUNTRY_CODE;
    const countryIso = isCountryCode ? ('uk' === tld.name ? 'gb' : tld.name) : null;

    if (isCountryCode && countryIso) {
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
