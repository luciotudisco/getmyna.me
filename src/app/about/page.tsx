import { Badge } from '@/components/ui/badge';

export interface FaqItem {
    question: string;
    answer: string;
    color: string;
}

const FAQ_ITEMS: FaqItem[] = [
    {
        question: "What's a domain hack?",
        answer: "Domain hacks are clever ways of constructing domain names by combining words with TLDs (Top-Level Domains) to create memorable, eye-catching URLs. Instead of using traditional '.com' domains, these hacks employ extensions like '.ly', '.io', and '.me' to creatively spell out brand names or phrases.",
        color: '#fde2e4',
    },
    {
        question: 'Why are domain hacks so effective?',
        answer: "Well-crafted domain hacks do more than showcase creativity—they make your site more memorable and shareable. In a sea of standard '.com' addresses, a domain hack can help your website stand out, pique curiosity, and convey a more modern, tech-savvy image.",
        color: '#eff7f6',
    },
    {
        question: 'Can I build my brand around a domain hack?',
        answer: 'Absolutely! A memorable domain hack can become a powerful centerpiece for your brand. By leveraging domain hacks, you can give your site a more appealing identity that resonates with modern users and transform a standard web address into an interactive part of your brand story.',
        color: '#e5b3fe',
    },
    {
        question: 'What are some popular examples of domain hacks?',
        answer: 'Popular examples include bit.ly (bitly), del.icio.us (delicious), and goo.gl (Google). These domains are memorable because of their distinctive and playful appearance, making them perfect for sharing and word-of-mouth marketing.',
        color: '#ffd6a5',
    },
    {
        question: 'How do I find the perfect domain hack?',
        answer: 'Start by brainstorming words related to your brand or service, then experiment with different TLD combinations. Use our domain search tool to explore creative possibilities and check availability across hundreds of TLDs. Remember, the best domain hacks are short, memorable, and relevant to your brand.',
        color: '#bcd4e6',
    },
];

const AboutPage = () => {
    return (
        <div className="min-h-screen">
            <main className="m-auto flex w-full max-w-4xl flex-col items-center gap-5 p-5 md:p-10">
                <div className="text-center">
                    <Badge className="text-xs font-medium">ABOUT</Badge>
                    <h1 className="mt-4 text-2xl font-semibold lg:text-4xl">Domain Hacks & Creative URLs</h1>
                    <p className="lg:text-md lg:mt-6 mt-4 text-sm font-medium text-muted-foreground">
                        Discover how to create memorable, brandable domains that stand out in the digital landscape.
                    </p>
                </div>
                 <div className="mx-auto lg:mt-14 mt-6 max-w-xl">
                     {FAQ_ITEMS.map((faq, index) => (
                         <div key={index} className="mb-8 flex gap-4">
                             <div>
                                 <div className="mb-2 flex items-center gap-2">
                                     <span 
                                         className="flex size-5 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold"
                                         style={{ backgroundColor: faq.color }}
                                     >
                                         {index + 1}
                                     </span>
                                     <h2 className="font-medium lg:text-lg">{faq.question}</h2>
                                 </div>
                                 <p className="text-xs text-muted-foreground lg:text-sm">{faq.answer}</p>
                             </div>
                         </div>
                     ))}
                 </div>
            </main>
        </div>
    );
};

export default AboutPage;
