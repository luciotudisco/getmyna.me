'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

import { cn } from '@/utils/utils';

const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player), {
    ssr: false,
});

const LOADING_MESSAGES = [
    'Querying the DNS oracles... please hold.',
    'Traversing the ICANN multiverse...',
    'Hashing some geek magic... almost there!',
    'Summoning domains from the ether...',
    'Taming penguins in the server racks...',
    'Aligning domains with the space-time continuum...',
    'Crunching WHOIS records into human-readable form...',
    'Pinging alternate realities for availability...',
    'Rebooting the hamster powering this server...',
    'Untangling DNS spaghetti...',
    'Consulting RFC scrolls for wisdom...',
    'Waiting for ICANN clearance to land...',
    'Performing reverse DNS gymnastics...',
    'Looking up your domain in Schrödinger’s zone file...',
    'Query timed out... just kidding.',
    'Shaking hands over TCP... politely.',
];

interface LoadingProps {
    className?: string;
    message?: string;
}

export default function Loading({ className, message }: LoadingProps) {
    const displayMessage = useMemo(
        () => message ?? LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)],
        [message],
    );

    return (
        <div className={cn('flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground', className)}>
            <Player autoplay loop src="/loading.json" />
            <span>{displayMessage}</span>
        </div>
    );
}
