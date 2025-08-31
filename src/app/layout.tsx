import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Amplitude } from '@/components/Amplitude';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
    title: 'GetMyNa.me',
    description: 'Find the perfect domain hack.',
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
                <Header />
                {children}
                <SpeedInsights />
                <Footer />
            </body>
        </html>
    );
}
