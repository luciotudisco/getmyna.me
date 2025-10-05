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

function AvailableBadge({ className }: { className?: string }) {
    return (
        <Badge className={cn(baseClasses, 'bg-green-500 hover:bg-green-600', className)}>
            <span className="text-white">Available</span>
        </Badge>
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
        return <AvailableBadge className={className} />;
    }

    return <TakenBadge className={className} />;
}

export default DomainStatusBadge;
