import { NextResponse } from 'next/server';

import { tldRepository } from '@/services/tld-repository';

export async function GET(): Promise<NextResponse> {
    try {
        // Check if required environment variables are set
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json(
                {
                    error: 'Database configuration missing. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.',
                    tlds: [],
                },
                { status: 503 },
            );
        }

        const tlds = await tldRepository.listTLDs();
        return NextResponse.json({ tlds });
    } catch (error) {
        console.error('Error fetching TLDs:', error);
        return NextResponse.json({ error: 'Failed to fetch TLDs' }, { status: 500 });
    }
}
