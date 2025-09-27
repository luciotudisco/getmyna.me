import { render, screen } from '@testing-library/react';

import DomainRegistrarButtons from '@/components/DomainRegistrarButtons';
import { Registrar, TLDPricing } from '@/models/tld';

describe('DomainRegistrarButtons', () => {
    describe('when no pricing data is available', () => {
        it('should display unsupported TLD message', () => {
            render(<DomainRegistrarButtons domainName="example.com" pricing={{}} />);

            expect(screen.getByText(/Oops! This TLD seems to be flying under our radar/)).toBeInTheDocument();
            expect(screen.getByText(/The registrar for this TLD is not yet supported/)).toBeInTheDocument();
        });

        it('should not display any registrar buttons', () => {
            render(<DomainRegistrarButtons domainName="example.com" pricing={{}} />);

            expect(screen.queryByRole('button')).not.toBeInTheDocument();
        });
    });

    describe('when pricing data is available', () => {
        const mockPricing: Partial<Record<Registrar, TLDPricing>> = {
            [Registrar.DYNADOT]: { registration: 10.99 },
            [Registrar.GANDI]: { registration: 12.5 },
            [Registrar.PORKBUN]: { registration: 8.75 },
        };

        it('should display registrar buttons sorted by price (lowest first)', () => {
            render(<DomainRegistrarButtons domainName="example.com" pricing={mockPricing} />);

            const buttons = screen.getAllByRole('button');
            expect(buttons).toHaveLength(3);

            // Should be sorted by price: Porkbun ($8.75), Dynadot ($10.99), Gandi ($12.50)
            expect(buttons[0]).toHaveTextContent('Porkbun');
            expect(buttons[0]).toHaveTextContent('$8.75');

            expect(buttons[1]).toHaveTextContent('Dynadot');
            expect(buttons[1]).toHaveTextContent('$10.99');

            expect(buttons[2]).toHaveTextContent('Gandi');
            expect(buttons[2]).toHaveTextContent('$12.50');
        });

        it('should limit to maximum 3 registrars', () => {
            const largePricing: Partial<Record<Registrar, TLDPricing>> = {
                [Registrar.DYNADOT]: { registration: 10.99 },
                [Registrar.GANDI]: { registration: 12.5 },
                [Registrar.PORKBUN]: { registration: 8.75 },
                [Registrar.NAMECOM]: { registration: 15.0 },
                [Registrar.NAMESILO]: { registration: 9.25 },
            };

            render(<DomainRegistrarButtons domainName="example.com" pricing={largePricing} />);

            const buttons = screen.getAllByRole('button');
            expect(buttons).toHaveLength(3);

            // Should show the 3 cheapest: Porkbun ($8.75), NameSilo ($9.25), Dynadot ($10.99)
            expect(buttons[0]).toHaveTextContent('Porkbun');
            expect(buttons[0]).toHaveTextContent('$8.75');
            expect(buttons[1]).toHaveTextContent('NameSilo');
            expect(buttons[1]).toHaveTextContent('$9.25');
            expect(buttons[2]).toHaveTextContent('Dynadot');
            expect(buttons[2]).toHaveTextContent('$10.99');
        });

        it('should handle registrars without pricing data', () => {
            const mixedPricing: Partial<Record<Registrar, TLDPricing>> = {
                [Registrar.DYNADOT]: { registration: 10.99 },
                [Registrar.GANDI]: {}, // No registration price
                [Registrar.PORKBUN]: { registration: 8.75 },
            };

            render(<DomainRegistrarButtons domainName="example.com" pricing={mixedPricing} />);

            const buttons = screen.getAllByRole('button');
            expect(buttons).toHaveLength(3);

            // Gandi should show "No pricing data"
            const gandiButton = screen.getByText('Gandi').closest('button');
            expect(gandiButton).toHaveTextContent('No pricing data');
        });

        it('should format prices with 2 decimal places', () => {
            const pricingWithDecimals: Partial<Record<Registrar, TLDPricing>> = {
                [Registrar.DYNADOT]: { registration: 10 }, // Should show as $10.00
                [Registrar.GANDI]: { registration: 12.5 }, // Should show as $12.50
                [Registrar.PORKBUN]: { registration: 8.123 }, // Should show as $8.12
            };

            render(<DomainRegistrarButtons domainName="example.com" pricing={pricingWithDecimals} />);

            expect(screen.getByText('$10.00')).toBeInTheDocument();
            expect(screen.getByText('$12.50')).toBeInTheDocument();
            expect(screen.getByText('$8.12')).toBeInTheDocument();
        });
    });
});
