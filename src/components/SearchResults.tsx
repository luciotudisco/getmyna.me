import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import NumberTicker from '@/components/ui/number-ticker';
import { Badge } from '@/components/ui/badge';
import { ThreeDots } from 'react-loader-spinner';
import { Domain, DomainStatus } from '@/models/domain';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowDown, ArrowUp, ArrowUpDown, BadgeCheck, CircleCheck, OctagonX, Star } from 'lucide-react';

export const columns: ColumnDef<Domain>[] = [
    {
        accessorKey: 'name',
        header: 'Domain',
        cell: ({ cell }) => (
            <p className="flex min-h-10 flex-grow flex-row items-center truncate align-middle font-extralight lowercase">
                {cell.row.original.getName()}
                {cell.row.original.isAvailable() && cell.row.original.getLevel() <= 2 && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <BadgeCheck className="ml-2 h-4 w-4 text-orange-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>This is a rare second level domain!</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </p>
        ),
    },
    {
        accessorKey: '_isAvailable',
        header: ({ column }) => {
            return (
                <div className="flex flex-row items-center justify-end align-middle">
                    <p>Status</p>
                    {column.getIsSorted() === 'asc' ? (
                        <ArrowUp
                            className="ml-2 h-4 w-4"
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        />
                    ) : (
                        <ArrowDown
                            className="ml-2 h-4 w-4"
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        />
                    )}
                </div>
            );
        },
        cell: ({ cell }) => {
            return (
                <div className="flex flex-row items-center justify-end align-middle">
                    <Badge
                        className={`flex min-h-7 min-w-24 justify-center text-center ${
                            cell.row.original.isAvailable()
                                ? 'bg-green-400 hover:bg-green-600'
                                : 'bg-red-400 hover:bg-red-600'
                        }`}
                    >
                        {cell.row.original.isAvailable() ? 'Available' : 'Taken'}
                    </Badge>{' '}
                </div>
            );
        },
    },
];

export function SearchResults() {
    const searchParams = useSearchParams();
    const [domains, setDomains] = useState<Domain[]>([]);
    const [isPending, startTransition] = useTransition();
    const [sorting, setSorting] = useState<SortingState>([]);

    useEffect(() => {
        startTransition(async () => {
            try {
                const term = searchParams.get('term');
                const response = await fetch(`/api/domains/search?term=${term}`);
                const data = await response.json();
                let domains = data.domains.map((name: string) => new Domain(name));
                const statusPromises = domains.map((domain: Domain) =>
                    fetch('/api/domains/status?domain=' + domain.getName()),
                );
                await Promise.all(statusPromises).then((responses) => {
                    responses.forEach(async (response, index) => {
                        const data = await response.json();
                        domains[index].setStatus(data.status.at(0).summary as DomainStatus);
                    });
                });
                domains = domains.sort((a: Domain, b: Domain) => {
                    if (a.isAvailable() && !b.isAvailable()) {
                        return -1;
                    }
                    if (!a.isAvailable() && b.isAvailable()) {
                        return 1;
                    }
                    return a.getLevel() - b.getLevel();
                });
                setDomains(domains || []);
            } catch (error) {
                console.error('Error fetching domains:', error);
                setDomains([]);
            }
        });
    }, [searchParams]);

    const table = useReactTable({
        data: domains,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    });

    if (isPending) {
        return (
            <div className="flex min-h-screen flex-col items-center gap-5 py-24 align-middle">
                <ThreeDots visible={true} height="50" width="50" radius="10" ariaLabel="three-dots-loading" />
                <p className="text-md text-muted-foreground">Hang tight — your info is on the way…</p>
            </div>
        );
    }

    if (domains.length === 0) {
        return (
            <div className="flex min-h-screen flex-col items-center gap-5 py-24 align-middle">
                <p className="text-md text-muted-foreground">Oops! No results found</p>
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
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </main>
        </div>
    );
}
