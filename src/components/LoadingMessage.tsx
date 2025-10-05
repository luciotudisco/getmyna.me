'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

import { cn } from '@/components/ui/utils';

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
    className?: string;
    message?: string;
}

export default function LoadingMessage({ className, message }: LoadingProps) {
    const displayMessage = useMemo(() => {
        return message ?? LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
    }, [message]);

    return (
        <div className={cn('flex flex-1 flex-col items-center justify-center gap-4 p-16', className)}>
            <Player autoplay loop src="/loading.json" style={{ height: '180px' }} />
            <span className="max-w-sm text-center text-sm text-muted-foreground">{displayMessage}</span>
        </div>
    );
}
