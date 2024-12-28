import { TOP_LEVEL_DOMAINS } from './tlds';
import isFQDN from 'validator/lib/isFQDN';
import { Permutation, PowerSet } from 'js-combinatorics';

/**
 * Returns a (possibly empty) list of domains that are domains hacks for the given input string.
 *
 * E.g., Given the input "bill gates", the method will return the following list of vanity domains:
 * ["BILL.GAT.ES", "BILLGAT.ES", "GAT.ES"].
 *
 * @param input - The input string.
 * @returns A (possibly empty) list of vanity domains for the given input string.
 */
export function getDomainsHacks(input: string): string[] {
    input = input.trim().toLowerCase();

    // Split the input into words
    // If more than 3 words, join the middle ones to reduce complexity
    let nameParts = input.split(/\s+/);
    if (nameParts.length > 3) {
        nameParts = [
            nameParts[0],
            nameParts.slice(1, -1).join(''),
            nameParts[nameParts.length - 1],
        ];
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
        const matchingDomains = getMatchingDomains(candidateName);
        matchingDomains.forEach((domain) => domains.push(domain));
    }

    // Removes duplicates.
    return new Set(domains).values().toArray();
}

/**
 * Returns a (possibly empty) list of valid first level domains that match the given input text.
 *
 * E.g. Given the text "MOVING" as input the method will return ["MOV.ING", "MOVI.NG"] where "ING" and "NG" are valid TLDs.
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
 * Returns a (possibly empty) list of TLDs that match the ending of the given input text.
 *
 * E.g. Given the text 'lucio' as input, the method will return ['io'] where 'io' is a valid TLD.
 *
 * @param text - The text.
 * @return A (possibly empty) list of TLDs that match the ending of the given text.
 */
export function getMatchingTLDs(text: string): string[] {
    return TOP_LEVEL_DOMAINS.filter((tld) => text.toUpperCase().endsWith(tld.toUpperCase()));
}
