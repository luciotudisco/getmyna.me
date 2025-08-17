import axios, { AxiosInstance } from 'axios';
import { DomainStatus as DomainStatusEnum } from '@/models/domain';
import { DigInfo, DNSRecordType } from '@/models/dig';
import { WhoisInfo } from '@/models/whois';
import { TldInfo } from '@/models/tld';

class ApiService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create();
    }

    async searchDomains(term: string): Promise<string[]> {
        const response = await this.client.get('/api/domains/search', { params: { term } });
        return response.data.domains ?? [];
    }

    async getDomainStatus(domain: string): Promise<DomainStatusEnum> {
        const response = await this.client.get('/api/domains/status', { params: { domain } });
        const data = response.data as { status?: { summary?: string }[] };
        return (data.status?.[0]?.summary as DomainStatusEnum) ?? DomainStatusEnum.error;
    }

    async getDomainWhois(domain: string): Promise<WhoisInfo> {
        const response = await this.client.get('/api/domains/whois', { params: { domain } });
        return response.data as WhoisInfo;
    }

    async digDomain(domain: string, type: DNSRecordType): Promise<DigInfo> {
        const response = await this.client.get('/api/domains/dig', { params: { domain, type } });
        return response.data as DigInfo;
    }

    async getTldInfo(tld: string): Promise<TldInfo> {
        const response = await this.client.get('/api/tlds/info', { params: { tld } });
        const data = response.data;
        return {
            description: data.description,
        };
    }
}

export const apiService = new ApiService();
export type { ApiService };
