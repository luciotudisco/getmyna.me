import axios from 'axios';

export interface TldInfo {
    description: string;
    wikipediaUrl: string;
}

export async function getTldInfo(tld: string): Promise<TldInfo> {
    try {
        const response = await axios.get('/api/tlds/info', { params: { tld } });
        const data = response.data;
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
