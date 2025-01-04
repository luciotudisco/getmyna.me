import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import NumberTicker from '@/components/ui/number-ticker';
import { ThreeDots } from 'react-loader-spinner';
import { Domain, DomainStatus } from '@/models/domain';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, CircleCheck, OctagonX } from 'lucide-react';

export const columns: ColumnDef<Domain>[] = [
    {
        accessorKey: 'name',
        header: 'Domain',
        cell: ({ cell }) => (
            <p className="flex min-h-10 w-full flex-row items-center truncate align-middle font-extralight lowercase">
                {cell.row.original.getName()}
            </p>
        ),
    },
    {
        accessorKey: 'isAvailable',
        header: ({ column }) => {
            return (
                <div className="flex flex-row items-center justify-center">
                    <p>Available</p>
                    <ArrowUpDown
                        className="ml-2 h-4 w-4"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    />
                </div>
            );
        },
        cell: ({ cell }) => {
            return cell.row.original.getIsAvailable() ? (
                <div className="flex flex-row items-center justify-center align-middle">
                    <CircleCheck className="h-4 w-4 justify-center text-green-600" />
                </div>
            ) : (
                <div className="flex flex-row items-center justify-center align-middle">
                    <OctagonX className="h-4 w-4 justify-center text-red-600" />
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
                const domains = data.domains.map((name: string) => new Domain(name));
                const statusPromises = domains.map((domain: Domain) =>
                    fetch('/api/domains/status?domain=' + domain.getName()),
                );
                await Promise.all(statusPromises).then((responses) => {
                    responses.forEach(async (response, index) => {
                        const data = await response.json();
                        domains[index].setStatus(data.status.at(0).summary as DomainStatus);
                    });
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
                <p className="text-md text-muted-foreground">Loading results ...</p>
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
            <main className="m-auto flex flex-col items-center gap-0 p-10 md:w-3/4">
                <p className="text-muted-foregroun whitespace-pre-wrap p-5 font-mono text-sm tracking-tighter text-black dark:text-white">
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
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
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
