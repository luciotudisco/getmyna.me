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

            // Check for the loading spinner
            const spinner = document.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();
        });
    });

    describe('Error Status', () => {
        it('should render error badge for error status', () => {
            const domain = createDomainWithStatus(DomainStatus.error);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.error} />);

            expect(screen.getByText('Error')).toBeInTheDocument();
        });
    });

    describe('Available Status', () => {
        it('should render available badge when domain is available', () => {
            const domain = createDomainWithStatus(DomainStatus.inactive);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.inactive} />);

            expect(screen.getByText('Available')).toBeInTheDocument();
        });
    });

    describe('Taken Status', () => {
        it('should render taken badge when domain is not available', () => {
            const domain = createDomainWithStatus(DomainStatus.active);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.active} />);

            expect(screen.getByText('Taken')).toBeInTheDocument();
        });
    });
});
