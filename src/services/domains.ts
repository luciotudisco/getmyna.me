import { TOP_LEVEL_DOMAINS } from './tlds';
import isFQDN from 'validator/lib/isFQDN';
import { Permutation, PowerSet } from 'js-combinatorics';

/**
 * Returns a (possibly empty) list of first-level domains that are vanity domains for the given input string.
 *
 * E.g., Given the input 'lucio tudisco', the method will return the following list of vanity domains:
 * ['luc.io', 'tudis.co', 'luciotudis.co', 'tudiscoluc.io'].
 *
 * @param input - The input string.
 * @returns A (possibly empty) list of vanity domains for the given input string.
 */
export function getDomains(input: string): string[] {
    // Normalize input string
    input = input.trim().toLowerCase();

    const candidateNames: string[] = [];

    // Split the input into words
    let nameParts = input.split(/\s+/);

    // If more than 3 words, combine the middle ones to reduce complexity
    if (nameParts.length > 3) {
        nameParts = [
            nameParts[0],
            nameParts.slice(1, -1).join(''), // Join middle parts
            nameParts[nameParts.length - 1],
        ];
    }

    // Generate power set of the name parts
    const namePartsPowerSet = PowerSet.of(nameParts);

    // Generate permutations for each element in the power set
    for (const namePartsElement of namePartsPowerSet) {
        const namePartsElementPermutations = Permutation.of(namePartsElement);
        for (const permutation of namePartsElementPermutations) {
            const candidateName = permutation.join('');
            candidateNames.push(candidateName);
        }
    }

    const domains: Set<string> = new Set();
    for (const candidateName of candidateNames) {
        const matchingDomains = getMatchingDomains(candidateName);
        matchingDomains.forEach((domain) => domains.add(domain));
    }

    return domains.size ? Array.from(domains).sort() : [];
}

/**
 * Returns a (possibly empty) list of valid first level domains that match the given string.
 *
 * E.g. Given the text 'MOVING' as input the method will return ['MOV.ING', 'MOVI.NG'] where 'ING' and 'NG' are valid TLDs.
 *
 * @param text  - The text.
 * @returns A (possibly empty) list of valid first level domains that match the given text.
 */
export function getMatchingDomains(text: string): string[] {
    const matchingTLDs = getMatchingTLDs(text);
    return matchingTLDs
        .map((tld) => `${text.slice(0, -tld.length)}.${tld}`.toLocaleUpperCase())
        .filter((domain) => isFQDN(domain));
}

/**
 * Returns a (possibly empty) list of TLDs that match the ending of the given string.
 *
 * E.g. Given the text 'lucio' as input, the method will return ['io'] where 'io' is a valid TLD.
 *
 * @param text - The text.
 * @return A (possibly empty) list of TLDs that match the ending of the given text.
 */
export function getMatchingTLDs(text: string): string[] {
    return TOP_LEVEL_DOMAINS.filter((tld) => text.toUpperCase().endsWith(tld.toUpperCase()));
}
