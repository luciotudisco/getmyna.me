import Image from 'next/image';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FeatureProps {
    color?: string;
    description: string;
    image: string;
    title: string;
}

export default function Feature(props: FeatureProps) {
    const { color, description, image, title } = props;

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
