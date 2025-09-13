'use client';

import dynamic from 'next/dynamic';

const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player), {
    ssr: false,
});

interface LoadingProps {
    height?: number;
    width?: number;
    className?: string;
}

export default function Loading({ height = 120, width = 120, className }: LoadingProps) {
    return <Player autoplay loop src="/loading.json" style={{ height, width }} className={className} />;
}
