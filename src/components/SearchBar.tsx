'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

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
        <div className="w-full">
            <form className="flex w-full flex-row gap-2" onSubmit={handleSearch}>
                <Input
                    type="text"
                    placeholder="Type the domain name you want to search"
                    className="rounded-sm font-mono shadow-sm"
                    onChange={(event) => setSearchTerm(event.target.value)}
                    value={searchTerm}
                    autoFocus
                />
                <Button type="submit" className="rounded-md font-mono shadow-sm">
                    Search
                </Button>
            </form>
        </div>
    );
}
