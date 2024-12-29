import Domain from '@/components/Domain';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Separator } from '@/components/ui/separator';
import NumberTicker from '@/components/ui/number-ticker';
import { ThreeDots } from 'react-loader-spinner';

export function SearchResults() {
    const searchParams = useSearchParams();
    const [domains, setDomains] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            try {
                const term = searchParams.get('term');
                const response = await fetch(`/api/domains/search?term=${term}`);
                const data = await response.json();
                setDomains(data.domains || []);
            } catch (error) {
                console.error('Error fetching domains:', error);
                setDomains([]);
            }
        });
    }, [searchParams]);

    if (isPending) {
        return (
            <div className="flex min-h-screen flex-col items-center gap-5 py-24 align-middle">
                <ThreeDots visible={true} height="50" width="50" radius="10" ariaLabel="three-dots-loading" />
                <p className="text-xl text-muted-foreground">Loading results ...</p>
            </div>
        );
    }

    if (domains.length === 0) {
        return (
            <div className="flex min-h-screen flex-col items-center gap-5 py-24 align-middle">
                <p className="from-accent-foreground text-xl text-muted-foreground">Oops! No results found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <main className="m-auto flex flex-col items-center gap-0 p-10 md:w-3/4">
                <p className="text-muted-foregroun whitespace-pre-wrap p-5 font-mono text-sm tracking-tighter text-black dark:text-white">
                    <NumberTicker value={domains.length} />
                    <span> results found</span>
                </p>
                {domains.map((domain) => (
                    <>
                        <Domain domain={domain} key={domain} />
                        <Separator />
                    </>
                ))}
            </main>
        </div>
    );
}
