import { Domain, DomainStatus } from '@/models/domain';

describe('Domain', () => {
    describe('validation', () => {
        describe('valid domain names', () => {
            it('should accept valid two-level domain', () => {
                expect(() => new Domain('example.com')).not.toThrow();
            });

            it('should accept valid multi-level domain', () => {
                expect(() => new Domain('sub.example.co.uk')).not.toThrow();
            });

            it('should accept domain with hyphens', () => {
                expect(() => new Domain('test-domain.example-site.org')).not.toThrow();
            });

            it('should accept domain with numbers', () => {
                expect(() => new Domain('test123.example456.com')).not.toThrow();
            });

            it('should trim whitespace from domain name', () => {
                const domain = new Domain('  example.com  ');
                expect(domain.getName()).toBe('example.com');
            });

            it('should accept Unicode domain names', () => {
                expect(() => new Domain('测试.com')).not.toThrow();
                expect(() => new Domain('café.fr')).not.toThrow();
                expect(() => new Domain('münchen.de')).not.toThrow();
                expect(() => new Domain('例え.jp')).not.toThrow();
            });
        });

        describe('invalid domain names', () => {
            it('should throw error for empty string', () => {
                expect(() => new Domain('')).toThrow(Error);
                expect(() => new Domain('')).toThrow('Domain name cannot be empty');
            });

            it('should throw error for whitespace only', () => {
                expect(() => new Domain('   ')).toThrow(Error);
                expect(() => new Domain('   ')).toThrow('Domain name cannot be empty');
            });

            it('should throw error for non-string input', () => {
                expect(() => new Domain(123 as any)).toThrow(Error);
                expect(() => new Domain({} as any)).toThrow(Error);
            });

            it('should throw error for single word without dot', () => {
                expect(() => new Domain('example')).toThrow(Error);
                expect(() => new Domain('example')).toThrow('Invalid domain name: example');
            });

            it('should throw error for invalid characters', () => {
                expect(() => new Domain('example@com')).toThrow(Error);
                expect(() => new Domain('example@com')).toThrow('Invalid domain name: example@com');
            });
        });
    });

    describe('getRootDomain', () => {
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
            domain.setStatus(DomainStatus.INACTIVE);
            expect(domain.getStatus()).toBe(DomainStatus.INACTIVE);
            expect(domain.isAvailable()).toBe(true);

            domain.setStatus(DomainStatus.PREMIUM);
            expect(domain.getStatus()).toBe(DomainStatus.PREMIUM);
            expect(domain.isAvailable()).toBe(true);

            domain.setStatus(DomainStatus.TRANSFERABLE);
            expect(domain.getStatus()).toBe(DomainStatus.TRANSFERABLE);
            expect(domain.isAvailable()).toBe(true);
        });

        it('should set status and keep availability false for unavailable statuses', () => {
            domain.setStatus(DomainStatus.ACTIVE);
            expect(domain.getStatus()).toBe(DomainStatus.ACTIVE);
            expect(domain.isAvailable()).toBe(false);

            domain.setStatus(DomainStatus.CLAIMED);
            expect(domain.getStatus()).toBe(DomainStatus.CLAIMED);
            expect(domain.isAvailable()).toBe(false);

            domain.setStatus(DomainStatus.PARKED);
            expect(domain.getStatus()).toBe(DomainStatus.PARKED);
            expect(domain.isAvailable()).toBe(false);

            domain.setStatus(DomainStatus.RESERVED);
            expect(domain.getStatus()).toBe(DomainStatus.RESERVED);
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
            domain.setStatus(DomainStatus.ACTIVE);
            expect(domain.isAvailable()).toBe(false);

            // Switch to available status
            domain.setStatus(DomainStatus.INACTIVE);
            expect(domain.isAvailable()).toBe(true);

            // Switch back to unavailable status
            domain.setStatus(DomainStatus.CLAIMED);
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
            domain.setStatus(DomainStatus.INACTIVE);
            expect(domain.isAvailable()).toBe(true);
        });

        it('should return true for premium status', () => {
            domain.setStatus(DomainStatus.PREMIUM);
            expect(domain.isAvailable()).toBe(true);
        });

        it('should return true for transferable status', () => {
            domain.setStatus(DomainStatus.TRANSFERABLE);
            expect(domain.isAvailable()).toBe(true);
        });

        it('should return false for all other statuses', () => {
            const unavailableStatuses = [
                DomainStatus.ACTIVE,
                DomainStatus.CLAIMED,
                DomainStatus.DELETING,
                DomainStatus.DISALLOWED,
                DomainStatus.DPML,
                DomainStatus.EXPIRING,
                DomainStatus.INVALID,
                DomainStatus.MARKETED,
                DomainStatus.PARKED,
                DomainStatus.PENDING,
                DomainStatus.PRICED,
                DomainStatus.RESERVED,
                DomainStatus.SUFFIX,
                DomainStatus.TLD,
                DomainStatus.UNDELEGATED,
                DomainStatus.UNKNOWN,
                DomainStatus.ZONE,
                DomainStatus.ERROR,
            ];

            unavailableStatuses.forEach((status) => {
                domain.setStatus(status);
                expect(domain.isAvailable()).toBe(false);
            });
        });
    });
});
