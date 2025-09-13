import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import NumberTicker from '@/components/ui/number-ticker';
import Loading from '@/components/Loading';
import { Domain } from '@/models/domain';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SearchResult } from '@/components/SearchResult';
import { apiService } from '@/services/api';

const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player), { ssr: false });

export function SearchResults() {
    const searchParams = useSearchParams();
    const [domains, setDomains] = useState<Domain[]>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            try {
                const term = searchParams.get('term');
                const includeSubdomains = searchParams.get('include_subdomains') === 'true';
                const names = await apiService.searchDomains(term ?? '', includeSubdomains);
                const initialDomains = names.map((name: string) => new Domain(name));
                setDomains(initialDomains);
            } catch (error) {
                console.error('Error fetching domains:', error);
                setDomains([]);
            }
        });
    }, [searchParams]);

    if (isPending) {
        return (
            <div className="flex min-h-screen flex-col items-center gap-5 py-24 align-middle">
                <Loading height={80} />
            </div>
        );
    }

    if (domains.length === 0) {
        return (
            <div className="flex min-h-screen flex-col items-center gap-5 py-24 align-middle">
                <Player autoplay loop src="/sad-empty-box.json" style={{ height: 120, width: 120 }} />
                <p className="text-md text-center text-muted-foreground">No matches found! Give it another shot.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <main className="m-auto flex flex-col items-center gap-0 p-2 md:w-3/4 md:p-10">
                <p className="text-muted-foregroun whitespace-pre-wrap p-3 font-mono text-sm tracking-tighter text-black dark:text-white md:p-5">
                    <NumberTicker value={domains.length} />
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
