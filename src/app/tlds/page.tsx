'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion } from 'framer-motion';

import ErrorMessage from '@/components/ErrorMessage';
import LoadingMessage from '@/components/LoadingMessage';
import TLDDrawer from '@/components/TLDDrawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Highlighter } from '@/components/ui/highlighter';
import { TLD, TLD_TYPE_DISPLAY_NAMES, TLDType } from '@/models/tld';
import { apiClient } from '@/services/api';

export default function TldsPage() {
    const [tlds, setTlds] = useState<TLD[]>([]);
    const [hasError, setHasError] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [selectedTld, setSelectedTld] = useState<TLD | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<TLDType | null>(null);

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

    const toggleTypeFilter = (type: TLDType) => setSelectedType((prev) => (prev === type ? null : type));

    const filteredTlds = selectedType === null ? tlds : tlds.filter((tld) => tld.type === selectedType);

    if (hasError) {
        return <ErrorMessage />;
    }

    if (isPending) {
        return <LoadingMessage />;
    }

    return (
        <div className="min-h-screen">
            <main className="m-auto flex w-full max-w-4xl flex-col items-center gap-5 p-5 md:p-10">
                <div className="text-center">
                    <Badge className="text-xs font-medium">TLD DIRECTORY</Badge>
                    <h1 className="mt-4 text-2xl font-semibold lg:text-3xl">The ultimate TLD list</h1>
                    <p className="mt-2 text-sm font-medium text-muted-foreground lg:mt-6 lg:text-base">
                        Explore our complete collection of{' '}
                        <Highlighter action="underline" color="#fde2e4">
                            {filteredTlds.length} TLDs
                        </Highlighter>
                    </p>
                </div>

                {/* Type Filter Toggles */}
                <div className="mt-3 flex flex-wrap justify-center gap-2 lg:mt-6">
                    {Object.values(TLDType).map((type) => (
                        <Button
                            key={type}
                            variant={selectedType === type ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleTypeFilter(type)}
                            className={`text-xs font-medium transition-all ${
                                selectedType === type
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'border-muted-foreground/20 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            {TLD_TYPE_DISPLAY_NAMES[type]}
                        </Button>
                    ))}
                </div>

                <div className="mt-6 flex w-full flex-wrap justify-center gap-2 lg:mt-14">
                    {filteredTlds.map((tld) => (
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
                                className="cursor-pointer font-light transition-all duration-300 hover:scale-110 hover:bg-muted"
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
