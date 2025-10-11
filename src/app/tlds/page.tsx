'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion } from 'framer-motion';

import ErrorMessage from '@/components/ErrorMessage';
import LoadingMessage from '@/components/LoadingMessage';
import TLDDrawer from '@/components/TLDDrawer';
import { Badge } from '@/components/ui/badge';
import { Highlighter } from '@/components/ui/highlighter';
import { TLD } from '@/models/tld';
import { apiClient } from '@/services/api';

export default function TldsPage() {
    const [tlds, setTlds] = useState<TLD[]>([]);
    const [hasError, setHasError] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [selectedTld, setSelectedTld] = useState<TLD | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        startTransition(async () => {
            try {
                const data = await apiClient.getTLDs();
                setTlds(data);
            } catch {
                setHasError(true);
            }
        });
    }, []);

    const handleTldClick = (tld: TLD) => {
        setSelectedTld(tld);
        setDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
        setSelectedTld(null);
    };

    if (hasError) {
        return <ErrorMessage />;
    }

    if (isPending) {
        return <LoadingMessage />;
    }

    return (
        <div className="min-h-screen">
            <main className="m-auto flex w-full max-w-6xl flex-col items-center gap-5 p-5 md:p-10">
                <div className="text-center">
                    <Badge className="text-xs font-medium">TLD DIRECTORY</Badge>
                    <h1 className="mt-4 text-2xl font-semibold lg:text-4xl">All Top-Level Domains</h1>
                    <p className="mt-2 text-sm font-medium text-muted-foreground lg:mt-6 lg:text-base">
                        Explore our complete collection of{' '}
                        <Highlighter action="underline" color="#fde2e4">
                            {tlds.length} TLDs
                        </Highlighter>
                    </p>
                </div>

                <div className="mt-6 flex w-full flex-wrap justify-center gap-2 lg:mt-14">
                    {tlds.map((tld) => (
                        <motion.div
                            key={tld.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.5,
                                delay: Math.random() * 0.8,
                                ease: 'easeOut',
                            }}
                        >
                            <Badge
                                variant="outline"
                                className="cursor-pointer font-light transition-colors hover:bg-muted"
                                onClick={() => handleTldClick(tld)}
                            >
                                .{tld.name}
                            </Badge>
                        </motion.div>
                    ))}
                </div>
            </main>

            {selectedTld && <TLDDrawer tld={selectedTld} open={drawerOpen} onClose={handleDrawerClose} />}
        </div>
    );
}
