'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

import { cn } from '@/utils/utils';

const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player), {
    ssr: false,
});

const NO_RESULTS_MESSAGES = [
    'Ouch! Your query returned 0 results. Time to try another search pattern.',
    'No domains found matching your criteria. Try broadening your search.',
    'Empty results! Maybe try a different search term or pattern.',
    'Nothing to see here. Time to refine your search strategy.',
    'Zero matches found. Consider adjusting your search parameters.',
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