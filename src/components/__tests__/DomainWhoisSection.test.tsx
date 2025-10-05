import { render, screen } from '@testing-library/react';

import { DomainWhoisSection } from '@/components/DomainWhoisSection';
import { WhoisInfo } from '@/models/whois';

describe('DomainWhoisSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render all whois information when fully populated', () => {
        const whoisInfo: WhoisInfo = {
            creationDate: '2020-01-01T00:00:00Z',
            expirationDate: '2025-01-01T00:00:00Z',
            registrar: 'Example Registrar',
            registrarUrl: 'https://example-registrar.com',
            registrantName: 'John Doe',
        };

        render(<DomainWhoisSection whoisInfo={whoisInfo} />);

        // Check section title
        expect(screen.getByText('Domain Whois')).toBeInTheDocument();

        // Check creation date
        expect(screen.getByText('Created:')).toBeInTheDocument();
        expect(screen.getByText('January 1st, 2020')).toBeInTheDocument();

        // Check registrar with URL
        expect(screen.getByText('Registrar:')).toBeInTheDocument();
        const registrarLink = screen.getByRole('link', { name: 'Example Registrar' });
        expect(registrarLink).toBeInTheDocument();
        expect(registrarLink).toHaveAttribute('href', 'https://example-registrar.com');
        expect(registrarLink).toHaveAttribute('target', '_blank');
        expect(registrarLink).toHaveAttribute('rel', 'noopener noreferrer');

        // Check expiration date
        expect(screen.getByText('Expires:')).toBeInTheDocument();
        expect(screen.getByText('January 1st, 2025')).toBeInTheDocument();

        // Check registrant name
        expect(screen.getByText('Registrant:')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
});
