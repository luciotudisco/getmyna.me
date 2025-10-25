import { DomainStatus } from '@/models/domain';

export interface DictionaryEntry {
    word: string;
    category?: string;
    createdAt?: string;
    locale?: string;
    matchingDomains?: Array<{ domain: string; tld: string; status: DomainStatus }>;
    rank?: number;
    updatedAt?: string;
}
