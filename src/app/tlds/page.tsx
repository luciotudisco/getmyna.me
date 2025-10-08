'use client';

import { useEffect, useState } from 'react';

import ErrorMessage from '@/components/ErrorMessage';
import LoadingMessage from '@/components/LoadingMessage';
import { Badge } from '@/components/ui/badge';
import { Highlighter } from '@/components/ui/highlighter';
import { TLD } from '@/models/tld';
import { apiClient } from '@/services/api';

export default function TldsPage() {
    const [tlds, setTlds] = useState<TLD[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        async function fetchTlds() {
            try {
                setLoading(true);
                const data = await apiClient.getTLDs();
                setTlds(data);
            } catch (err) {
                setHasError(true);
                console.error('Error fetching TLDs:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchTlds();
    }, []);

    if (loading) {
        return <LoadingMessage message="Loading TLDs..." />;
    }

    if (hasError) {
        return <ErrorMessage />;
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

                <div className="mt-6 flex w-full flex-wrap justify-center gap-2 lg:mt-14">
                    {tlds.map((tld) => (
                        <Badge key={tld.name || tld.punycodeName} variant="outline">
                            .{tld.name}
                        </Badge>
                    ))}
                </div>
            </main>
        </div>
    );
}
