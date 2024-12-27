'use client';

import Autoplay from 'embla-carousel-autoplay';
import { Carousel as CarouselRoot, CarouselContent, CarouselItem } from './ui/carousel';

export default function Carousel() {
    return (
        <CarouselRoot
            opts={{ loop: true }}
            plugins={[
                Autoplay({
                    delay: 5000,
                }),
            ]}
            className="w-full p-5"
        >
            <CarouselContent className="text-md font-mono">
                <CarouselItem className="m-5 flex items-center justify-center">
                    <blockquote className="text-balance text-center text-xl font-extralight italic text-gray-900">
                        Sean Lott&apos; blog address is as easy as{' '}
                        <span className="font-bold" style={{ backgroundColor: '#fae1dd' }}>
                            seanlo.tt
                        </span>
                    </blockquote>
                </CarouselItem>
                <CarouselItem className="m-5 flex items-center justify-center">
                    <blockquote className="text-balance text-center text-xl font-extralight italic text-gray-900">
                        Velma Griffin can now be reached at{' '}
                        <span className="font-bold" style={{ backgroundColor: '#e8e8e4' }}>
                            svelmagriff.in
                        </span>
                    </blockquote>
                </CarouselItem>
                <CarouselItem className="m-5 flex items-center justify-center">
                    <blockquote className="text-balance text-center text-xl font-extralight italic text-gray-900">
                        Jon Pike is happy with his brand new{' '}
                        <span className="font-bold" style={{ backgroundColor: '#ffd7ba' }}>
                            jonpi.ke{' '}
                        </span>
                    </blockquote>
                </CarouselItem>
            </CarouselContent>
        </CarouselRoot>
    );
}
