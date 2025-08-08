export interface TldInfo {
    description: string;
    wikipediaUrl: string;
}

export async function getTldInfo(tld: string): Promise<TldInfo> {
    try {
        const res = await fetch(`/api/tlds/info?tld=${tld}`);
        if (!res.ok) {
            throw new Error('Failed to fetch TLD info');
        }
        const data = await res.json();
        return {
            description: data.description ?? 'No additional information is available for this TLD.',
            wikipediaUrl: `https://en.wikipedia.org/wiki/.${tld}`,
        };
    } catch (error) {
        console.error('Error fetching TLD info:', error);
        return {
            description: 'No additional information is available for this TLD.',
            wikipediaUrl: `https://en.wikipedia.org/wiki/.${tld}`,
        };
    }
}
