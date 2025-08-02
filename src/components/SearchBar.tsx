'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';

export default function SearchBar() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState<string>('');

    const handleSearch = (event: FormEvent) => {
        event.preventDefault();
        if (!searchTerm) {
            return;
        }
        const parms = { term: searchTerm };
        router.push(`/search?${new URLSearchParams(parms).toString()}`);
        router.refresh();
    };

    return (
        <form className="flex w-full flex-row gap-2" onSubmit={handleSearch}>
            <div className="relative flex w-full flex-row items-center align-middle">
                <SearchIcon size={18} className="absolute left-2 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Find the perfect domain hack"
                    className="rounded-sm pl-10 pr-10 shadow-sm !text-base"
                    onChange={(event) => setSearchTerm(event.target.value)}
                    value={searchTerm}
                    autoFocus
                />
                {searchTerm && (
                    <Button
                        variant="ghost"
                        type="button"
                        className="absolute right-0 hover:bg-inherit"
                        onClick={() => setSearchTerm('')}
                        autoFocus={false}
                    >
                        <XIcon size={18} className="text-muted-foreground" />
                    </Button>
                )}
            </div>
            <Button type="submit" className="rounded-md shadow-sm hidden md:inline">
                Search
            </Button>
        </form>
    );
}
