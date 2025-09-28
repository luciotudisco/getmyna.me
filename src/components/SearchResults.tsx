import { useEffect, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';

import ErrorMessage from '@/components/ErrorMessage';
import LoadingMessage from '@/components/LoadingMessage';
import NoResults from '@/components/NoResultsMessage';
import { SearchResult } from '@/components/SearchResult';
import NumberTicker from '@/components/ui/number-ticker';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Domain } from '@/models/domain';
import { apiClient } from '@/services/api';

export function SearchResults() {
    const searchParams = useSearchParams();
    const [domains, setDomains] = useState<Domain[]>([]);
    const [hasError, setHasError] = useState(false);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            try {
                setHasError(false);
                const term = searchParams.get('term');
                const includeSubdomains = searchParams.get('include_subdomains') === 'true';
                const names = await apiClient.searchDomains(term ?? '', includeSubdomains);
                const initialDomains = names.map((name: string) => new Domain(name));
                setDomains(initialDomains);
            } catch {
                setHasError(true);
                setDomains([]);
            }
        });
    }, [searchParams]);

    if (isPending) {
        return <LoadingMessage />;
    }

    if (hasError) {
        return <ErrorMessage />;
    }

    if (domains.length === 0) {
        return <NoResults />;
    }

    return (
        <div className="flex-1">
            <main className="m-auto flex flex-col items-center gap-0 p-2 md:w-3/4 md:p-10">
                <p className="whitespace-pre-wrap p-3 font-mono text-xs tracking-tighter text-muted-foreground md:p-5">
                    <NumberTicker value={domains.length} className="text-muted-foreground" />
                    <span> results found</span>
                </p>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Domain</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {domains.map((domain) => (
                            <SearchResult key={domain.getName()} domain={domain} />
                        ))}
                    </TableBody>
                </Table>
            </main>
        </div>
    );
}
