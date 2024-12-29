'use client';

import Autoplay from 'embla-carousel-autoplay';
import { Carousel as CarouselRoot, CarouselContent } from '@/components/ui/carousel';
import CarouselItem from '@/components/CarouselItem';

export default function Carousel() {
    return (
        <CarouselRoot opts={{ loop: true }} plugins={[Autoplay({ delay: 5000 })]} className="w-full p-5">
            <CarouselContent className="text-md font-mono">
                <CarouselItem
                    title="The original domain for Instagram utilized the .am TLD of Armenia to form a memorable and brand-aligned name"
                    domain="instagr.am"
                    color="#fde2e4"
                />
                <CarouselItem
                    title="A widely recognized URL shortening service that uses the ccTLD of Libya (.ly) to create a catchy and memorable name."
                    domain="bit.ly"
                    color="#e5b3fe"
                />
                <CarouselItem
                    title="Flickr uses this domain hack with the ccTLD of South Korea (.kr) to create a short and recognizable name"
                    domain="flic.kr"
                    color="#bcd4e6"
                />
            </CarouselContent>
        </CarouselRoot>
    );
}
