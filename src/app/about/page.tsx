import Link from 'next/link';

import TLDCounter from '@/components/TLDCounter';
import { Badge } from '@/components/ui/badge';
import { Highlighter } from '@/components/ui/highlighter';

const AboutPage = () => {
    return (
        <div className="min-h-screen">
            <main className="m-auto flex w-full max-w-4xl flex-col items-center gap-5 p-5 md:p-10">
                <div className="text-center">
                    <Badge className="text-xs font-medium">ABOUT</Badge>
                    <h1 className="mt-4 text-2xl font-semibold lg:text-3xl">Domain Hacks</h1>
                    <p className="mt-2 text-sm font-medium text-muted-foreground lg:text-base">
                        Discover how to create memorable domains that{' '}
                        <Highlighter action="highlight" color="#fde2e4">
                            stand out
                        </Highlighter>
                    </p>
                </div>
                <div className="pt-6">
                    <TLDCounter />
                </div>
                <div className="mx-auto mt-6 max-w-2xl space-y-6 text-sm leading-relaxed">
                    <p>
                        A <span className="font-bold">domain hack</span> is a clever twist on the traditional web
                        address. Instead of sticking to the usual ".com," it creatively blends words with top-level
                        domains (TLDs) to spell out full names or phrases — turning an ordinary URL into something
                        memorable and fun.
                    </p>
                    <p>
                        So, <span className="font-bold">why are domain hacks so effective?</span> In a digital world
                        filled with standard domain names, a well-crafted hack stands out instantly. It sparks
                        curiosity, feels modern, and gives your brand a fresh, tech-savvy edge.
                    </p>
                    <p>
                        And yes —{' '}
                        <span className="font-bold">you can absolutely build your brand around a domain hack.</span> In
                        fact, that's what makes them so powerful. When your web address becomes part of your story, it
                        transforms from a simple link into a statement of creativity and identity.
                    </p>
                    <p>
                        Some of the most recognizable examples prove this point:{' '}
                        <span className="font-bold">bit.ly</span> (bitly), <span className="font-bold">instagr.am</span>{' '}
                        (instagram), and <span className="font-bold">youtu.be</span> (youtube) — all of which turned
                        clever wordplay into global brand assets.
                    </p>
                    <p>
                        Ready to find your own? With <span className="font-bold">getmyna.me</span>, you can explore
                        endless creative possibilities. The best domain hacks are short, memorable, and perfectly
                        aligned with your brand's personality.
                    </p>
                    <div className="p-8 text-center">
                        <Link
                            href="/dictionary"
                            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            style={{ backgroundColor: '#FF595E' }}
                        >
                            🧑🏻‍🚀 Explore the Dictionary
                        </Link>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Search through thousands of words with available domain hacks
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AboutPage;
