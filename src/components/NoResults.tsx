'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

import { cn } from '@/utils/utils';

const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player), {
    ssr: false,
});

const NO_RESULTS_MESSAGES = [
    'Ouch! Your query returned 0 results. Time to try another search pattern.',
    'Your search pattern is more elusive than a unicorn in the DNS.',
    'No domains found. The internet is taking a coffee break.',
    'Zero results. The DNS gods are not pleased with your query.',
];

interface NoResultsProps {
    className?: string;
    message?: string;
}

export default function NoResults({ className, message }: NoResultsProps) {
    const displayMessage = useMemo(
        () => message ?? NO_RESULTS_MESSAGES[Math.floor(Math.random() * NO_RESULTS_MESSAGES.length)],
        [message],
    );
    return (
        <div className={cn('flex flex-1 flex-col items-center gap-4 p-16', className)}>
            <Player autoplay keepLastFrame src="/sad-empty-box.json" style={{ height: '260px' }} />
            <span className="max-w-sm text-center text-sm text-muted-foreground">{displayMessage}</span>
        </div>
    );
}
