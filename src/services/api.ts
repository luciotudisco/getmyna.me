import axios, { AxiosInstance } from 'axios';

import { DigInfo } from '@/models/dig';
import { DomainStatus as DomainStatusEnum } from '@/models/domain';
import { TLD } from '@/models/tld';
import { WhoisInfo } from '@/models/whois';

/**
 * APIClient provides a RESTful interface for interacting with domain-related APIs.
 * 
 * This client handles HTTP requests to various endpoints for domain information,
 * including DNS records (dig), domain status, WHOIS data, TLD information, and domain search.
 * All methods follow RESTful naming conventions and return typed responses.
 * 
 * @example
 * ```typescript
 * import { apiClient } from '@/services/api';
 * 
 * // Get DNS information for a domain
 * const digInfo = await apiClient.getDigInfo('example.com');
 * 
 * // Search for domains
 * const domains = await apiClient.searchDomains('example');
 * ```
 */
class APIClient {
    private client: AxiosInstance;

    /**
     * Initializes a new APIClient instance.
     * Creates an axios instance for making HTTP requests to the API endpoints.
     */
    constructor() {
        this.client = axios.create();
    }

    /**
     * Retrieves DNS (dig) information for a specified domain.
     * 
     * This method fetches DNS records including A, AAAA, MX, CNAME, and other record types
     * for the given domain. The response includes all available DNS records organized by type.
     * 
     * @param domain - The domain name to query (e.g., 'example.com')
     * @returns Promise resolving to DigInfo containing DNS records organized by type
     * @throws {Error} When the API request fails or domain is invalid
     * 
     * @example
     * ```typescript
     * const digInfo = await apiClient.getDigInfo('example.com');
     * console.log(digInfo.records.A); // ['192.168.1.1', '192.168.1.2']
     * ```
     */
    async getDigInfo(domain: string): Promise<DigInfo> {
        const response = await this.client.get(`/api/domains/${domain}/dig`);
        return response.data as DigInfo;
    }

    /**
     * Retrieves the current status of a domain.
     * 
     * This method checks the domain's availability and registration status.
     * Returns the most recent status from the API response, defaulting to 'error'
     * if no status information is available.
     * 
     * @param domain - The domain name to check (e.g., 'example.com')
     * @returns Promise resolving to DomainStatusEnum indicating the domain's status
     * @throws {Error} When the API request fails or domain is invalid
     * 
     * @example
     * ```typescript
     * const status = await apiClient.getDomainStatus('example.com');
     * if (status === DomainStatus.available) {
     *   console.log('Domain is available for registration');
     * }
     * ```
     */
    async getDomainStatus(domain: string): Promise<DomainStatusEnum> {
        const response = await this.client.get(`/api/domains/${domain}/status`);
        const data = response.data as { status?: Array<{ summary?: string }> };
        return (data.status?.at(-1)?.summary as DomainStatusEnum) ?? DomainStatusEnum.error;
    }

    /**
     * Retrieves WHOIS information for a registered domain.
     * 
     * This method fetches domain registration details including creation date,
     * expiration date, registrar information, and other registration metadata.
     * Only works for registered domains; will fail for available domains.
     * 
     * @param domain - The registered domain name (e.g., 'example.com')
     * @returns Promise resolving to WhoisInfo containing registration details
     * @throws {Error} When the API request fails, domain is invalid, or domain is not registered
     * 
     * @example
     * ```typescript
     * const whoisInfo = await apiClient.getWhoisInfo('example.com');
     * console.log(`Domain expires: ${whoisInfo.expirationDate}`);
     * console.log(`Registrar: ${whoisInfo.registrar}`);
     * ```
     */
    async getWhoisInfo(domain: string): Promise<WhoisInfo> {
        const response = await this.client.get(`/api/domains/${domain}/whois`);
        return response.data as WhoisInfo;
    }

    /**
     * Retrieves TLD (Top Level Domain) information for a domain.
     * 
     * This method extracts the TLD from the domain and returns detailed information
     * about the top-level domain including description, type, pricing, and other metadata.
     * 
     * @param domain - The domain name (e.g., 'example.com')
     * @returns Promise resolving to TLD containing top-level domain information
     * @throws {Error} When the API request fails or domain/TLD is invalid
     * 
     * @example
     * ```typescript
     * const tld = await apiClient.getTld('example.com');
     * console.log(`TLD: ${tld.name}`); // 'com'
     * console.log(`Description: ${tld.description}`); // 'Commercial'
     * ```
     */
    async getTld(domain: string): Promise<TLD> {
        const response = await this.client.get(`/api/domains/${domain}/tld`);
        return response.data as TLD;
    }

    /**
     * Retrieves a list of all available TLDs (Top Level Domains).
     * 
     * This method fetches the complete list of supported top-level domains
     * with their associated metadata including descriptions, types, and pricing information.
     * 
     * @returns Promise resolving to array of TLD objects
     * @throws {Error} When the API request fails
     * 
     * @example
     * ```typescript
     * const tlds = await apiClient.getTlds();
     * console.log(`Found ${tlds.length} TLDs`);
     * const comTld = tlds.find(tld => tld.name === 'com');
     * ```
     */
    async getTlds(): Promise<TLD[]> {
        const response = await this.client.get('/api/tlds');
        return response.data.tlds ?? [];
    }

    /**
     * Searches for domains matching the specified search term.
     * 
     * This method performs a search across available domains and returns a list
     * of domain names that match the search criteria. Can optionally include
     * subdomains in the search results.
     * 
     * @param term - The search term to match against domain names
     * @param includeSubdomains - Whether to include subdomains in search results (default: false)
     * @returns Promise resolving to array of matching domain names
     * @throws {Error} When the API request fails or search term is invalid
     * 
     * @example
     * ```typescript
     * // Search for domains containing 'example'
     * const domains = await apiClient.searchDomains('example');
     * console.log(`Found ${domains.length} domains`);
     * 
     * // Search including subdomains
     * const allDomains = await apiClient.searchDomains('test', true);
     * ```
     */
    async searchDomains(term: string, includeSubdomains = false): Promise<string[]> {
        const response = await this.client.get('/api/domains/search', {
            params: { term, include_subdomains: includeSubdomains },
        });
        return response.data.domains ?? [];
    }
}

export const apiClient = new APIClient();
export { APIClient };
