'use client';

import { Suspense } from 'react';
import { Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import SearchBar from '@/components/SearchBar';
import { Button } from '@/components/ui/button';

export default function Header() {
    const isHome = usePathname() === '/';

    return (
        <header
            role="banner"
            className="supports-backdrop-blur:bg-background/90 border-grid sticky top-0 z-40 flex min-h-16 w-full items-center gap-5 border-b bg-background/40 p-2 px-5 backdrop-blur-lg"
        >
            <Link href="/" aria-label="Go to homepage" className="shrink-0">
                <Image src="/logo.svg" alt="GetMyNa.me" width={28} height={28} priority />
            </Link>

            <div className="flex w-full items-center gap-4">
                {/* Title on home page, search bar on other pages */}
                {isHome ? (
                    <h1 className="font-mono text-xl font-extralight uppercase">GetMyNa.me</h1>
                ) : (
                    <Suspense>
                        <SearchBar />
                    </Suspense>
                )}

                {/* Spacer */}
                <div className="flex-1" aria-hidden />

                {/* About button */}
                <Button asChild variant="ghost" size="icon" aria-label="About GetMyNa.me">
                    <Link href="/about" prefetch>
                        <Info aria-hidden className="size-5" />
                    </Link>
                </Button>
            </div>
        </header>
    );
}
