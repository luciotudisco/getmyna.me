import { DomainStatus } from '@/models/domain';
import { PaginatedResponse } from '@/models/common';

export interface DictionaryEntry {
    word: string;
    category?: string;
    createdAt?: string;
    locale?: string;
    matchingDomains?: Array<{ domain: string; status?: DomainStatus }>;
    rank?: number;
    updatedAt?: string;
}

export type PaginatedDictionaryResponse = PaginatedResponse<DictionaryEntry>;
