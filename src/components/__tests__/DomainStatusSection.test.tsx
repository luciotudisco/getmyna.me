import { render, screen } from '@testing-library/react';

import { DomainStatusSection } from '@/components/DomainStatusSection';
import { DomainStatus } from '@/models/domain';

describe('DomainStatusSection', () => {
    describe('Basic Rendering', () => {
        it('should render the component with correct structure', () => {
            render(<DomainStatusSection status={DomainStatus.active} />);

            // Check for the header section
            expect(screen.getByText('Domain Status')).toBeInTheDocument();
            expect(screen.getByText('Domain Status')).toHaveClass(
                'font-semibold',
                'uppercase',
                'text-muted-foreground',
            );
        });

        it('should render status badge with correct styling', () => {
            render(<DomainStatusSection status={DomainStatus.active} />);

            const badge = screen.getByText('active');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass('uppercase');
        });
    });

    describe('Status Descriptions', () => {
        it('should display description for active status', () => {
            render(<DomainStatusSection status={DomainStatus.active} />);

            expect(screen.getByText(/This domain is alive and kicking/)).toBeInTheDocument();
        });

        it('should display description for claimed status', () => {
            render(<DomainStatusSection status={DomainStatus.claimed} />);

            expect(screen.getByText(/Someone owns this domain/)).toBeInTheDocument();
        });

        it('should display description for deleting status', () => {
            render(<DomainStatusSection status={DomainStatus.deleting} />);

            expect(screen.getByText(/The domain is currently being deleted/)).toBeInTheDocument();
        });

        it('should display description for disallowed status', () => {
            render(<DomainStatusSection status={DomainStatus.disallowed} />);

            expect(screen.getByText(/This domain is off-limits/)).toBeInTheDocument();
        });

        it('should display description for dpml status', () => {
            render(<DomainStatusSection status={DomainStatus.dpml} />);

            expect(screen.getByText(/Locked down by the DPML/)).toBeInTheDocument();
        });

        it('should display description for expiring status', () => {
            render(<DomainStatusSection status={DomainStatus.expiring} />);

            expect(screen.getByText(/Time is ticking/)).toBeInTheDocument();
        });

        it('should display description for inactive status', () => {
            render(<DomainStatusSection status={DomainStatus.inactive} />);

            expect(screen.getByText(/Wide open and ready/)).toBeInTheDocument();
        });

        it('should display description for invalid status', () => {
            render(<DomainStatusSection status={DomainStatus.invalid} />);

            expect(screen.getByText(/Oops—this one doesn't even count/)).toBeInTheDocument();
        });

        it('should display description for marketed status', () => {
            render(<DomainStatusSection status={DomainStatus.marketed} />);

            expect(screen.getByText(/This domain is up for sale/)).toBeInTheDocument();
        });

        it('should display description for parked status', () => {
            render(<DomainStatusSection status={DomainStatus.parked} />);

            expect(screen.getByText(/The domain has an owner but is sitting there/)).toBeInTheDocument();
        });

        it('should display description for pending status', () => {
            render(<DomainStatusSection status={DomainStatus.pending} />);

            expect(screen.getByText(/In limbo/)).toBeInTheDocument();
        });

        it('should display description for premium status', () => {
            render(<DomainStatusSection status={DomainStatus.premium} />);

            expect(screen.getByText(/This domain is considered "special"/)).toBeInTheDocument();
        });

        it('should display description for priced status', () => {
            render(<DomainStatusSection status={DomainStatus.priced} />);

            expect(screen.getByText(/This domain has a set sticker price/)).toBeInTheDocument();
        });

        it('should display description for reserved status', () => {
            render(<DomainStatusSection status={DomainStatus.reserved} />);

            expect(screen.getByText(/The registry has this domain stashed away/)).toBeInTheDocument();
        });

        it('should display description for suffix status', () => {
            render(<DomainStatusSection status={DomainStatus.suffix} />);

            expect(screen.getByText(/This is a known domain ending/)).toBeInTheDocument();
        });

        it('should display description for tld status', () => {
            render(<DomainStatusSection status={DomainStatus.tld} />);

            expect(screen.getByText(/This domain sits at the top of the hierarchy/)).toBeInTheDocument();
        });

        it('should display description for transferable status', () => {
            render(<DomainStatusSection status={DomainStatus.transferable} />);

            expect(screen.getByText(/This domain can switch hands/)).toBeInTheDocument();
        });

        it('should display description for undelegated status', () => {
            render(<DomainStatusSection status={DomainStatus.undelegated} />);

            expect(screen.getByText(/The domain exists but hasn't been hooked up/)).toBeInTheDocument();
        });

        it('should display description for unknown status', () => {
            render(<DomainStatusSection status={DomainStatus.unknown} />);

            expect(screen.getByText(/No one's quite sure what's going on/)).toBeInTheDocument();
        });

        it('should display description for zone status', () => {
            render(<DomainStatusSection status={DomainStatus.zone} />);

            expect(screen.getByText(/This domain acts as a zone/)).toBeInTheDocument();
        });

        it('should display description for error status', () => {
            render(<DomainStatusSection status={DomainStatus.error} />);

            expect(screen.getByText(/Something went sideways/)).toBeInTheDocument();
        });
    });

    describe('All Status Values', () => {
        const allStatuses = Object.values(DomainStatus);

        allStatuses.forEach((status) => {
            it(`should render correctly for ${status} status`, () => {
                render(<DomainStatusSection status={status} />);

                // Check that the status badge is displayed
                expect(screen.getByText(status)).toBeInTheDocument();

                // Check that the status badge has correct styling
                const badge = screen.getByText(status);
                expect(badge).toHaveClass('uppercase');

                // Check that description is displayed (all statuses should have descriptions)
                const description = screen.getByText((content, element) => {
                    return element?.tagName === 'P' && (element?.textContent?.length ?? 0) > 0;
                });
                expect(description).toBeInTheDocument();
            });
        });
    });

    describe('Component Props', () => {
        it('should accept and use the status prop correctly', () => {
            const testStatus = DomainStatus.parked;
            render(<DomainStatusSection status={testStatus} />);

            expect(screen.getByText(testStatus)).toBeInTheDocument();
        });
    });
});
