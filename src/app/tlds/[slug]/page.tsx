'use client';

import { use, useEffect, useState, useTransition } from 'react';
import { Calendar, FileText } from 'lucide-react';

import ErrorMessage from '@/components/ErrorMessage';
import LoadingMessage from '@/components/LoadingMessage';
import { TLD, TLD_TYPE_DISPLAY_NAMES, TLD_TYPE_ICONS } from '@/models/tld';
import { apiClient } from '@/services/api';

export default function TLDPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
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

    if (hasError) {
        return <ErrorMessage />;
    }

    if (isPending) {
        return <LoadingMessage />;
    }

    if (!tld) {
        return <></>;
    }

    return (
        <div className="min-h-screen">
            <main className="container mx-auto max-w-4xl px-4 py-16">
                <div className="flex flex-col gap-10">
                    <div className="flex items-center">
                        <h1 className="text-4xl font-bold">.{tld?.name}</h1>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {tld?.yearEstablished && (
                            <div className="flex items-center gap-5 rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <Calendar className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-muted-foreground">Introduced</span>
                                    <div className="flex flex-row items-baseline gap-2">
                                        <span className="text-lg font-semibold">{tld.yearEstablished}</span>
                                        <span className="text-xs text-muted-foreground">
                                            ({new Date().getFullYear() - tld.yearEstablished} years ago)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {tld?.type && (
                            <div className="flex items-center gap-5 rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    {(() => {
                                        const Icon = TLD_TYPE_ICONS[tld.type];
                                        return <Icon className="h-5 w-5 text-primary" />;
                                    })()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-muted-foreground">Type</span>
                                    <span className="text-lg font-semibold">{TLD_TYPE_DISPLAY_NAMES[tld.type]}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="rounded-lg border bg-gradient-to-br from-card to-muted/20 p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                About
                            </h2>
                        </div>
                        <p className="text-balance leading-relaxed text-foreground">
                            {tld.description ?? 'No additional information is available for this TLD, just yet.'}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
