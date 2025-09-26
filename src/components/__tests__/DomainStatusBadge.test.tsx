import { render, screen } from '@testing-library/react';

import DomainStatusBadge from '@/components/DomainStatusBadge';
import { Domain, DomainStatus } from '@/models/domain';

// Mock the Badge component
jest.mock('@/components/ui/badge', () => ({
    Badge: ({ children, className, ...props }: any) => (
        <div data-testid="badge" className={className} {...props}>
            {children}
        </div>
    ),
}));

// Mock the Loader2 icon
jest.mock('lucide-react', () => ({
    Loader2: ({ className }: any) => (
        <div data-testid="loader" className={className}>
            Loading...
        </div>
    ),
}));

describe('DomainStatusBadge', () => {
    const createMockDomain = (isAvailable: boolean = false): Domain => {
        const domain = new Domain('example.com');
        // Mock the isAvailable method
        jest.spyOn(domain, 'isAvailable').mockReturnValue(isAvailable);
        return domain;
    };

    describe('Unknown Status', () => {
        it('should render loading spinner for unknown status', () => {
            const domain = createMockDomain();
            render(<DomainStatusBadge domain={domain} status={DomainStatus.unknown} />);

            expect(screen.getByTestId('badge')).toBeInTheDocument();
            expect(screen.getByTestId('loader')).toBeInTheDocument();
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('should apply correct classes for unknown status', () => {
            const domain = createMockDomain();
            render(<DomainStatusBadge domain={domain} status={DomainStatus.unknown} />);

            const badge = screen.getByTestId('badge');
            expect(badge).toHaveClass('inline-flex', 'h-7', 'min-w-[8rem]', 'items-center', 'justify-center', 'px-3');
            expect(badge).toHaveClass('border-none', 'bg-transparent', 'shadow-none');
        });

        it('should apply custom className for unknown status', () => {
            const domain = createMockDomain();
            render(<DomainStatusBadge domain={domain} status={DomainStatus.unknown} className="custom-class" />);

            const badge = screen.getByTestId('badge');
            expect(badge).toHaveClass('custom-class');
        });
    });

    describe('Error Status', () => {
        it('should render error badge for error status', () => {
            const domain = createMockDomain();
            render(<DomainStatusBadge domain={domain} status={DomainStatus.error} />);

            expect(screen.getByTestId('badge')).toBeInTheDocument();
            expect(screen.getByText('Error')).toBeInTheDocument();
        });

        it('should apply correct classes for error status', () => {
            const domain = createMockDomain();
            render(<DomainStatusBadge domain={domain} status={DomainStatus.error} />);

            const badge = screen.getByTestId('badge');
            expect(badge).toHaveClass('inline-flex', 'h-7', 'min-w-[8rem]', 'items-center', 'justify-center', 'px-3');
            expect(badge).toHaveClass('bg-yellow-500', 'hover:bg-yellow-600');
        });

        it('should apply custom className for error status', () => {
            const domain = createMockDomain();
            render(<DomainStatusBadge domain={domain} status={DomainStatus.error} className="custom-error-class" />);

            const badge = screen.getByTestId('badge');
            expect(badge).toHaveClass('custom-error-class');
        });
    });

    describe('Available Status', () => {
        it('should render available badge when domain is available', () => {
            const domain = createMockDomain(true); // isAvailable = true
            render(<DomainStatusBadge domain={domain} status={DomainStatus.inactive} />);

            expect(screen.getByTestId('badge')).toBeInTheDocument();
            expect(screen.getByText('Available')).toBeInTheDocument();
        });

        it('should apply correct classes for available status', () => {
            const domain = createMockDomain(true);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.inactive} />);

            const badge = screen.getByTestId('badge');
            expect(badge).toHaveClass('inline-flex', 'h-7', 'min-w-[8rem]', 'items-center', 'justify-center', 'px-3');
            expect(badge).toHaveClass('bg-green-500', 'hover:bg-green-600');
        });

        it('should apply custom className for available status', () => {
            const domain = createMockDomain(true);
            render(
                <DomainStatusBadge domain={domain} status={DomainStatus.inactive} className="custom-available-class" />,
            );

            const badge = screen.getByTestId('badge');
            expect(badge).toHaveClass('custom-available-class');
        });

        it('should render available badge for premium status when domain is available', () => {
            const domain = createMockDomain(true);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.premium} />);

            expect(screen.getByTestId('badge')).toBeInTheDocument();
            expect(screen.getByText('Available')).toBeInTheDocument();
        });

        it('should render available badge for transferable status when domain is available', () => {
            const domain = createMockDomain(true);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.transferable} />);

            expect(screen.getByTestId('badge')).toBeInTheDocument();
            expect(screen.getByText('Available')).toBeInTheDocument();
        });
    });

    describe('Taken Status', () => {
        it('should render taken badge when domain is not available', () => {
            const domain = createMockDomain(false); // isAvailable = false
            render(<DomainStatusBadge domain={domain} status={DomainStatus.active} />);

            expect(screen.getByTestId('badge')).toBeInTheDocument();
            expect(screen.getByText('Taken')).toBeInTheDocument();
        });

        it('should apply correct classes for taken status', () => {
            const domain = createMockDomain(false);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.active} />);

            const badge = screen.getByTestId('badge');
            expect(badge).toHaveClass('inline-flex', 'h-7', 'min-w-[8rem]', 'items-center', 'justify-center', 'px-3');
            expect(badge).toHaveClass('bg-slate-400', 'hover:bg-slate-500');
        });

        it('should apply custom className for taken status', () => {
            const domain = createMockDomain(false);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.active} className="custom-taken-class" />);

            const badge = screen.getByTestId('badge');
            expect(badge).toHaveClass('custom-taken-class');
        });

        it('should render taken badge for various non-available statuses', () => {
            const domain = createMockDomain(false);
            const nonAvailableStatuses = [
                DomainStatus.active,
                DomainStatus.claimed,
                DomainStatus.parked,
                DomainStatus.marketed,
            ];

            nonAvailableStatuses.forEach((status) => {
                const { unmount } = render(<DomainStatusBadge domain={domain} status={status} />);
                expect(screen.getByText('Taken')).toBeInTheDocument();
                unmount();
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle domain with no custom className', () => {
            const domain = createMockDomain(false);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.active} />);

            const badge = screen.getByTestId('badge');
            expect(badge).toBeInTheDocument();
            expect(screen.getByText('Taken')).toBeInTheDocument();
        });

        it('should prioritize status over domain availability for unknown status', () => {
            const domain = createMockDomain(true); // Even if available, unknown status should show loading
            render(<DomainStatusBadge domain={domain} status={DomainStatus.unknown} />);

            expect(screen.getByTestId('loader')).toBeInTheDocument();
            expect(screen.queryByText('Available')).not.toBeInTheDocument();
        });

        it('should prioritize status over domain availability for error status', () => {
            const domain = createMockDomain(true); // Even if available, error status should show error
            render(<DomainStatusBadge domain={domain} status={DomainStatus.error} />);

            expect(screen.getByText('Error')).toBeInTheDocument();
            expect(screen.queryByText('Available')).not.toBeInTheDocument();
        });

        it('should handle empty className prop', () => {
            const domain = createMockDomain();
            render(<DomainStatusBadge domain={domain} status={DomainStatus.unknown} className="" />);

            const badge = screen.getByTestId('badge');
            expect(badge).toBeInTheDocument();
        });
    });

    describe('Component Integration', () => {
        it('should render with all required props', () => {
            const domain = createMockDomain();
            render(<DomainStatusBadge domain={domain} status={DomainStatus.unknown} />);

            expect(screen.getByTestId('badge')).toBeInTheDocument();
        });

        it('should handle different domain names', () => {
            const domain1 = new Domain('test.com');
            const domain2 = new Domain('example.org');

            jest.spyOn(domain1, 'isAvailable').mockReturnValue(false);
            jest.spyOn(domain2, 'isAvailable').mockReturnValue(true);

            const { rerender } = render(<DomainStatusBadge domain={domain1} status={DomainStatus.active} />);
            expect(screen.getByText('Taken')).toBeInTheDocument();

            rerender(<DomainStatusBadge domain={domain2} status={DomainStatus.inactive} />);
            expect(screen.getByText('Available')).toBeInTheDocument();
        });
    });
});
