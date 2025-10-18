'use client';

import { use, useEffect, useState, useTransition } from 'react';
import { Calendar, DollarSign, ExternalLink, FileText } from 'lucide-react';

import ErrorMessage from '@/components/ErrorMessage';
import LoadingMessage from '@/components/LoadingMessage';
import TLDTypeIcon from '@/components/TLDTypeIcon';
import { Badge } from '@/components/ui/badge';
import {
    Registrar,
    REGISTRAR_DISPLAY_NAMES,
    REGISTRAR_TLD_SEARCH_URLS,
    TLD,
    TLD_TYPE_DISPLAY_NAMES,
} from '@/models/tld';
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
            <main className="m-auto flex w-full max-w-4xl flex-col items-center gap-5 p-5 md:p-10">
                <Badge className="text-xs font-medium">TLD</Badge>
                <div className="flex w-full flex-col gap-4">
                    <div className="flex w-full flex-col">
                        <h1 className="text-4xl font-bold">.{tld?.name}</h1>
                        <h2 className="text-md mt-2 font-light">{tld?.tagline}</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {tld?.yearEstablished && (
                            <div className="flex items-center gap-5 rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                                <div className="flex h-8 w-8 items-center justify-center">
                                    <Calendar className="h-8 w-8 text-primary" />
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
                                <div className="flex h-10 w-10 items-center justify-center">
                                    <TLDTypeIcon tld={tld} size="lg" />
                                </div>
                                <div className="flex w-full flex-col">
                                    <span className="text-xs font-medium text-muted-foreground">Type</span>
                                    <div className="flex w-full items-center justify-between gap-2">
                                        <span className="text-lg font-semibold">
                                            {TLD_TYPE_DISPLAY_NAMES[tld.type]}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="rounded-lg border from-card p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                About
                            </h2>
                        </div>
                        <p className="leading-relaxed text-foreground">
                            {tld.description ?? 'No additional information is available for this TLD, just yet.'}
                        </p>
                    </div>
                    {tld?.pricing && Object.keys(tld.pricing).length > 0 && (
                        <div className="rounded-lg border p-6 shadow-sm">
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                        <DollarSign className="h-4 w-4 text-primary" />
                                    </div>
                                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                        Pricing
                                    </h2>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                {Object.entries(tld.pricing).map(([registrar, pricing]) => {
                                    const registrarKey = registrar as keyof typeof REGISTRAR_DISPLAY_NAMES;
                                    const registrarName = REGISTRAR_DISPLAY_NAMES[registrarKey];
                                    const registrarUrl = REGISTRAR_TLD_SEARCH_URLS[registrarKey as Registrar](
                                        tld.name!,
                                    );
                                    const currency = pricing.currency || 'USD';
                                    const hasRegistration = typeof pricing.registration === 'number';
                                    const hasRenewal = typeof pricing.renewal === 'number';
                                    return (
                                        <a
                                            key={registrar}
                                            href={registrarUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative cursor-pointer overflow-hidden rounded-lg border p-4 duration-300 hover:scale-105 hover:shadow-lg"
                                        >
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="flex items-center gap-1 text-sm font-semibold text-foreground">
                                                        {registrarName}
                                                        <ExternalLink className="h-3 w-3 opacity-50 transition-opacity group-hover:opacity-100" />
                                                    </h3>
                                                    <div className="rounded-full px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                        {currency}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    {hasRegistration && (
                                                        <div className="flex items-baseline justify-between">
                                                            <span className="text-xs text-muted-foreground">
                                                                Registration
                                                            </span>
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-lg font-bold text-foreground">
                                                                    {pricing.registration?.toFixed(2)}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    /yr
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {hasRenewal && (
                                                        <div className="flex items-baseline justify-between">
                                                            <span className="text-xs text-muted-foreground">
                                                                Renewal
                                                            </span>
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-sm font-semibold text-foreground">
                                                                    {pricing.renewal?.toFixed(2)}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    /yr
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                {!hasRegistration && !hasRenewal && (
                                                    <span className="text-xs text-muted-foreground">
                                                        Check registrar website for pricing
                                                    </span>
                                                )}
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                            <div className="mt-4 flex items-center rounded-md">
                                <p className="text-[10px] text-muted-foreground">
                                    * Prices may vary. Visit registrar websites for current offers and promotions.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
