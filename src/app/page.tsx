import { Suspense } from 'react';
import Link from 'next/link';

import Feature from '@/components/Feature';
import InspirationCarousel from '@/components/InspirationCarousel';
import SearchBar from '@/components/SearchBar';

export default function Home() {
    return (
        <div className="flex flex-col">
            <main className="m-auto flex w-full max-w-4xl flex-col items-center gap-5 p-5 md:p-10">
                <div className="flex w-full flex-col items-center gap-3">
                    <Suspense fallback={null}>
                        <SearchBar />
                    </Suspense>
                    <Link
                        href="/dictionary"
                        className="flex items-center text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <span>or browse available domain hacks</span>
                    </Link>
                </div>
                <InspirationCarousel />
                <Feature
                    color="#fcf6bd"
                    description="A domain hack is always easy to recall and keeps you top-of-mind."
                    image="bulb.svg"
                    title="Memorable"
                />
                <Feature
                    color="#d0f4de"
                    description="A domain hack sets you apart online, representing your personal brand."
                    image="target.svg"
                    title="Unique"
                />
                <Feature
                    color="#a9def9"
                    description="A domain hack stands out and leaves a long lasting impression."
                    image="push-pins.svg"
                    title="Catchy"
                />
                <Feature
                    color="#e4c1f9"
                    description="A domain hack is a digital vanity plate: guaranteed to turn heads."
                    image="presentation.svg"
                    title="Stylish"
                />
            </main>
        </div>
    );
}
