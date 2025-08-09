'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Domain, DomainStatus as DomainStatusEnum } from '@/models/domain';
import { AlertCircle, Loader2 } from 'lucide-react';

interface DomainStatusBadgeProps {
    domain: Domain;
    status: DomainStatusEnum;
    className?: string;
}

export function DomainStatusBadge({ domain, status, className }: DomainStatusBadgeProps) {
    return (
        <Badge
            className={cn(
                'inline-flex h-7 min-w-[6rem] items-center justify-center px-3',
                status === DomainStatusEnum.unknown
                    ? 'bg-gray-400'
                    : status === DomainStatusEnum.error
                      ? 'bg-yellow-400 hover:bg-yellow-500'
                      : domain.isAvailable()
                        ? 'bg-green-400 hover:bg-green-600'
                        : 'bg-red-400 hover:bg-red-600',
                className,
            )}
        >
            {status === DomainStatusEnum.unknown ? (
                <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                </div>
            ) : status === DomainStatusEnum.error ? (
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-white" />
                    <span>Error</span>
                </div>
            ) : domain.isAvailable() ? (
                'Available'
            ) : (
                'Taken'
            )}
        </Badge>
    );
}

export default DomainStatusBadge;

