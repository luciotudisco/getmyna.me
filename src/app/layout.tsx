import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';

import { Amplitude } from '@/components/Amplitude';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

import './globals.css';

export const metadata: Metadata = {
    title: 'GetMyNa.me - Find the Perfect Domain Hack',
    description: 'Discover creative domain hacks that make your brand memorable. Search thousands of TLDs to find the perfect domain name that stands out.',
    keywords: ['domain hacks', 'creative domains', 'memorable domains', 'TLD search', 'domain names', 'brand domains', 'unique domains', 'domain generator'],
    authors: [{ name: 'GetMyNa.me' }],
    creator: 'GetMyNa.me',
    publisher: 'GetMyNa.me',
    openGraph: {
        title: 'GetMyNa.me - Find the Perfect Domain Hack',
        description: 'Discover creative domain hacks that make your brand memorable. Search thousands of TLDs to find the perfect domain name that stands out.',
        type: 'website',
        url: 'https://getmyna.me',
        siteName: 'GetMyNa.me',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'GetMyNa.me - Find the Perfect Domain Hack',
        description: 'Discover creative domain hacks that make your brand memorable. Search thousands of TLDs to find the perfect domain name that stands out.',
        creator: '@getmyna',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: 'https://getmyna.me',
    },
    verification: {
        google: 'your-google-verification-code', // Replace with actual verification code
    },
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
