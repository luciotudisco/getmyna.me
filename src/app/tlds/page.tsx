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

    const showDrawer = (tld: TLD) => {
        setSelectedTld(tld);
        setDrawerOpen(true);
    };

    const closeDrawer = () => {
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
                    <Badge className="bg-[#d0f4de] text-md font-medium text-black">TLD DIRECTORY</Badge>
                    <p className="mt-4 text-sm font-medium text-muted-foreground lg:mt-6 lg:text-base">
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
                                onClick={() => showDrawer(tld)}
                            >
                                .{tld.name}
                            </Badge>
                        </motion.div>
                    ))}
                </div>
            </main>

            {selectedTld && <TLDDrawer tld={selectedTld} open={drawerOpen} onClose={closeDrawer} />}
        </div>
    );
}
