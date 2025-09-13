'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBar from './SearchBar';
import { Suspense } from 'react';
import { Button } from './ui/button';
import { Info } from 'lucide-react';

export default function Header() {
    const pathname = usePathname();
    const showSearchBar = pathname !== '/';

    return (
        <header className="supports-backdrop-blur:bg-background/90 border-grid sticky top-0 z-40 flex min-h-16 w-full flex-row items-center gap-5 border-b bg-background/40 p-2 px-5 backdrop-blur-lg">
            <Link href="/">
                <Image src="/logo.svg" alt="GetMyNa.me logo" width={28} height={28} />{' '}
            </Link>
            {showSearchBar ? (
                <div className="flex flex-1 items-center justify-between">
                    <Suspense fallback={null}>
                        <SearchBar />
                    </Suspense>
                    <div className="hidden min-w-72 lg:block" />
                    <Link href="/about" className="hidden lg:block">
                        <Button type="button" variant="ghost">
                            <Info />
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="flex flex-1 items-center justify-between">
                    <h1 className="font-mono text-xl font-extralight uppercase">GetMyNa.me</h1>
                    <Link href="/about">
                        <Button type="button" variant="ghost">
                            <Info />
                        </Button>
                    </Link>
                </div>
            )}
        </header>
    );
}
