'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

import { cn } from '@/lib/utils';

const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player), {
    ssr: false,
});

const LOADING_MESSAGES = [
    'Querying the DNS oracles... please hold.',
    'Traversing the ICANN multiverse...',
    'Assembling your domain packets...',
    'Negotiating with name servers... might take a sec.',
    'Beaming your request to root servers...',
    'Hashing some geek magic... almost there!',
    'Unlocking registrar vaults...',
    'Caching the uncacheable...',
    'Summoning domains from the ether...',
    'Taming penguins in the server racks...',
    'Aligning domains with the space-time continuum...',
    'Crunching WHOIS records into human-readable form...',
    'Pinging alternate realities for availability...',
    'Rotating encryption keys until one fits...',
    'Threading connections through registrar fabric...',
    'Rebooting the hamster powering this server...',
    'Untangling DNS spaghetti...',
    'Consulting RFC scrolls for wisdom...',
    'Waiting for ICANN clearance to land...',
    'Compiling domain registry spells...',
    // Extra nerdy easter eggs:
    'Returning 418: still a teapot... please wait.',
    'Performing reverse DNS gymnastics...',
    'Stuck in a CNAME loop... rerouting.',
    'Retrying after exponential backoff...',
    'Looking up your domain in Schrödinger’s zone file...',
    'Query timed out... just kidding.',
    'Shaking hands over TCP... politely.',
    'Chasing down dangling PTR records...',
    'Attempting zone transfer... kidding, that’s illegal.',
    'Resolving NXDOMAINs into dreams...',
];

interface LoadingProps {
    height?: number;
    width?: number;
    className?: string;
    message?: string;
}

export default function Loading({ height = 160, width, className, message }: LoadingProps) {
    const computedWidth = width ?? (height / 160) * 280;
    const displayMessage = useMemo(
        () => message ?? LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)],
        [message],
    );

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground',
                className,
            )}
        >
            <Player autoplay loop src="/loading.json" style={{ height, width: computedWidth }} />
            <span>{displayMessage}</span>
        </div>
    );
}
