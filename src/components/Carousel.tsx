'use client';

import Autoplay from 'embla-carousel-autoplay';

import { Carousel as CarouselRoot, CarouselContent, CarouselItem as Item } from '@/components/ui/carousel';

export default function Carousel() {
    function CarouselItem({ title, domain, color }: { title: string; domain?: string; color?: string }) {
        return (
            <Item className="m-2 flex items-center justify-center align-middle md:m-5">
                <p className="text-balance text-center text-sm leading-loose">
                    <span className="rounded-md p-1 font-bold" style={{ backgroundColor: color }}>
                        {domain}
                    </span>{' '}
                    {title}
                </p>
            </Item>
        );
    }

    return (
        <CarouselRoot opts={{ loop: true }} plugins={[Autoplay({ delay: 4000 })]} className="w-full p-5">
            <CarouselContent className="text-sm">
                <CarouselItem title="A domain hack is a clever twist where the domain and extension merge together. Perfect for creating short, catchy, and brandable web addresses." />
                <CarouselItem
                    title="The original domain for Instagram utilized the TLD of Armenia (.am) to form a memorable and brand-aligned name"
                    domain="instagr.am"
                    color="#fde2e4"
                />
                <CarouselItem
                    title="Matt Mullenweg - co-founder of WordPress - uses Trinidad and Tobago's TLD (.tt) to create an ultra-short domain."
                    domain="ma.tt"
                    color="#eff7f6"
                />
                <CarouselItem
                    title="A widely recognized URL shortening service that uses the TLD of Libya (.ly) to create a catchy and memorable name."
                    domain="bit.ly"
                    color="#e5b3fe"
                />
                <CarouselItem
                    title="Naval Ravikant - co-founder of AngelList - uses Albania's TLD (.al) to succinctly spells out his name."
                    domain="nav.al"
                    color="#ffd6a5"
                />
                <CarouselItem
                    title="Flickr uses a domain hack with the TLD of South Korea (.kr) to create a short and recognizable name"
                    domain="flic.kr"
                    color="#bcd4e6"
                />
                <CarouselItem
                    title="Kevin Rose - founder of Digg - uses Sweden's TLD (.se) to complete his last name."
                    domain="kevinro.se"
                    color="#cbf3f0"
                />
            </CarouselContent>
        </CarouselRoot>
    );
}
