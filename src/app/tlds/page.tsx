'use client';

import { useEffect, useState } from 'react';
import { Flag, FlaskConical, Globe2, Handshake, type LucideIcon, Server, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Highlighter } from '@/components/ui/highlighter';
import { Registrar, TLD, TLDType } from '@/models/tld';
import { apiClient } from '@/services/api';

const TLD_TYPE_ICONS: Record<TLDType, LucideIcon> = {
    [TLDType.COUNTRY_CODE]: Flag,
    [TLDType.GENERIC]: Globe2,
    [TLDType.GENERIC_RESTRICTED]: ShieldCheck,
    [TLDType.INFRASTRUCTURE]: Server,
    [TLDType.SPONSORED]: Handshake,
    [TLDType.TEST]: FlaskConical,
};

const TLD_TYPE_DISPLAY_NAMES: Record<TLDType, string> = {
    [TLDType.COUNTRY_CODE]: 'Country Code',
    [TLDType.GENERIC]: 'Generic',
    [TLDType.GENERIC_RESTRICTED]: 'Generic Restricted',
    [TLDType.INFRASTRUCTURE]: 'Infrastructure',
    [TLDType.SPONSORED]: 'Sponsored',
    [TLDType.TEST]: 'Test',
};

const REGISTRAR_DISPLAY_NAMES: Record<Registrar, string> = {
    [Registrar.DYNADOT]: 'Dynadot',
    [Registrar.GANDI]: 'Gandi',
    [Registrar.NAMECOM]: 'Name.com',
    [Registrar.NAMESILO]: 'NameSilo',
    [Registrar.PORKBUN]: 'Porkbun',
};

export default function TldsPage() {
    const [tlds, setTlds] = useState<TLD[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTlds() {
            try {
                setLoading(true);
                const data = await apiClient.getTLDs();
                setTlds(data);
            } catch (err) {
                setError('Failed to load TLDs. Please try again later.');
                console.error('Error fetching TLDs:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchTlds();
    }, []);

    // Local component defined inside the page
    function TldListItem({ tld }: { tld: TLD }) {
        const Icon = tld.type ? TLD_TYPE_ICONS[tld.type] : null;
        const typeDisplayName = tld.type ? TLD_TYPE_DISPLAY_NAMES[tld.type] : null;

        // Extract registrars from pricing
        const registrars = tld.pricing
            ? Object.keys(tld.pricing)
                  .map((key) => REGISTRAR_DISPLAY_NAMES[key as Registrar])
                  .filter(Boolean)
            : [];

        return (
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-bold text-foreground">.{tld.name}</span>
                    {tld.type && (
                        <Badge variant="outline" className="flex items-center gap-1 uppercase">
                            {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
                            <span>{typeDisplayName}</span>
                        </Badge>
                    )}
                </div>

                {registrars.length > 0 && (
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium uppercase text-muted-foreground">Registrars</span>
                        <span className="text-sm text-foreground">{registrars.join(', ')}</span>
                    </div>
                )}

                {tld.description && <p className="text-xs leading-relaxed text-muted-foreground">{tld.description}</p>}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 text-4xl">⏳</div>
                    <p className="text-sm text-muted-foreground">Loading TLDs...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 text-4xl">❌</div>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <main className="m-auto flex w-full max-w-6xl flex-col items-center gap-5 p-5 md:p-10">
                <div className="text-center">
                    <Badge className="text-xs font-medium">TLD DIRECTORY</Badge>
                    <h1 className="mt-4 text-2xl font-semibold lg:text-4xl">All Top-Level Domains</h1>
                    <p className="mt-2 text-sm font-medium text-muted-foreground lg:mt-6 lg:text-base">
                        Explore our complete collection of{' '}
                        <Highlighter action="highlight" color="#fde2e4">
                            {tlds.length} TLDs
                        </Highlighter>
                    </p>
                </div>

                <div className="mt-6 grid w-full gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
                    {tlds.map((tld) => (
                        <TldListItem key={tld.name || tld.punycodeName} tld={tld} />
                    ))}
                </div>
            </main>
        </div>
    );
}
