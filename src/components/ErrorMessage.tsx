'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

import { cn } from '@/utils/utils';

const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player), {
    ssr: false,
});

const ERROR_MESSAGES = [
    'Oops! Something went wrong. Please try again later.',
    'Oops! Our servers are having a coffee break. Please try again later.',
    'Oops! Our microservices are having a macro breakdown. Please try again later.',
    'Oops! The backend went to get milk and never came back. Please try again later.',
];

interface ErrorResultsProps {
    className?: string;
    message?: string;
}

export default function ErrorMessage({ className, message }: ErrorResultsProps) {
    const displayMessage = useMemo(() => {
        return message ?? ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
    }, [message]);
    return (
        <div className={cn('flex flex-1 flex-col items-center gap-4 p-16', className)}>
            <Player autoplay keepLastFrame src="/error.json" style={{ height: '260px' }} />
            <span className="max-w-sm text-center text-sm text-muted-foreground">{displayMessage}</span>
        </div>
    );
}
