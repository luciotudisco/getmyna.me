import { render, screen } from '@testing-library/react';

import { DomainStatusSection } from '@/components/DomainStatusSection';
import { DomainStatus } from '@/models/domain';

describe('DomainStatusSection', () => {
    describe('Basic Rendering', () => {
        it('should render the component with correct structure', () => {
            render(<DomainStatusSection status={DomainStatus.ACTIVE} />);

            expect(screen.getByText('Domain Status')).toBeInTheDocument();
        });

        it('should render status badge', () => {
            render(<DomainStatusSection status={DomainStatus.ACTIVE} />);

            expect(screen.getByText('ACTIVE')).toBeInTheDocument();
        });
    });

    describe('Status Descriptions', () => {
        it('should display description for active status', () => {
            render(<DomainStatusSection status={DomainStatus.ACTIVE} />);

            expect(screen.getByText(/This domain is alive and kicking/)).toBeInTheDocument();
        });

        it('should display description for claimed status', () => {
            render(<DomainStatusSection status={DomainStatus.CLAIMED} />);

            expect(screen.getByText(/Someone owns this domain/)).toBeInTheDocument();
        });

        it('should display description for deleting status', () => {
            render(<DomainStatusSection status={DomainStatus.DELETING} />);

            expect(screen.getByText(/The domain is currently being deleted/)).toBeInTheDocument();
        });

        it('should display description for disallowed status', () => {
            render(<DomainStatusSection status={DomainStatus.DISALLOWED} />);

            expect(screen.getByText(/This domain is off-limits/)).toBeInTheDocument();
        });

        it('should display description for dpml status', () => {
            render(<DomainStatusSection status={DomainStatus.DPML} />);

            expect(screen.getByText(/Locked down by the DPML/)).toBeInTheDocument();
        });

        it('should display description for expiring status', () => {
            render(<DomainStatusSection status={DomainStatus.EXPIRING} />);

            expect(screen.getByText(/Time is ticking/)).toBeInTheDocument();
        });

        it('should display description for inactive status', () => {
            render(<DomainStatusSection status={DomainStatus.INACTIVE} />);

            expect(screen.getByText(/Wide open and ready/)).toBeInTheDocument();
        });

        it('should display description for invalid status', () => {
            render(<DomainStatusSection status={DomainStatus.INVALID} />);

            expect(screen.getByText(/Oops—this one doesn't even count/)).toBeInTheDocument();
        });

        it('should display description for marketed status', () => {
            render(<DomainStatusSection status={DomainStatus.MARKETED} />);

            expect(screen.getByText(/This domain is up for sale/)).toBeInTheDocument();
        });

        it('should display description for parked status', () => {
            render(<DomainStatusSection status={DomainStatus.PARKED} />);

            expect(screen.getByText(/The domain has an owner but is sitting there/)).toBeInTheDocument();
        });

        it('should display description for pending status', () => {
            render(<DomainStatusSection status={DomainStatus.PENDING} />);

            expect(screen.getByText(/In limbo/)).toBeInTheDocument();
        });

        it('should display description for premium status', () => {
            render(<DomainStatusSection status={DomainStatus.PREMIUM} />);

            expect(screen.getByText(/This domain is considered "special"/)).toBeInTheDocument();
        });

        it('should display description for priced status', () => {
            render(<DomainStatusSection status={DomainStatus.PRICED} />);

            expect(screen.getByText(/This domain has a set sticker price/)).toBeInTheDocument();
        });

        it('should display description for reserved status', () => {
            render(<DomainStatusSection status={DomainStatus.RESERVED} />);

            expect(screen.getByText(/The registry has this domain stashed away/)).toBeInTheDocument();
        });

        it('should display description for suffix status', () => {
            render(<DomainStatusSection status={DomainStatus.SUFFIX} />);

            expect(screen.getByText(/This is a known domain ending/)).toBeInTheDocument();
        });

        it('should display description for tld status', () => {
            render(<DomainStatusSection status={DomainStatus.TLD} />);

            expect(screen.getByText(/This domain sits at the top of the hierarchy/)).toBeInTheDocument();
        });

        it('should display description for transferable status', () => {
            render(<DomainStatusSection status={DomainStatus.TRANSFERABLE} />);

            expect(screen.getByText(/This domain can switch hands/)).toBeInTheDocument();
        });

        it('should display description for undelegated status', () => {
            render(<DomainStatusSection status={DomainStatus.UNDELEGATED} />);

            expect(screen.getByText(/The domain exists but hasn't been hooked up/)).toBeInTheDocument();
        });

        it('should display description for unknown status', () => {
            render(<DomainStatusSection status={DomainStatus.UNKNOWN} />);

            expect(screen.getByText(/No one's quite sure what's going on/)).toBeInTheDocument();
        });

        it('should display description for zone status', () => {
            render(<DomainStatusSection status={DomainStatus.ZONE} />);

            expect(screen.getByText(/This domain acts as a zone/)).toBeInTheDocument();
        });

        it('should display description for error status', () => {
            render(<DomainStatusSection status={DomainStatus.ERROR} />);

            expect(screen.getByText(/Something went sideways/)).toBeInTheDocument();
        });
    });
});
