import { DomainStatus } from '@/models/domain';

/**
 * Priority order for domain statuses (higher index = higher priority)
 * Statuses that indicate the domain is definitely taken should have higher priority
 */
const STATUS_PRIORITY: Record<DomainStatus, number> = {
    [DomainStatus.error]: 0,
    [DomainStatus.unknown]: 1,
    [DomainStatus.inactive]: 2,
    [DomainStatus.premium]: 3,
    [DomainStatus.transferable]: 4,
    [DomainStatus.pending]: 5,
    [DomainStatus.undelegated]: 6,
    [DomainStatus.zone]: 7,
    [DomainStatus.suffix]: 8,
    [DomainStatus.tld]: 9,
    [DomainStatus.reserved]: 10,
    [DomainStatus.disallowed]: 11,
    [DomainStatus.dpml]: 12,
    [DomainStatus.invalid]: 13,
    [DomainStatus.deleting]: 14,
    [DomainStatus.expiring]: 15,
    [DomainStatus.parked]: 16,
    [DomainStatus.marketed]: 17,
    [DomainStatus.priced]: 18,
    [DomainStatus.claimed]: 19,
    [DomainStatus.active]: 20, // Highest priority - domain is definitely taken and active
};

/**
 * Validates if a string is a valid domain status
 */
export function isValidDomainStatus(status: string): status is DomainStatus {
    return Object.values(DomainStatus).includes(status as DomainStatus);
}

/**
 * Determines the most relevant domain status from an array of statuses
 * Returns the status with the highest priority (most definitive)
 */
export function getMostRelevantStatus(statuses: Array<{ summary?: string }>): DomainStatus {
    if (!statuses || statuses.length === 0) {
        return DomainStatus.unknown;
    }

    let highestPriorityStatus = DomainStatus.unknown;
    let highestPriority = -1;

    for (const statusObj of statuses) {
        const summary = statusObj.summary;
        
        if (!summary || !isValidDomainStatus(summary)) {
            continue; // Skip invalid or missing statuses
        }

        const priority = STATUS_PRIORITY[summary];
        if (priority > highestPriority) {
            highestPriority = priority;
            highestPriorityStatus = summary;
        }
    }

    return highestPriorityStatus;
}

/**
 * Safely parses domain status from API response
 */
export function parseDomainStatusFromResponse(data: unknown): DomainStatus {
    try {
        // Type guard to ensure we have the expected structure
        if (!data || typeof data !== 'object') {
            return DomainStatus.error;
        }

        const response = data as Record<string, unknown>;
        
        if (!Array.isArray(response.status)) {
            return DomainStatus.error;
        }

        return getMostRelevantStatus(response.status);
    } catch (error) {
        console.error('Error parsing domain status:', error);
        return DomainStatus.error;
    }
}