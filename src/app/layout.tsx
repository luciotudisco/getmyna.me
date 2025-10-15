import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';

import { Amplitude } from '@/components/Amplitude';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

import './globals.css';

export const metadata: Metadata = {
    metadataBase: new URL('https://getmyna.me'),
    title: {
        default: 'GetMyNa.me - Find Creative Domain Hacks',
        template: '%s | GetMyNa.me',
    },
    description: 'Discover creative domain hacks. Search through 1000+ TLDs, check availability, and view pricing',
    keywords: [
        'catchy domains',
        'creative domains',
        'domain availability',
        'domain checker',
        'domain hack',
        'domain name generator',
        'domain name ideas',
        'domain pricing',
        'memorable domains',
        'top-level domains',
        'vanity domains',
    ],
    authors: [{ name: 'Lucio Tudisco', url: 'https://github.com/luciotudisco' }],
    creator: 'Lucio Tudisco',
    publisher: 'GetMyNa.me',
    applicationName: 'GetMyNa.me',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Amplitude />
                <SpeedInsights />
                <Header />
                {children}
                <Footer />
            </body>
        </html>
    );
}
