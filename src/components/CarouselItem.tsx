import { CarouselItem as Item } from '@/components/ui/carousel';

interface CarouselItemProps {
    color: string;
    domain: string;
    title: string;
}

export default function CarouselItem(props: CarouselItemProps) {
    const { title, domain, color } = props;

    return (
        <Item className="m-5 flex items-center justify-center">
            <blockquote className="text-md text-balance text-center font-mono leading-loose text-gray-900">
                <span className="rounded-md p-1 font-bold" style={{ backgroundColor: color }}>
                    {domain}
                </span>{' '}
                {title}
            </blockquote>
        </Item>
    );
}
