import { DomainStatus } from '@/models/domain';

export interface DictionaryEntry {
    word: string;
    category?: string;
    createdAt?: string;
    locale?: string;
    matchingDomains?: Array<{ domain: string; status?: DomainStatus }>;
    rank?: number;
    updatedAt?: string;
}

export interface PaginationMetadata {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface PaginatedDictionaryResponse {
    data: DictionaryEntry[];
    pagination: PaginationMetadata;
}
