'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

import { cn } from '@/utils/utils';

const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player), {
    ssr: false,
});

const LOADING_MESSAGES = [
    'Aligning domains with the space-time continuum...',
    'Consulting RFC scrolls for wisdom...',
    'Crunching WHOIS records into human-readable form...',
    'Hashing some geek magic... almost there!',
    'Looking up your domain in Schrödinger’s zone file...',
    'Performing reverse DNS gymnastics...',
    'Pinging alternate realities for availability...',
    'Query timed out... just kidding.',
    'Querying the DNS oracles... please hold.',
    'Rebooting the hamster powering this server...',
    'Shaking hands over TCP... politely.',
    'Summoning domains from the ether...',
    'Taming penguins in the server racks...',
    'Traversing the ICANN multiverse...',
    'Untangling DNS spaghetti...',
    'Waiting for ICANN clearance to land...',
];

interface LoadingProps {
    size?: 'small' | 'medium' | 'large';
    className?: string;
    message?: string;
}

export default function Loading({ className, message, size = 'medium' }: LoadingProps) {
    const displayMessage = useMemo(
        () => message ?? LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)],
        [message],
    );

    const height = useMemo(() => {
        return size === 'small' ? '60px' : size === 'medium' ? '80px' : '120px';
    }, [size]);

    return (
        <div className={cn('flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground', className)}>
            <Player autoplay loop src="/loading.json" style={{ height }} />
            <span className="max-w-xs text-center">{displayMessage}</span>
        </div>
    );
}
