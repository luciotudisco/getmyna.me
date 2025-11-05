'use client';

import { Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';
import { DOMAIN_AVAILABLE_STATUS_VALUES, DomainStatus } from '@/models/domain';

interface DomainStatusBadgeProps {
    status: DomainStatus;
    className?: string;
}

const baseClasses = 'inline-flex h-7 min-w-[8rem] items-center justify-center px-3';

function UnknownBadge({ className }: { className?: string }) {
    return (
        <Badge className={cn(baseClasses, 'border-none bg-transparent shadow-none', className)}>
            <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
        </Badge>
    );
}

function ErrorBadge({ className }: { className?: string }) {
    return (
        <Badge className={cn(baseClasses, 'bg-yellow-500 hover:bg-yellow-600', className)}>
            <span className="text-white">Error</span>
        </Badge>
    );
}

function AvailableBadge({ className, isPremiumDomain }: { className?: string; isPremiumDomain?: boolean }) {
    return (
        <div className="flex items-center gap-2">
            {isPremiumDomain ? (
                <Badge
                    className={cn(
                        baseClasses,
                        'border-none bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 shadow-lg shadow-purple-500/25 hover:from-purple-600 hover:via-pink-600 hover:to-red-600',
                        className,
                    )}
                >
                    <span className="font-bold tracking-wide text-white">✨ Premium ✨</span>
                </Badge>
            ) : (
                <Badge className={cn(baseClasses, 'bg-green-500 hover:bg-green-600', className)}>
                    <span className="text-white">Available</span>
                </Badge>
            )}
        </div>
    );
}

function TakenBadge({ className }: { className?: string }) {
    return (
        <Badge className={cn(baseClasses, 'bg-slate-400 hover:bg-slate-500', className)}>
            <span className="text-white">Taken</span>
        </Badge>
    );
}

function DomainStatusBadge({ status, className }: DomainStatusBadgeProps) {
    if (status === DomainStatus.UNKNOWN) {
        return <UnknownBadge className={className} />;
    }

    if (status === DomainStatus.ERROR) {
        return <ErrorBadge className={className} />;
    }

    if (DOMAIN_AVAILABLE_STATUS_VALUES.has(status)) {
        return <AvailableBadge className={className} isPremiumDomain={status === DomainStatus.PREMIUM} />;
    }

    return <TakenBadge className={className} />;
}

export default DomainStatusBadge;
