import { render, screen } from '@testing-library/react';

import DomainRegistrarButtons from '@/components/DomainRegistrarButtons';
import { Registrar, TLDPricing } from '@/models/tld';

describe('DomainRegistrarButtons', () => {
    describe('when no pricing data is available', () => {
        it('should display unsupported TLD message', () => {
            render(<DomainRegistrarButtons domainName="example.com" pricing={{}} isPremiumDomain={false} />);

            expect(screen.getByText(/We are not aware of any registrars that support this TLD/)).toBeInTheDocument();
        });

        it('should not display any registrar links', () => {
            render(<DomainRegistrarButtons domainName="example.com" pricing={{}} isPremiumDomain={false} />);

            expect(screen.queryByRole('link')).not.toBeInTheDocument();
        });
    });

    describe('when pricing data is available', () => {
        const mockPricing: Partial<Record<Registrar, TLDPricing>> = {
            [Registrar.DYNADOT]: { registration: 10.99 },
            [Registrar.GANDI]: { registration: 12.5 },
            [Registrar.PORKBUN]: { registration: 8.75 },
        };

        it('should display registrar cards sorted by price (lowest first)', () => {
            render(<DomainRegistrarButtons domainName="example.com" pricing={mockPricing} isPremiumDomain={false} />);

            const links = screen.getAllByRole('link');
            expect(links).toHaveLength(3);

            expect(links[0]).toHaveTextContent('Porkbun');
            expect(links[0]).toHaveTextContent('$8.75');

            expect(links[1]).toHaveTextContent('Dynadot');
            expect(links[1]).toHaveTextContent('$10.99');

            expect(links[2]).toHaveTextContent('Gandi');
            expect(links[2]).toHaveTextContent('$12.50');
        });

        it('should show section heading', () => {
            render(<DomainRegistrarButtons domainName="example.com" pricing={mockPricing} isPremiumDomain={false} />);

            expect(screen.getByText('Buy at a registrar')).toBeInTheDocument();
        });

        it('should limit to maximum 3 registrars', () => {
            const largePricing: Partial<Record<Registrar, TLDPricing>> = {
                [Registrar.DYNADOT]: { registration: 10.99 },
                [Registrar.GANDI]: { registration: 12.5 },
                [Registrar.PORKBUN]: { registration: 8.75 },
                [Registrar.NAMECOM]: { registration: 15.0 },
                [Registrar.NAMESILO]: { registration: 9.25 },
            };

            render(<DomainRegistrarButtons domainName="example.com" pricing={largePricing} isPremiumDomain={false} />);

            const links = screen.getAllByRole('link');
            expect(links).toHaveLength(3);

            expect(links[0]).toHaveTextContent('Porkbun');
            expect(links[0]).toHaveTextContent('$8.75');
            expect(links[1]).toHaveTextContent('NameSilo');
            expect(links[1]).toHaveTextContent('$9.25');
            expect(links[2]).toHaveTextContent('Dynadot');
            expect(links[2]).toHaveTextContent('$10.99');
        });

        it('should format prices with 2 decimal places', () => {
            const pricingWithDecimals: Partial<Record<Registrar, TLDPricing>> = {
                [Registrar.DYNADOT]: { registration: 10 },
                [Registrar.GANDI]: { registration: 12.5 },
                [Registrar.PORKBUN]: { registration: 8.123 },
            };

            render(
                <DomainRegistrarButtons
                    domainName="example.com"
                    pricing={pricingWithDecimals}
                    isPremiumDomain={false}
                />,
            );

            expect(screen.getByText('$10.00')).toBeInTheDocument();
            expect(screen.getByText('$12.50')).toBeInTheDocument();
            expect(screen.getByText('$8.12')).toBeInTheDocument();
        });

        it('should handle premium domain status', () => {
            const pricingData: Partial<Record<Registrar, TLDPricing>> = {
                [Registrar.DYNADOT]: { registration: 10.99 },
                [Registrar.GANDI]: { registration: 12.5 },
            };

            render(<DomainRegistrarButtons domainName="premium.com" pricing={pricingData} isPremiumDomain={true} />);

            const links = screen.getAllByRole('link');
            expect(links).toHaveLength(2);

            expect(links[0]).toHaveTextContent('Dynadot');
            expect(links[0]).toHaveTextContent('premium');

            expect(links[1]).toHaveTextContent('Gandi');
            expect(links[1]).toHaveTextContent('premium');

            expect(links[0]).not.toHaveTextContent('$10.99');
            expect(links[1]).not.toHaveTextContent('$12.50');
        });

        it('should link to registrar search pages', () => {
            render(<DomainRegistrarButtons domainName="example.com" pricing={mockPricing} isPremiumDomain={false} />);

            const links = screen.getAllByRole('link');
            expect(links[0]).toHaveAttribute('href', expect.stringContaining('example.com'));
            expect(links[0]).toHaveAttribute('target', '_blank');
            expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
        });
    });
});
