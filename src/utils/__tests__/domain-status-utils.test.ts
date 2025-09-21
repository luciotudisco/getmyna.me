import { DomainStatus } from '@/models/domain';
import { getMostRelevantStatus, isValidDomainStatus, parseDomainStatusFromResponse } from '../domain-status-utils';

describe('domain-status-utils', () => {
    describe('isValidDomainStatus', () => {
        it('should return true for valid domain statuses', () => {
            expect(isValidDomainStatus('active')).toBe(true);
            expect(isValidDomainStatus('inactive')).toBe(true);
            expect(isValidDomainStatus('claimed')).toBe(true);
            expect(isValidDomainStatus('premium')).toBe(true);
        });

        it('should return false for invalid domain statuses', () => {
            expect(isValidDomainStatus('invalid_status')).toBe(false);
            expect(isValidDomainStatus('')).toBe(false);
            expect(isValidDomainStatus('ACTIVE')).toBe(false); // Case sensitive
        });
    });

    describe('getMostRelevantStatus', () => {
        it('should return the highest priority status', () => {
            const statuses = [
                { summary: 'claimed' },
                { summary: 'active' },
                { summary: 'inactive' }
            ];

            const result = getMostRelevantStatus(statuses);
            expect(result).toBe(DomainStatus.active); // Highest priority
        });

        it('should handle empty array', () => {
            const result = getMostRelevantStatus([]);
            expect(result).toBe(DomainStatus.unknown);
        });

        it('should handle undefined/null array', () => {
            const result = getMostRelevantStatus(undefined as any);
            expect(result).toBe(DomainStatus.unknown);
        });

        it('should ignore invalid statuses', () => {
            const statuses = [
                { summary: 'invalid_status' },
                { summary: 'active' },
                { summary: 'another_invalid' }
            ];

            const result = getMostRelevantStatus(statuses);
            expect(result).toBe(DomainStatus.active);
        });

        it('should handle missing summary fields', () => {
            const statuses = [
                { summary: undefined },
                { summary: 'active' },
                {}
            ];

            const result = getMostRelevantStatus(statuses);
            expect(result).toBe(DomainStatus.active);
        });

        it('should return unknown when no valid statuses found', () => {
            const statuses = [
                { summary: 'invalid_status' },
                { summary: 'another_invalid' }
            ];

            const result = getMostRelevantStatus(statuses);
            expect(result).toBe(DomainStatus.unknown);
        });
    });

    describe('parseDomainStatusFromResponse', () => {
        it('should parse valid response correctly', () => {
            const response = {
                status: [
                    { summary: 'claimed' },
                    { summary: 'active' }
                ]
            };

            const result = parseDomainStatusFromResponse(response);
            expect(result).toBe(DomainStatus.active);
        });

        it('should handle non-object response', () => {
            const result = parseDomainStatusFromResponse('invalid');
            expect(result).toBe(DomainStatus.error);
        });

        it('should handle null response', () => {
            const result = parseDomainStatusFromResponse(null);
            expect(result).toBe(DomainStatus.error);
        });

        it('should handle response without status field', () => {
            const response = { otherField: 'value' };
            const result = parseDomainStatusFromResponse(response);
            expect(result).toBe(DomainStatus.error);
        });

        it('should handle non-array status field', () => {
            const response = { status: 'not_an_array' };
            const result = parseDomainStatusFromResponse(response);
            expect(result).toBe(DomainStatus.error);
        });

        it('should handle parsing errors gracefully', () => {
            // Create a circular reference to cause JSON parsing issues
            const circular: any = {};
            circular.self = circular;

            const result = parseDomainStatusFromResponse(circular);
            expect(result).toBe(DomainStatus.error);
        });
    });
});