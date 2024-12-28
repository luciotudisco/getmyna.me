'use client';

import Autoplay from 'embla-carousel-autoplay';
import { Carousel as CarouselRoot, CarouselContent } from '@/components/ui/carousel';
import CarouselItem from '@/components/CarouselItem';

export default function Carousel() {
    return (
        <CarouselRoot opts={{ loop: true }} plugins={[Autoplay({ delay: 5000 })]} className="w-full p-5">
            <CarouselContent className="text-md font-mono">
                <CarouselItem title="Sean Lott' blog address is as easy as" domain="seanlo.tt" color="#fde2e4" />
                <CarouselItem title="Velma Griffin can now be reached at" domain="velmagriff.in" color="#e5b3fe" />
                <CarouselItem title="Jon Pike is happy with his brand new" domain="jonpi.ke" color="#bcd4e6" />
            </CarouselContent>
        </CarouselRoot>
    );
}
