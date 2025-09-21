import { Permutation, PowerSet } from 'js-combinatorics';
import isFQDN from 'validator/lib/isFQDN';

import { TLD } from '@/models/tld';
import { tldRepository } from '@/services/tld-repository';

/**
 * A service class for domain-related operations that caches TLD data for performance.
 *
 * This class ensures that the TLD list is retrieved only once and cached for the lifetime
 * of the service instance, improving performance for multiple domain operations.
 */
export class DomainsService {
    private tlds: TLD[] | null = null;
    private tldsPromise: Promise<TLD[]> | null = null;

    /**
     * Initializes the service by pre-loading TLD data.
     */
    constructor() {
        this.initializeTLDs();
    }

    /**
     * Initializes the TLD cache by fetching TLDs from the repository.
     * This method is called once during construction and ensures TLDs are available
     * for all subsequent operations without additional database calls.
     */
    private async initializeTLDs(): Promise<void> {
        if (this.tldsPromise) {
            await this.tldsPromise;
            return;
        }

        this.tldsPromise = tldRepository.listTLDs();
        this.tlds = await this.tldsPromise;
    }

    /**
     * Ensures TLDs are loaded before performing operations.
     */
    private async ensureTLDsLoaded(): Promise<TLD[]> {
        if (this.tlds) {
            return this.tlds;
        }

        if (this.tldsPromise) {
            this.tlds = await this.tldsPromise;
            return this.tlds;
        }

        await this.initializeTLDs();
        return this.tlds!;
    }

    /**
     * Returns a (possibly empty) list of domains that are domains hacks for the given input string.
     *
     * E.g., Given the input "bill gates", the method will return the following list of vanity domains:
     * ["bill.gat.es", "billgat.es", "gat.es"].
     *
     * @param input - The input string.
     * @returns A (possibly empty) list of vanity domains for the given input string.
     */
    async getDomainsHacks(input: string, includeSubdomains = true): Promise<string[]> {
        input = input.trim().toLowerCase();

        // Split the input into words
        // If more than 3 words, join the middle ones to reduce complexity
        let nameParts = input.split(/\s+/);
        if (nameParts.length > 3) {
            nameParts = [nameParts[0], nameParts.slice(1, -1).join(''), nameParts[nameParts.length - 1]];
        }

        // Generate a power set of the name parts.
        // E.g. given ["foo", "bar"] generates ["", "foo", "bar", "foo bar"].
        const namePartsPowerSet = PowerSet.of(nameParts);

        // Generate permutations for each element in the power set.
        const candidateNames: string[] = [];
        for (const element of namePartsPowerSet) {
            const namePartsElementPermutations = Permutation.of(element);
            for (const permutation of namePartsElementPermutations) {
                candidateNames.push(permutation.join(''));
                candidateNames.push(permutation.join('.'));
            }
        }

        const domains: string[] = [];
        for (const candidateName of candidateNames) {
            const matchingDomains = await this.getMatchingDomains(candidateName);
            for (const domain of matchingDomains) {
                const level = domain.split('.').length - 1;
                if (includeSubdomains ? level <= 2 : level <= 1) {
                    domains.push(domain);
                }
            }
        }

        // Removes duplicates.
        return Array.from(new Set(domains));
    }

    /**
     * Returns a (possibly empty) list of valid first level domains that match the given input text.
     *
     * E.g. Given the text "MOVING" as input the method will return ["MOV.ING", "MOVI.NG"] where "ING" and "NG" are valid TLDs.
     *
     * @param text  - The text.
     * @returns A (possibly empty) list of valid first level domains that match the given text.
     */
    async getMatchingDomains(text: string): Promise<string[]> {
        const matchingTLDs = await this.getMatchingTLDs(text);
        const domains: string[] = [];
        for (const tld of matchingTLDs) {
            const domain = text.slice(0, -tld.length);
            const subdomains = this.getSubdomains(domain);
            for (const subdomain of subdomains) {
                const candidate = `${subdomain}.${tld}`.toLowerCase();
                if (isFQDN(candidate)) {
                    domains.push(candidate);
                }
            }
        }
        return domains;
    }

    /**
     * Given a string, returns all the possible ways to split it into valid subdomains.
     *
     * For example, "ABCD" -> ["A.BCD", "AB.CD", "ABC.D", "ABCD"].
     *
     * @param domain - The domain.
     * @returns A list of possible ways to split the domain into subdomains.
     */
    getSubdomains(domain: string): string[] {
        if (!domain || domain.length === 0) {
            return [];
        }

        // Split the domain into parts.
        const results: string[] = [];
        for (let i = 1; i <= domain.length; i++) {
            const label = domain.slice(0, i);
            const remainder = domain.slice(i);
            results.push(remainder ? `${label}.${remainder}` : label);
        }
        return results;
    }

    /**
     * Returns a (possibly empty) list of TLDs that match the ending of the given input text.
     *
     * E.g. Given the text 'lucio' as input, the method will return ['io'] where 'io' is a valid TLD.
     *
     * @param text - The text.
     * @return A (possibly empty) list of TLDs that match the ending of the given text.
     */
    async getMatchingTLDs(text: string): Promise<string[]> {
        const tlds = await this.ensureTLDsLoaded();
        return tlds
            .filter((tld) => text.toLowerCase().endsWith(tld.name?.toLowerCase() || ''))
            .map((tld) => tld.name?.toLowerCase() || '');
    }
}

// Create a singleton instance
const domainsService = new DomainsService();

// Export only the class and singleton instance
export { domainsService };
