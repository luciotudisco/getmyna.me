import { render, screen } from '@testing-library/react';

import DomainStatusBadge from '@/components/DomainStatusBadge';
import { DomainStatus } from '@/models/domain';

describe('DomainStatusBadge', () => {
    describe('Unknown Status', () => {
        it('should render loading spinner for unknown status', () => {
            render(<DomainStatusBadge status={DomainStatus.UNKNOWN} />);

            const spinner = document.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();
        });
    });

    describe('Error Status', () => {
        it('should render error badge for error status', () => {
            render(<DomainStatusBadge status={DomainStatus.ERROR} />);

            expect(screen.getByText('Error')).toBeInTheDocument();
        });
    });

    describe('Available Status', () => {
        it('should render available badge when domain is available', () => {
            render(<DomainStatusBadge status={DomainStatus.INACTIVE} />);

            expect(screen.getByText('Available')).toBeInTheDocument();
        });

        it('should render premium badge for premium domain', () => {
            render(<DomainStatusBadge status={DomainStatus.PREMIUM} />);

            expect(screen.getByText('✨ Premium ✨')).toBeInTheDocument();
            expect(screen.queryByText('Available')).not.toBeInTheDocument();
        });

        it('should render transferable domain as available', () => {
            render(<DomainStatusBadge status={DomainStatus.TRANSFERABLE} />);

            expect(screen.getByText('Available')).toBeInTheDocument();
        });
    });

    describe('Taken Status', () => {
        it('should render taken badge when domain is not available', () => {
            render(<DomainStatusBadge status={DomainStatus.ACTIVE} />);

            expect(screen.getByText('Taken')).toBeInTheDocument();
        });
    });
});
