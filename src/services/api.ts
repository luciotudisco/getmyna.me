import axios, { AxiosInstance } from 'axios';

import { DigInfo, DNSRecordType } from '@/models/dig';
import { DomainStatus as DomainStatusEnum } from '@/models/domain';
import { TLD } from '@/models/tld';
import { WhoisInfo } from '@/models/whois';

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
        const data = response.data as { status?: Array<{ summary?: string }> };
        return (data.status?.at(-1)?.summary as DomainStatusEnum) ?? DomainStatusEnum.error;
    }

    async getDomainWhois(domain: string): Promise<WhoisInfo> {
        const response = await this.client.get(`/api/domains/${domain}/whois`);
        return response.data as WhoisInfo;
    }

    async getTldInfo(domain: string): Promise<TLD> {
        const response = await this.client.get(`/api/domains/${domain}/tld`);
        return response.data as TLD;
    }

    async searchDomains(term: string, includeSubdomains = false): Promise<string[]> {
        const response = await this.client.get('/api/domains/search', {
            params: { term, include_subdomains: includeSubdomains },
        });
        return response.data.domains ?? [];
    }
}

export const apiService = new ApiService();
export type { ApiService };
