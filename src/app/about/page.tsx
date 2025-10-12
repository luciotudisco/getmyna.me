import TLDCounter from '@/components/TLDCounter';
import { Badge } from '@/components/ui/badge';
import { Highlighter } from '@/components/ui/highlighter';

const AboutPage = () => {
    const FaqItem = ({ question, answer }: { question: string; answer: string }) => (
        <div className="mb-8 flex flex-col gap-2">
            <h2 className="text-md text-balance font-semibold uppercase leading-relaxed underline">{question}</h2>
            <p className="text-xs text-muted-foreground lg:text-sm">{answer}</p>
        </div>
    );

    return (
        <div className="min-h-screen">
            <main className="m-auto flex w-full max-w-4xl flex-col items-center gap-5 p-5 md:p-10">
                <div className="text-center">
                    <Badge className="text-xs font-medium">ABOUT</Badge>
                    <h1 className="mt-4 text-2xl font-semibold lg:text-3xl">Domain Hacks</h1>
                    <p className="mt-2 text-sm font-medium text-muted-foreground lg:mt-6 lg:text-base">
                        Discover how to create memorable domains that{' '}
                        <Highlighter action="highlight" color="#fde2e4">
                            stand out
                        </Highlighter>
                    </p>
                </div>
                <div className="mx-auto mt-6 max-w-xl lg:mt-14">
                    <FaqItem
                        question="What's a domain hack?"
                        answer="Domain hacks are clever ways of constructing domain names by combining words with TLDs (Top-Level Domains) to creatively spell out brand names or phrases."
                    />
                    <FaqItem
                        question="Why are domain hacks so effective?"
                        answer="In a sea of standard '.com' addresses, a domain hack can help your website stand out, pique curiosity, and convey a more modern, tech-savvy image."
                    />
                    <FaqItem
                        question="Can I build my brand around a domain hack?"
                        answer="Absolutely! A domain hack can transform a standard web address into part of your brand story."
                    />
                    <FaqItem
                        question="What are some popular examples of domain hacks?"
                        answer="Popular examples include bit.ly (bitly), del.icio.us (delicious), and goo.gl (Google). These domains are memorable because of their distinctive and playful appearance."
                    />
                    <FaqItem
                        question="How do I find the perfect domain hack?"
                        answer="Use GetMyNa.me to explore creative possibilities. Remember, the best domain hacks are short, memorable, and relevant to your brand."
                    />
                </div>
                <TLDCounter />
            </main>
        </div>
    );
};

export default AboutPage;
