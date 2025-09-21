import Image from 'next/image';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type FeatureType = 'memorable' | 'unique' | 'catchy' | 'stylish';

interface FeatureProps {
    color?: string;
    image: string;
    title: string;
    type: FeatureType;
}

const FEATURE_DESCRIPTIONS: Record<FeatureType, string> = {
    memorable: 'A domain hack is always easy to recall and keeps you top-of-mind.',
    unique: 'A domain hack sets you apart online, representing your personal brand.',
    catchy: 'A domain hack stands out and leaves a long lasting impression.',
    stylish: 'A domain hack is a digital vanity plate: guaranteed to turn heads.',
};

export default function Feature(props: FeatureProps) {
    const { color, image, title, type } = props;
    const description = FEATURE_DESCRIPTIONS[type];

    return (
        <Card className="w-full rounded-sm font-mono shadow-md" style={{ backgroundColor: color }}>
            <CardHeader className="px-5 py-2">
                <div className="flex flex-row items-center gap-5 align-middle">
                    <Image src={image} alt={title} width={48} height={48} />
                    <div className="flex flex-col gap-2 p-2">
                        <CardTitle className="font-extralight">{title}</CardTitle>
                        <CardDescription className="text-balance">{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
}
