import { NextResponse } from 'next/server';

import { tldRepository } from '@/services/tld-repository';
import { detectTLDDirection } from '@/utils/utils';

export const maxDuration = 300; // This function can run for a maximum of 5 minutes

export async function GET(): Promise<NextResponse> {
    try {
        console.log('Starting TLD direction update...');

        // Fetch all TLDs from the database
        const tlds = await tldRepository.listTLDs();
        let updatedCount = 0;
        let skippedCount = 0;

        for (const tld of tlds) {
            if (!tld.name) {
                console.log('Skipping TLD with no name');
                skippedCount++;
                continue;
            }

            // Detect text direction for the TLD
            const detectedDirection = detectTLDDirection(tld.name, tld.punycodeName);

            // Only update if direction is not already set or if it's different
            if (tld.direction !== detectedDirection) {
                console.log(`Updating TLD ${tld.name} direction from ${tld.direction} to ${detectedDirection}`);
                await tldRepository.updateTLD(tld.name, {
                    ...tld,
                    direction: detectedDirection,
                });
                updatedCount++;
            } else {
                console.log(`TLD ${tld.name} already has correct direction ${tld.direction}`);
                skippedCount++;
            }
        }

        console.log(`TLD direction update completed. Updated: ${updatedCount}, Skipped: ${skippedCount}`);
        return NextResponse.json({
            message: 'TLD direction update completed successfully',
            updated: updatedCount,
            skipped: skippedCount,
            total: tlds.length,
        });
    } catch (error) {
        console.error('Error during TLD direction update:', error);
        return NextResponse.json({ error: 'Failed to update TLD directions' }, { status: 500 });
    }
}
