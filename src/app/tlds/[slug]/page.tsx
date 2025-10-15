'use client';

import { useEffect, useState, useTransition } from 'react';

import ErrorMessage from '@/components/ErrorMessage';
import LoadingMessage from '@/components/LoadingMessage';
import { Badge } from '@/components/ui/badge';
import { TLD, TLD_TYPE_DISPLAY_NAMES, TLDType } from '@/models/tld';
import { apiClient } from '@/services/api';

interface TLDPageProps {
    params: {
        slug: string;
    };
}

export default function TLDPage({ params }: TLDPageProps) {
    const { slug } = params;
    const [tld, setTld] = useState<TLD | null>(null);
    const [hasError, setHasError] = useState(false);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            try {
                const data = await apiClient.getTLD(slug);
                setTld(data);
            } catch {
                setHasError(true);
            }
        });
    }, [slug]);

    if (hasError || !tld) {
        return <ErrorMessage />;
    }

    if (isPending) {
        return <LoadingMessage />;
    }

    return (
        <div className="min-h-screen">
            <main className="container mx-auto max-w-4xl px-4 py-16">
                <div className="mt-8 flex flex-col gap-10">
                    <div className="flex flex-row gap-5">
                        <Badge
                            variant="default"
                            className="w-fit text-xl font-semibold uppercase text-white md:text-2xl"
                        >
                            .{tld?.name}
                        </Badge>
                        <Badge
                            variant="default"
                            className="w-fit text-xl font-semibold uppercase text-white md:text-2xl"
                        >
                            {TLD_TYPE_DISPLAY_NAMES[tld?.type ?? TLDType.GENERIC]}
                        </Badge>
                    </div>
                    <p className="text-balance leading-relaxed">
                        {tld.description ?? 'No additional information is available for this TLD, just yet.'}
                    </p>
                </div>
            </main>
        </div>
    );
}
