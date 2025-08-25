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

    async digDomain(domain: string, type: DNSRecordType): Promise<DigInfo> {
        const response = await this.client.get(`/api/domains/${domain}/dig`, { params: { type } });
        return response.data as DigInfo;
    }

    async getDomainStatus(domain: string): Promise<DomainStatusEnum> {
        const response = await this.client.get(`/api/domains/${domain}/status`);
        const data = response.data as { status?: { summary?: string }[] };
        return (data.status?.[0]?.summary as DomainStatusEnum) ?? DomainStatusEnum.error;
    }

    async getDomainWhois(domain: string): Promise<WhoisInfo> {
        const response = await this.client.get(`/api/domains/${domain}/whois`);
        return response.data as WhoisInfo;
    }

    async getTldInfo(domain: string): Promise<TldInfo> {
        const response = await this.client.get(`/api/domains/${domain}/tld`);
        return response.data as TldInfo;
    }

    async searchDomains(term: string): Promise<string[]> {
        const response = await this.client.get('/api/domains/search', { params: { term } });
        return response.data.domains ?? [];
    }
}

export const apiService = new ApiService();
export type { ApiService };
