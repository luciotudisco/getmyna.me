'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

import ErrorMessage from '@/components/ErrorMessage';
import LoadingMessage from '@/components/LoadingMessage';
import TLDDrawer from '@/components/TLDDrawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Card, CardContent } from '@/components/ui/card';
import { Highlighter } from '@/components/ui/highlighter';
import { Input } from '@/components/ui/input';
import { cn } from '@/components/ui/utils';
import { TLD, TLD_TYPE_DISPLAY_NAMES, TLDType } from '@/models/tld';
import { apiClient } from '@/services/api';

export default function TldsPage() {
    const [tlds, setTlds] = useState<TLD[]>([]);
    const [hasError, setHasError] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [selectedTld, setSelectedTld] = useState<TLD | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<TLDType | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

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

    const filteredTlds = tlds.filter((tld) => {
        const matchesType = selectedType === null || tld.type === selectedType;
        const matchesSearch = searchQuery === '' || tld.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    if (hasError) {
        return <ErrorMessage />;
    }

    if (isPending) {
        return <LoadingMessage />;
    }

    return (
        <div className="flex flex-col">
            <main className="m-auto flex w-full max-w-5xl flex-col items-center gap-5 p-5 md:p-10">
                <div className="text-center">
                    <Badge className="text-xs font-medium">TLD DIRECTORY</Badge>
                    <h1 className="mt-4 text-2xl font-semibold lg:text-3xl">The ultimate TLDs list</h1>
                    <p className="mt-2 text-sm font-medium text-muted-foreground lg:text-base">
                        Explore our complete collection of{' '}
                        <Highlighter action="underline" color="#fde2e4">
                            {filteredTlds.length} TLDs
                        </Highlighter>
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mt-4 w-full">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search TLDs by name ..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border border-input bg-background pl-9 pr-4 shadow-sm transition-all hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>
                </div>

                {/* Type Filter Buttons */}
                <div className="space-between mt-6 hidden w-full flex-wrap justify-center gap-2 md:block">
                    <ButtonGroup orientation="horizontal" className="w-full rounded-sm">
                        {Object.values(TLDType).map((type) => (
                            <Button
                                key={type}
                                variant={selectedType === type ? 'default' : 'secondary'}
                                size="sm"
                                onClick={() => setSelectedType(selectedType === type ? null : type)}
                                className="min-h-10 w-full min-w-32 gap-2 text-xs"
                            >
                                <span className="uppercase">{TLD_TYPE_DISPLAY_NAMES[type]}</span>
                                <span className="text-xs text-muted-foreground">
                                    ({tlds.filter((tld) => tld.type === type).length})
                                </span>
                            </Button>
                        ))}
                    </ButtonGroup>
                </div>

                <div className="mt-3 w-full lg:mt-6">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredTlds.map((tld, idx) => (
                            <motion.div
                                key={tld.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: Math.min(idx * 0.02, 0.3),
                                    ease: 'easeOut',
                                }}
                            >
                                <Card
                                    className={cn(
                                        'group relative cursor-pointer overflow-hidden rounded-sm border-[0.5px] transition-all duration-200 hover:scale-[1.02] hover:shadow-lg',
                                        'border-gray-200 bg-white hover:border-gray-300 hover:shadow-gray-200/40',
                                        'dark:border-gray-800 dark:bg-gray-900/80 dark:hover:border-gray-700 dark:hover:shadow-gray-900/30',
                                    )}
                                    onClick={() => showDrawer(tld)}
                                >
                                    <CardContent className="p-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <h3 className="truncate text-sm font-semibold transition-colors group-hover:text-primary">
                                                    .{tld.name}
                                                </h3>
                                                <p className="truncate text-[11px] font-medium lowercase text-muted-foreground">
                                                    {tld.type ? TLD_TYPE_DISPLAY_NAMES[tld.type] : 'unknown'}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            {selectedTld && <TLDDrawer tld={selectedTld} open={drawerOpen} onClose={closeDrawer} />}
        </div>
    );
}
