import TLDCounter from '@/components/TLDCounter';
import { Badge } from '@/components/ui/badge';
import { Highlighter } from '@/components/ui/highlighter';

const AboutPage = () => {
    const FaqItem = ({
        question,
        answer,
        color,
        index,
    }: {
        question: string;
        answer: string;
        color: string;
        index: number;
    }) => (
        <div className="mb-8 flex gap-4">
            <div>
                <div className="mb-2 flex items-center gap-2">
                    <span
                        className="flex size-5 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold"
                        style={{ backgroundColor: color }}
                    >
                        {index + 1}
                    </span>
                    <h2 className="text-md font-semibold">{question}</h2>
                </div>
                <p className="text-xs text-muted-foreground lg:text-sm">{answer}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen">
            <main className="m-auto flex w-full max-w-4xl flex-col items-center gap-5 p-5 md:p-10">
                <div className="text-center">
                    <Badge className="text-xs font-medium">ABOUT</Badge>
                    <h1 className="mt-4 text-2xl font-semibold lg:text-4xl">Domain Hacks</h1>
                    <p className="lg:text-md mt-4 text-sm font-medium text-muted-foreground lg:mt-6">
                        Discover how to create memorable domains that{' '}
                        <Highlighter action="highlight" color="#fde2e4">
                            stand out
                        </Highlighter>
                        .
                    </p>
                </div>
                <div className="mx-auto mt-6 max-w-xl lg:mt-14">
                    <FaqItem
                        question="What's a domain hack?"
                        answer="Domain hacks are clever ways of constructing domain names by combining words with TLDs (Top-Level Domains) to to creatively spell out brand names or phrases."
                        color="#fde2e4"
                        index={0}
                    />
                    <FaqItem
                        question="Why are domain hacks so effective?"
                        answer="In a sea of standard '.com' addresses, a domain hack can help your website stand out, pique curiosity, and convey a more modern, tech-savvy image."
                        color="#eff7f6"
                        index={1}
                    />
                    <FaqItem
                        question="Can I build my brand around a domain hack?"
                        answer="Absolutely! A memorable domain hack can become a powerful centerpiece for your brand. By leveraging domain hacks, you can give your site a more appealing identity that resonates with modern users and transform a standard web address into an interactive part of your brand story."
                        color="#e5b3fe"
                        index={2}
                    />
                    <FaqItem
                        question="What are some popular examples of domain hacks?"
                        answer="Popular examples include bit.ly (bitly), del.icio.us (delicious), and goo.gl (Google). These domains are memorable because of their distinctive and playful appearance, making them perfect for sharing and word-of-mouth marketing."
                        color="#ffd6a5"
                        index={3}
                    />
                    <FaqItem
                        question="How do I find the perfect domain hack?"
                        answer="Use our domain search tool to explore creative possibilities and check availability across hundreds of TLDs. Remember, the best domain hacks are short, memorable, and relevant to your brand."
                        color="#bcd4e6"
                        index={4}
                    />
                </div>
                <TLDCounter />
            </main>
        </div>
    );
};

export default AboutPage;
