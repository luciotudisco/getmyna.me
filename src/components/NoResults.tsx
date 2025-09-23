'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

import { cn } from '@/utils/utils';

const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player), {
    ssr: false,
});

const NO_RESULTS_MESSAGES = [
    'Ouch! Your query returned 0 results. Time to try another search pattern.',
    'DNS lookup returned NXDOMAIN for your search criteria.',
    'The domain registry is playing hide and seek... and winning.',
    '404: Search results not found. Try a different URL pattern.',
    'Your search query has been successfully routed to /dev/null.',
    'The WHOIS database is giving you the silent treatment.',
    'Zero matches found. Even Schrödinger\'s cat couldn\'t find domains here.',
    'The domain namespace is empty. Time to populate it with better queries.',
    'Your search pattern is more elusive than a unicorn in the DNS.',
    'The ICANN registry is having an existential crisis about your query.',
    'No domains found. The internet is taking a coffee break.',
    'Your search results have been successfully cached in the void.',
    'The domain resolver is giving you a 404 on your search skills.',
    'Zero results. The DNS gods are not pleased with your query.',
    'Your search pattern is more rare than a valid IPv4 address.',
    'The domain database is returning a null pointer exception.',
    'No matches found. Even the robots.txt couldn\'t help with this one.',
    'Your query has been successfully dropped by the network stack.',
    'The domain registry is returning a 418 "I\'m a teapot" error.',
    'Zero results. The internet is experiencing a temporary shortage of domains.',
];

interface NoResultsProps {
    size?: 'small' | 'medium' | 'large';
    className?: string;
    message?: string;
}

export default function NoResults({ className, message, size = 'large' }: NoResultsProps) {
    const displayMessage = useMemo(
        () => message ?? NO_RESULTS_MESSAGES[Math.floor(Math.random() * NO_RESULTS_MESSAGES.length)],
        [message],
    );

    const height = useMemo(() => {
        return size === 'small' ? '120px' : size === 'medium' ? '180px' : '250px';
    }, [size]);

    return (
        <div className={cn('flex flex-1 items-center gap-3 p-12 align-middle', className)}>
            <Player autoplay keepLastFrame src="/sad-empty-box.json" style={{ height }} />
            <p className="text-md text-center text-muted-foreground">
                {displayMessage}
            </p>
        </div>
    );
}