import { render, screen } from '@testing-library/react';

import DomainStatusBadge from '@/components/DomainStatusBadge';
import { Domain, DomainStatus } from '@/models/domain';

describe('DomainStatusBadge', () => {
    const createDomainWithStatus = (status: DomainStatus): Domain => {
        const domain = new Domain('example.com');
        domain.setStatus(status);
        return domain;
    };

    describe('Unknown Status', () => {
        it('should render loading spinner for unknown status', () => {
            const domain = createDomainWithStatus(DomainStatus.unknown);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.unknown} />);

            // Check for the loading spinner (Loader2 component)
            const spinner = document.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();
        });

        it('should apply correct classes for unknown status', () => {
            const domain = createDomainWithStatus(DomainStatus.unknown);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.unknown} />);

            const badge = document.querySelector('[class*="inline-flex"]');
            expect(badge).toHaveClass('inline-flex', 'h-7', 'min-w-[8rem]', 'items-center', 'justify-center', 'px-3');
            expect(badge).toHaveClass('border-none', 'bg-transparent', 'shadow-none');
        });

        it('should apply custom className for unknown status', () => {
            const domain = createDomainWithStatus(DomainStatus.unknown);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.unknown} className="custom-class" />);

            const badge = document.querySelector('[class*="custom-class"]');
            expect(badge).toBeInTheDocument();
        });
    });

    describe('Error Status', () => {
        it('should render error badge for error status', () => {
            const domain = createDomainWithStatus(DomainStatus.error);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.error} />);

            expect(screen.getByText('Error')).toBeInTheDocument();
        });

        it('should apply correct classes for error status', () => {
            const domain = createDomainWithStatus(DomainStatus.error);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.error} />);

            const badge = document.querySelector('[class*="bg-yellow-500"]');
            expect(badge).toHaveClass('inline-flex', 'h-7', 'min-w-[8rem]', 'items-center', 'justify-center', 'px-3');
            expect(badge).toHaveClass('bg-yellow-500', 'hover:bg-yellow-600');
        });

        it('should apply custom className for error status', () => {
            const domain = createDomainWithStatus(DomainStatus.error);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.error} className="custom-error-class" />);

            const badge = document.querySelector('[class*="custom-error-class"]');
            expect(badge).toBeInTheDocument();
        });
    });

    describe('Available Status', () => {
        it('should render available badge when domain is available', () => {
            const domain = createDomainWithStatus(DomainStatus.inactive);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.inactive} />);

            expect(screen.getByText('Available')).toBeInTheDocument();
        });

        it('should apply correct classes for available status', () => {
            const domain = createDomainWithStatus(DomainStatus.inactive);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.inactive} />);

            const badge = document.querySelector('[class*="bg-green-500"]');
            expect(badge).toHaveClass('inline-flex', 'h-7', 'min-w-[8rem]', 'items-center', 'justify-center', 'px-3');
            expect(badge).toHaveClass('bg-green-500', 'hover:bg-green-600');
        });

        it('should apply custom className for available status', () => {
            const domain = createDomainWithStatus(DomainStatus.inactive);
            render(
                <DomainStatusBadge domain={domain} status={DomainStatus.inactive} className="custom-available-class" />,
            );

            const badge = document.querySelector('[class*="custom-available-class"]');
            expect(badge).toBeInTheDocument();
        });

        it('should render available badge for premium status when domain is available', () => {
            const domain = createDomainWithStatus(DomainStatus.premium);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.premium} />);

            expect(screen.getByText('Available')).toBeInTheDocument();
        });

        it('should render available badge for transferable status when domain is available', () => {
            const domain = createDomainWithStatus(DomainStatus.transferable);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.transferable} />);

            expect(screen.getByText('Available')).toBeInTheDocument();
        });
    });

    describe('Taken Status', () => {
        it('should render taken badge when domain is not available', () => {
            const domain = createDomainWithStatus(DomainStatus.active);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.active} />);

            expect(screen.getByText('Taken')).toBeInTheDocument();
        });

        it('should apply correct classes for taken status', () => {
            const domain = createDomainWithStatus(DomainStatus.active);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.active} />);

            const badge = document.querySelector('[class*="bg-slate-400"]');
            expect(badge).toHaveClass('inline-flex', 'h-7', 'min-w-[8rem]', 'items-center', 'justify-center', 'px-3');
            expect(badge).toHaveClass('bg-slate-400', 'hover:bg-slate-500');
        });

        it('should apply custom className for taken status', () => {
            const domain = createDomainWithStatus(DomainStatus.active);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.active} className="custom-taken-class" />);

            const badge = document.querySelector('[class*="custom-taken-class"]');
            expect(badge).toBeInTheDocument();
        });

        it('should render taken badge for various non-available statuses', () => {
            const nonAvailableStatuses = [
                DomainStatus.active,
                DomainStatus.claimed,
                DomainStatus.parked,
                DomainStatus.marketed,
            ];

            nonAvailableStatuses.forEach((status) => {
                const domain = createDomainWithStatus(status);
                const { unmount } = render(<DomainStatusBadge domain={domain} status={status} />);
                expect(screen.getByText('Taken')).toBeInTheDocument();
                unmount();
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle domain with no custom className', () => {
            const domain = createDomainWithStatus(DomainStatus.active);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.active} />);

            expect(screen.getByText('Taken')).toBeInTheDocument();
        });

        it('should prioritize status over domain availability for unknown status', () => {
            const domain = createDomainWithStatus(DomainStatus.unknown);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.unknown} />);

            expect(document.querySelector('.animate-spin')).toBeInTheDocument();
            expect(screen.queryByText('Available')).not.toBeInTheDocument();
        });

        it('should prioritize status over domain availability for error status', () => {
            const domain = createDomainWithStatus(DomainStatus.error);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.error} />);

            expect(screen.getByText('Error')).toBeInTheDocument();
            expect(screen.queryByText('Available')).not.toBeInTheDocument();
        });

        it('should handle empty className prop', () => {
            const domain = createDomainWithStatus(DomainStatus.unknown);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.unknown} className="" />);

            expect(document.querySelector('.animate-spin')).toBeInTheDocument();
        });
    });

    describe('Component Integration', () => {
        it('should render with all required props', () => {
            const domain = createDomainWithStatus(DomainStatus.unknown);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.unknown} />);

            expect(document.querySelector('.animate-spin')).toBeInTheDocument();
        });

        it('should handle different domain names', () => {
            const domain1 = new Domain('test.com');
            const domain2 = new Domain('example.org');

            domain1.setStatus(DomainStatus.active);
            domain2.setStatus(DomainStatus.inactive);

            const { rerender } = render(<DomainStatusBadge domain={domain1} status={DomainStatus.active} />);
            expect(screen.getByText('Taken')).toBeInTheDocument();

            rerender(<DomainStatusBadge domain={domain2} status={DomainStatus.inactive} />);
            expect(screen.getByText('Available')).toBeInTheDocument();
        });

        it('should handle different TLDs correctly', () => {
            const domain = new Domain('example.org');
            domain.setStatus(DomainStatus.inactive);

            render(<DomainStatusBadge domain={domain} status={DomainStatus.inactive} />);
            expect(screen.getByText('Available')).toBeInTheDocument();
        });

        it('should handle subdomains correctly', () => {
            const domain = new Domain('sub.example.com');
            domain.setStatus(DomainStatus.active);

            render(<DomainStatusBadge domain={domain} status={DomainStatus.active} />);
            expect(screen.getByText('Taken')).toBeInTheDocument();
        });
    });

    describe('Status Priority Logic', () => {
        it('should show unknown badge regardless of domain availability when status is unknown', () => {
            const domain = createDomainWithStatus(DomainStatus.inactive); // This makes domain available
            render(<DomainStatusBadge domain={domain} status={DomainStatus.unknown} />);

            expect(document.querySelector('.animate-spin')).toBeInTheDocument();
            expect(screen.queryByText('Available')).not.toBeInTheDocument();
        });

        it('should show error badge regardless of domain availability when status is error', () => {
            const domain = createDomainWithStatus(DomainStatus.inactive); // This makes domain available
            render(<DomainStatusBadge domain={domain} status={DomainStatus.error} />);

            expect(screen.getByText('Error')).toBeInTheDocument();
            expect(screen.queryByText('Available')).not.toBeInTheDocument();
        });

        it('should show available badge when domain is available and status is not unknown/error', () => {
            const domain = createDomainWithStatus(DomainStatus.inactive);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.inactive} />);

            expect(screen.getByText('Available')).toBeInTheDocument();
        });

        it('should show taken badge when domain is not available and status is not unknown/error', () => {
            const domain = createDomainWithStatus(DomainStatus.active);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.active} />);

            expect(screen.getByText('Taken')).toBeInTheDocument();
        });
    });
});
