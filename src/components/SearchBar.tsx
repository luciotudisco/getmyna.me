'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function SearchBar() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (event: FormEvent) => {
        event.preventDefault();
        const parms = { term: searchTerm };
        router.push(`/search?${new URLSearchParams(parms).toString()}`);
        router.refresh();
    };

    return (
        <div className="w-full">
            <form className="flex w-full flex-row gap-2" onSubmit={handleSearch}>
                <Input
                    type="text"
                    placeholder="Enter your name"
                    className="rounded-sm font-mono"
                    onChange={(event) => setSearchTerm(event.target.value)}
                    value={searchTerm}
                />
                <Button type="submit" className="rounded-md font-mono">
                    Search
                </Button>
            </form>
        </div>
    );
}
