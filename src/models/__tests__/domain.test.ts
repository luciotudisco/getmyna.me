import { Domain, DomainStatus } from '../domain';

describe('Domain', () => {
    describe('constructor', () => {
        it('should create a domain with correct initial values', () => {
            const domain = new Domain('example.com');

            expect(domain.getName()).toBe('example.com');
            expect(domain.getStatus()).toBe(DomainStatus.unknown);
            expect(domain.isAvailable()).toBe(false);
            expect(domain.getTLD()).toBe('com');
            expect(domain.getLevel()).toBe(2);
        });

        it('should handle single-level domain', () => {
            const domain = new Domain('example');

            expect(domain.getName()).toBe('example');
            expect(domain.getTLD()).toBe('example');
            expect(domain.getLevel()).toBe(1);
        });

        it('should handle multi-level domain', () => {
            const domain = new Domain('sub.example.co.uk');

            expect(domain.getName()).toBe('sub.example.co.uk');
            expect(domain.getTLD()).toBe('uk');
            expect(domain.getLevel()).toBe(4);
        });

        it('should handle domain with special characters', () => {
            const domain = new Domain('test-domain.example-site.org');

            expect(domain.getName()).toBe('test-domain.example-site.org');
            expect(domain.getTLD()).toBe('org');
            expect(domain.getLevel()).toBe(3);
        });
    });

    describe('getRootDomain', () => {
        it('should return empty string for single-level domain', () => {
            const domain = new Domain('example');
            expect(domain.getRootDomain()).toBe('');
        });

        it('should return root domain for two-level domain', () => {
            const domain = new Domain('example.com');
            expect(domain.getRootDomain()).toBe('example');
        });

        it('should return root domain for multi-level domain', () => {
            const domain = new Domain('sub.example.co.uk');
            expect(domain.getRootDomain()).toBe('sub.example.co');
        });

        it('should handle domain with multiple subdomains', () => {
            const domain = new Domain('a.b.c.d.example.com');
            expect(domain.getRootDomain()).toBe('a.b.c.d.example');
        });
    });

    describe('setStatus', () => {
        let domain: Domain;

        beforeEach(() => {
            domain = new Domain('example.com');
        });

        it('should set status and update availability for available statuses', () => {
            domain.setStatus(DomainStatus.inactive);
            expect(domain.getStatus()).toBe(DomainStatus.inactive);
            expect(domain.isAvailable()).toBe(true);

            domain.setStatus(DomainStatus.premium);
            expect(domain.getStatus()).toBe(DomainStatus.premium);
            expect(domain.isAvailable()).toBe(true);

            domain.setStatus(DomainStatus.transferable);
            expect(domain.getStatus()).toBe(DomainStatus.transferable);
            expect(domain.isAvailable()).toBe(true);
        });

        it('should set status and keep availability false for unavailable statuses', () => {
            domain.setStatus(DomainStatus.active);
            expect(domain.getStatus()).toBe(DomainStatus.active);
            expect(domain.isAvailable()).toBe(false);

            domain.setStatus(DomainStatus.claimed);
            expect(domain.getStatus()).toBe(DomainStatus.claimed);
            expect(domain.isAvailable()).toBe(false);

            domain.setStatus(DomainStatus.parked);
            expect(domain.getStatus()).toBe(DomainStatus.parked);
            expect(domain.isAvailable()).toBe(false);

            domain.setStatus(DomainStatus.reserved);
            expect(domain.getStatus()).toBe(DomainStatus.reserved);
            expect(domain.isAvailable()).toBe(false);
        });

        it('should handle all domain statuses', () => {
            const allStatuses = Object.values(DomainStatus);

            allStatuses.forEach((status) => {
                domain.setStatus(status);
                expect(domain.getStatus()).toBe(status);
            });
        });

        it('should maintain availability state correctly when switching between statuses', () => {
            // Start with unavailable status
            domain.setStatus(DomainStatus.active);
            expect(domain.isAvailable()).toBe(false);

            // Switch to available status
            domain.setStatus(DomainStatus.inactive);
            expect(domain.isAvailable()).toBe(true);

            // Switch back to unavailable status
            domain.setStatus(DomainStatus.claimed);
            expect(domain.isAvailable()).toBe(false);
        });
    });

    describe('isAvailable', () => {
        let domain: Domain;

        beforeEach(() => {
            domain = new Domain('example.com');
        });

        it('should return false for unknown status', () => {
            expect(domain.isAvailable()).toBe(false);
        });

        it('should return true for inactive status', () => {
            domain.setStatus(DomainStatus.inactive);
            expect(domain.isAvailable()).toBe(true);
        });

        it('should return true for premium status', () => {
            domain.setStatus(DomainStatus.premium);
            expect(domain.isAvailable()).toBe(true);
        });

        it('should return true for transferable status', () => {
            domain.setStatus(DomainStatus.transferable);
            expect(domain.isAvailable()).toBe(true);
        });

        it('should return false for all other statuses', () => {
            const unavailableStatuses = [
                DomainStatus.active,
                DomainStatus.claimed,
                DomainStatus.deleting,
                DomainStatus.disallowed,
                DomainStatus.dpml,
                DomainStatus.expiring,
                DomainStatus.invalid,
                DomainStatus.marketed,
                DomainStatus.parked,
                DomainStatus.pending,
                DomainStatus.priced,
                DomainStatus.reserved,
                DomainStatus.suffix,
                DomainStatus.tld,
                DomainStatus.undelegated,
                DomainStatus.unknown,
                DomainStatus.zone,
                DomainStatus.error,
            ];

            unavailableStatuses.forEach((status) => {
                domain.setStatus(status);
                expect(domain.isAvailable()).toBe(false);
            });
        });
    });

    describe('edge cases', () => {
        it('should handle empty string domain', () => {
            const domain = new Domain('');
            expect(domain.getName()).toBe('');
            expect(domain.getTLD()).toBe('');
            expect(domain.getLevel()).toBe(1);
            expect(domain.getRootDomain()).toBe('');
        });

        it('should handle domain with only dots', () => {
            const domain = new Domain('...');
            expect(domain.getName()).toBe('...');
            expect(domain.getTLD()).toBe('');
            expect(domain.getLevel()).toBe(4);
        });

        it('should handle domain with trailing dot', () => {
            const domain = new Domain('example.com.');
            expect(domain.getName()).toBe('example.com.');
            expect(domain.getTLD()).toBe('');
            expect(domain.getLevel()).toBe(3);
        });

        it('should handle domain with leading dot', () => {
            const domain = new Domain('.example.com');
            expect(domain.getName()).toBe('.example.com');
            expect(domain.getTLD()).toBe('com');
            expect(domain.getLevel()).toBe(3);
        });
    });
});

describe('DomainStatus', () => {
    it('should have all expected status values', () => {
        const expectedStatuses = [
            'active',
            'claimed',
            'deleting',
            'disallowed',
            'dpml',
            'expiring',
            'inactive',
            'invalid',
            'marketed',
            'parked',
            'pending',
            'premium',
            'priced',
            'reserved',
            'suffix',
            'tld',
            'transferable',
            'undelegated',
            'unknown',
            'zone',
            'error',
        ];

        const actualStatuses = Object.values(DomainStatus);
        expectedStatuses.forEach((status) => {
            expect(actualStatuses).toContain(status);
        });
    });


    it('should have unique status values', () => {
        const statusValues = Object.values(DomainStatus);
        const uniqueValues = new Set(statusValues);
        expect(uniqueValues.size).toBe(statusValues.length);
    });
});

