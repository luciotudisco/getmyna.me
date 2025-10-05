import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';

import { Amplitude } from '@/components/Amplitude';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

import './globals.css';

export const metadata: Metadata = {
    metadataBase: new URL('https://getmyna.me'),
    title: {
        default: 'GetMyNa.me',
        template: '%s | GetMyNa.me',
    },
    description: 'Find the perfect domain hack. Discover creative domain names that combine your brand with clever TLD combinations.',
    keywords: ['domain hack', 'domain names', 'creative domains', 'brand domains', 'TLD', 'domain search'],
    authors: [{ name: 'GetMyNa.me' }],
    creator: 'GetMyNa.me',
    publisher: 'GetMyNa.me',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://getmyna.me',
        siteName: 'GetMyNa.me',
        title: 'GetMyNa.me - Find the Perfect Domain Hack',
        description: 'Discover creative domain names that combine your brand with clever TLD combinations. Find memorable, unique, and catchy domain hacks.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'GetMyNa.me - Find the Perfect Domain Hack',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@getmyname',
        creator: '@getmyname',
        title: 'GetMyNa.me - Find the Perfect Domain Hack',
        description: 'Discover creative domain names that combine your brand with clever TLD combinations.',
        images: ['/twitter-image.png'],
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
    icons: {
        icon: [
            { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        ],
        apple: [
            { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        ],
    },
    alternates: {
        canonical: 'https://getmyna.me',
    },
    category: 'technology',
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
