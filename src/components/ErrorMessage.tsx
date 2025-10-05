'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

import { cn } from '@/components/ui/utils';

const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player), {
    ssr: false,
});

const ERROR_MESSAGES = [
    'Hang tight! Our servers are busy chasing a runaway packet.',
    'Hmm... The backend got lost in a maze of JSON. We will guide it back shortly.',
    'Oh no! The API went out for a byte to eat. Try again in a moment.',
    'Oops! Our microservices are having a macro breakdown. Please try again later.',
    'Oops! The backend went to get milk and never came back. Please try again later. ',
    'Whoops! The system tripped over its own wires. Give it another shot soon.',
    'Yikes! The code gremlins are staging a rebellion. Please try again later.',
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
