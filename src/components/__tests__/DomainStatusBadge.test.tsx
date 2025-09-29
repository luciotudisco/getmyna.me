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
            const domain = createDomainWithStatus(DomainStatus.UNKNOWN);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.UNKNOWN} />);

            // Check for the loading spinner
            const spinner = document.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();
        });
    });

    describe('Error Status', () => {
        it('should render error badge for error status', () => {
            const domain = createDomainWithStatus(DomainStatus.ERROR);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.ERROR} />);

            expect(screen.getByText('Error')).toBeInTheDocument();
        });
    });

    describe('Available Status', () => {
        it('should render available badge when domain is available', () => {
            const domain = createDomainWithStatus(DomainStatus.INACTIVE);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.INACTIVE} />);

            expect(screen.getByText('Available')).toBeInTheDocument();
        });
    });

    describe('Taken Status', () => {
        it('should render taken badge when domain is not available', () => {
            const domain = createDomainWithStatus(DomainStatus.ACTIVE);
            render(<DomainStatusBadge domain={domain} status={DomainStatus.ACTIVE} />);

            expect(screen.getByText('Taken')).toBeInTheDocument();
        });
    });
});
