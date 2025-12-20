#!/usr/bin/env node
import { algoliasearch } from 'algoliasearch';

type AnyRecord = Record<string, unknown>;

function getArgValue(flag: string): string | undefined {
    const args = process.argv.slice(2);
    const idx = args.indexOf(flag);
    if (idx === -1) return undefined;
    return args[idx + 1];
}

function hasFlag(flag: string): boolean {
    return process.argv.slice(2).includes(flag);
}

function toPositiveInt(value: string | undefined, fallback: number): number {
    if (!value) return fallback;
    const n = Number.parseInt(value, 10);
    if (!Number.isFinite(n) || n <= 0) return fallback;
    return n;
}

function sanitizeAlgoliaHitForSave(hit: AnyRecord): AnyRecord {
    const obj: AnyRecord = { ...hit };

    // Metadata fields Algolia adds to search/browse responses; avoid persisting them.
    delete obj._highlightResult;
    delete obj._snippetResult;
    delete obj._rankingInfo;
    delete obj._distinctSeqID;
    delete obj.__position;
    delete obj.__queryID;

    return obj;
}

async function main(): Promise<void> {
    if (hasFlag('--help') || hasFlag('-h')) {
        console.log(
            [
                'Re-upsert every Algolia object, updating a timestamp field to now.',
                '',
                'Usage:',
                '  tsx scripts/reupsert-algolia-last-updated.ts [--index <indexName>] [--field <fieldName>] [--batchSize <n>] [--dryRun]',
                '',
                'Environment:',
                '  NEXT_PUBLIC_ALGOLIA_APP_ID (or ALGOLIA_APP_ID)',
                '  ALGOLIA_API_KEY (Admin API key, required)',
                '  NEXT_PUBLIC_ALGOLIA_INDEX_NAME (or pass --index)',
                '',
                'Defaults:',
                '  --field lastUpdated',
                '  --batchSize 1000',
            ].join('\n'),
        );
        process.exit(0);
    }

    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? process.env.ALGOLIA_APP_ID;
    const apiKey = process.env.ALGOLIA_API_KEY;
    const indexName = getArgValue('--index') ?? process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;

    if (!appId) {
        console.error('Missing env var: NEXT_PUBLIC_ALGOLIA_APP_ID (or ALGOLIA_APP_ID)');
        process.exit(1);
    }
    if (!apiKey) {
        console.error('Missing env var: ALGOLIA_API_KEY (Admin API key)');
        process.exit(1);
    }
    if (!indexName) {
        console.error('Missing index name: pass --index <indexName> or set NEXT_PUBLIC_ALGOLIA_INDEX_NAME');
        process.exit(1);
    }

    // TypeScript does not reliably narrow after process.exit().
    const resolvedAppId: string = appId as string;
    const resolvedApiKey: string = apiKey as string;
    const resolvedIndexName: string = indexName as string;

    const fieldName = getArgValue('--field') ?? 'lastUpdated';
    const batchSize = toPositiveInt(getArgValue('--batchSize'), 1000);
    const dryRun = hasFlag('--dryRun');
    const nowIso = new Date().toISOString();

    const client = algoliasearch(resolvedAppId, resolvedApiKey);

    let seen = 0;
    let saved = 0;
    let skipped = 0;
    const batch: AnyRecord[] = [];

    async function flush(): Promise<void> {
        if (batch.length === 0) return;
        const toSave = batch.splice(0, batch.length);

        if (dryRun) {
            saved += toSave.length;
            return;
        }

        await client.saveObjects({
            indexName: resolvedIndexName,
            objects: toSave,
        });
        saved += toSave.length;
    }

    console.log(
        `Starting re-upsert: index="${resolvedIndexName}", field="${fieldName}", batchSize=${batchSize}, dryRun=${dryRun}, now="${nowIso}"`,
    );

    await client.browseObjects({
        indexName: resolvedIndexName,
        browseParams: {
            hitsPerPage: Math.min(batchSize, 1000),
        },
        aggregator: async ({ hits }) => {
            for (const rawHit of hits as AnyRecord[]) {
                seen++;
                const objectID = rawHit.objectID;
                if (typeof objectID !== 'string' || objectID.length === 0) {
                    skipped++;
                    continue;
                }

                const hit = sanitizeAlgoliaHitForSave(rawHit);
                hit[fieldName] = nowIso;
                batch.push(hit);

                if (batch.length >= batchSize) {
                    await flush();
                    if (saved % (batchSize * 10) === 0) {
                        console.log(`Progress: seen=${seen}, saved=${saved}, skipped=${skipped}`);
                    }
                }
            }
        },
    });

    await flush();

    console.log(`Done: seen=${seen}, saved=${saved}, skipped=${skipped}`);
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
