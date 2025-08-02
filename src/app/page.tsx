import Carousel from '@/components/Carousel';
import Feature from '@/components/Feature';
import SearchBar from '@/components/SearchBar';
import { Suspense } from 'react';

export default function Home() {
    return (
        <div className="min-h-screen">
            <main className="m-auto flex w-full max-w-4xl flex-col items-center gap-5 p-5 md:p-10">
                <Suspense fallback={null}>
                    <SearchBar />
                </Suspense>
                <Carousel />
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
