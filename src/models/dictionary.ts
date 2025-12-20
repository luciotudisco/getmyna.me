/**
 * Represents a dictionary entry in the Algolia index.
 */
export interface DictionaryEntry {
    objectID?: string;
    word?: string;
    category?: string;
    domain: string;
    tld: string;
    isAvailable?: boolean;
}
