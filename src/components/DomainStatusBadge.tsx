'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/utils';
import { Domain, DomainStatus as DomainStatusEnum } from '@/models/domain';
import { AlertCircle, Loader2 } from 'lucide-react';

interface DomainStatusBadgeProps {
    domain: Domain;
    status: DomainStatusEnum;
    className?: string;
}

const baseClasses = 'inline-flex h-7 min-w-[6rem] items-center justify-center px-3';

function UnknownBadge({ className }: { className?: string }) {
    return (
        <Badge className={cn(baseClasses, 'bg-gray-400', className)}>
            <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-white" />
            </div>
        </Badge>
    );
}

function ErrorBadge({ className }: { className?: string }) {
    return (
        <Badge className={cn(baseClasses, 'bg-yellow-400 hover:bg-yellow-500', className)}>
            <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-white" />
                <span>Error</span>
            </div>
        </Badge>
    );
}

function AvailableBadge({ className }: { className?: string }) {
    return <Badge className={cn(baseClasses, 'bg-green-400 hover:bg-green-600', className)}>Available</Badge>;
}

function TakenBadge({ className }: { className?: string }) {
    return <Badge className={cn(baseClasses, 'bg-red-400 hover:bg-red-600', className)}>Taken</Badge>;
}

export function DomainStatusBadge({ domain, status, className }: DomainStatusBadgeProps) {
    if (status === DomainStatusEnum.unknown) {
        return <UnknownBadge className={className} />;
    }

    if (status === DomainStatusEnum.error) {
        return <ErrorBadge className={className} />;
    }

    if (domain.isAvailable()) {
        return <AvailableBadge className={className} />;
    }

    return <TakenBadge className={className} />;
}

export default DomainStatusBadge;
