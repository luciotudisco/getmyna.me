import { Suspense } from 'react';

import Carousel from '@/components/Carousel';
import Feature from '@/components/Feature';
import SearchBar from '@/components/SearchBar';

export default function Home() {
    return (
        <div className="min-h-screen">
            <main className="m-auto flex w-full max-w-4xl flex-col items-center gap-5 p-5 md:p-10">
                <Suspense fallback={null}>
                    <SearchBar />
                </Suspense>
                <Carousel />
                <Feature color="#fcf6bd" image="bulb.svg" title="Memorable" type="memorable" />
                <Feature color="#d0f4de" image="target.svg" title="Unique" type="unique" />
                <Feature color="#a9def9" image="push-pins.svg" title="Catchy" type="catchy" />
                <Feature color="#e4c1f9" image="presentation.svg" title="Stylish" type="stylish" />
            </main>
        </div>
    );
}
