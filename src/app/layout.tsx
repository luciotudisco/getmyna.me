import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Particles from '@/components/ui/particles';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'GetMyNa.me',
    description: 'Find your vanity domain',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Header />
                {children}
                <Particles
                    className="absolute inset-0"
                    quantity={100}
                    ease={80}
                    color="rgba(255, 255, 255, 0.5)"
                    refresh
                />
                <Footer />
            </body>
        </html>
    );
}
