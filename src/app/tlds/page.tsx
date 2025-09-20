'use client';

import { useEffect, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TLD, TLDType } from '@/models/tld';
import { tldRepository } from '@/services/tld-repository';

const TLDsPage = () => {
    const [tlds, setTlds] = useState<TLD[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTlds = async () => {
            try {
                const data = await tldRepository.listTLDs();
                setTlds(data);
            } catch (err) {
                setError('Failed to load TLD data');
                console.error('Error fetching TLDs:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTlds();
    }, []);

    // Calculate statistics
    const totalTlds = tlds.length;
    const tldsByType = tlds.reduce(
        (acc, tld) => {
            const type = tld.type || TLDType.GENERIC;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        },
        {} as Record<TLDType, number>,
    );

    // Prepare data for pie chart
    const pieData = Object.entries(tldsByType).map(([type, count]) => ({
        name: type.replace('_', ' ').toLowerCase(),
        value: count,
        type: type as TLDType,
    }));

    // Color palette for the pie chart
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347'];

    const getTypeDescription = (type: TLDType) => {
        switch (type) {
            case TLDType.COUNTRY_CODE:
                return 'Two-letter country codes (e.g., .uk, .ca)';
            case TLDType.GENERIC:
                return 'Generic top-level domains (e.g., .com, .app)';
            case TLDType.GENERIC_RESTRICTED:
                return 'Generic domains with registration restrictions (e.g., .biz, .name)';
            case TLDType.INFRASTRUCTURE:
                return 'Technical network infrastructure (e.g., .arpa)';
            case TLDType.SPONSORED:
                return 'Community-specific domains (e.g., .edu, .gov)';
            case TLDType.TEST:
                return 'Reserved or special-use domains for testing (e.g., .test)';
            default:
                return 'Unknown type';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen">
                <main className="m-auto flex w-full max-w-6xl flex-col items-center gap-5 p-5 md:p-10">
                    <div className="text-center">
                        <Badge className="text-xs font-medium">TLDS</Badge>
                        <h1 className="mt-4 text-2xl font-semibold lg:text-4xl">Loading TLD Statistics...</h1>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen">
                <main className="m-auto flex w-full max-w-6xl flex-col items-center gap-5 p-5 md:p-10">
                    <div className="text-center">
                        <Badge className="text-xs font-medium">TLDS</Badge>
                        <h1 className="mt-4 text-2xl font-semibold lg:text-4xl">Error Loading TLD Data</h1>
                        <p className="mt-4 text-sm text-muted-foreground">{error}</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <main className="m-auto flex w-full max-w-6xl flex-col items-center gap-5 p-5 md:p-10">
                <div className="text-center">
                    <Badge className="text-xs font-medium">TLDS</Badge>
                    <h1 className="mt-4 text-2xl font-semibold lg:text-4xl">Top-Level Domain Statistics</h1>
                    <p className="lg:text-md mt-4 text-sm font-medium text-muted-foreground lg:mt-6">
                        Explore our comprehensive collection of supported TLDs and their distribution.
                    </p>
                </div>

                <div className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Total TLDs Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total TLDs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalTlds.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Currently supported domains</p>
                        </CardContent>
                    </Card>

                    {/* Most Common Type */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Most Common Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {pieData.length > 0 ? pieData[0].name.toUpperCase() : 'N/A'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {pieData.length > 0 ? `${pieData[0].value} domains` : 'No data'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Types Available */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Types Available</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Object.keys(tldsByType).length}</div>
                            <p className="text-xs text-muted-foreground">Different TLD categories</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Pie Chart */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>TLD Distribution by Type</CardTitle>
                        <CardDescription>Breakdown of top-level domains by their classification</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-96 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name} (${((percent as number) * 100).toFixed(1)}%)`
                                        }
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => [value.toLocaleString(), 'Count']}
                                        labelFormatter={(label) => `Type: ${label}`}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* TLD Type Details */}
                <div className="grid w-full gap-4 md:grid-cols-2">
                    {Object.entries(tldsByType)
                        .sort(([, a], [, b]) => b - a)
                        .map(([type, count], index) => (
                            <Card key={type}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <CardTitle className="text-sm font-medium">
                                            {type.replace('_', ' ').toUpperCase()}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{count.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {getTypeDescription(type as TLDType)}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                </div>
            </main>
        </div>
    );
};

export default TLDsPage;
