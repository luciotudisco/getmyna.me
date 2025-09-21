import axios, { AxiosInstance } from 'axios';

import { DigInfo } from '@/models/dig';
import { DomainStatus as DomainStatusEnum } from '@/models/domain';
import { TLD } from '@/models/tld';
import { WhoisInfo } from '@/models/whois';

/**
 * API client for domain-related endpoints.
 */
class APIClient {
    private client: AxiosInstance;

    /**
     * Creates axios instance for API requests.
     */
    constructor() {
        this.client = axios.create();
    }

    /**
     * Gets DNS records for a domain.
     */
    async getDigInfo(domain: string): Promise<DigInfo> {
        const response = await this.client.get(`/api/domains/${domain}/dig`);
        return response.data as DigInfo;
    }

    /**
     * Gets domain availability status.
     */
    async getDomainStatus(domain: string): Promise<DomainStatusEnum> {
        const response = await this.client.get(`/api/domains/${domain}/status`);
        const data = response.data as { status?: Array<{ summary?: string }> };
        return (data.status?.at(-1)?.summary as DomainStatusEnum) ?? DomainStatusEnum.error;
    }

    /**
     * Gets TLD info for a domain.
     */
    async getTld(domain: string): Promise<TLD> {
        const response = await this.client.get(`/api/domains/${domain}/tld`);
        return response.data as TLD;
    }

    /**
     * Gets all available TLDs.
     */
    async getTlds(): Promise<TLD[]> {
        const response = await this.client.get('/api/tlds');
        return response.data.tlds ?? [];
    }

    /**
     * Gets WHOIS data for a registered domain.
     */
    async getWhoisInfo(domain: string): Promise<WhoisInfo> {
        const response = await this.client.get(`/api/domains/${domain}/whois`);
        return response.data as WhoisInfo;
    }

    /**
     * Searches for domains by term.
     */
    async searchDomains(term: string, includeSubdomains = false): Promise<string[]> {
        const response = await this.client.get('/api/domains/search', {
            params: { term, include_subdomains: includeSubdomains },
        });
        return response.data.domainHacks ?? [];
    }
}

export const apiClient = new APIClient();
export { APIClient };
