import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';

import { Amplitude } from '@/components/Amplitude';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

import './globals.css';

export const metadata: Metadata = {
    title: 'GetMyNa.me',
    description:
        'Find the perfect domain hack. Discover creative domain names that combine your brand with clever TLD combinations.',
    keywords: ['domain hack', 'domain names', 'creative domains', 'brand domains', 'TLD', 'domain search'],
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
