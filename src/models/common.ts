/**
 * Metadata for pagination.
 *
 * @param page - The page number.
 * @param pageSize - The number of items per page.
 * @param totalCount - The total number of items.
 * @param totalPages - The total number of pages.
 * @param hasNextPage - Whether there is a next page.
 * @param hasPreviousPage - Whether there is a previous page.
 */
export interface PaginationMetadata {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

/**
 * A generic paginated response.
 *
 * @template T - The type of the data in the response.
 * @param data - The data in the response.
 * @param pagination - The pagination metadata.
 */
export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMetadata;
}
