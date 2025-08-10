import { render, screen } from '@testing-library/react';
import { WhoisInfoSection } from './WhoisInfoSection';
import { WhoisInfo } from '@/models/whois';

const info: WhoisInfo = {
    creationDate: '2000-01-01',
    expirationDate: '2030-01-01',
    registrar: 'Example Registrar',
    registrarUrl: 'https://example-registrar.com',
};

describe('WhoisInfoSection', () => {
    it('renders whois information', () => {
        render(<WhoisInfoSection whoisInfo={info} />);

        const paragraph = screen.getByText(/This domain was created on/i);
        expect(paragraph).toHaveTextContent(
            'This domain was created on 2000-01-01. It is registered with Example Registrar. It is set to expire on 2030-01-01.',
        );
        const registrarLink = screen.getByRole('link', { name: 'Example Registrar' });
        expect(registrarLink).toHaveAttribute('href', 'https://example-registrar.com');
    });

    it('returns null when required info is missing', () => {
        const partial: WhoisInfo = {
            creationDate: '2000-01-01',
            expirationDate: null,
            registrar: 'Example Registrar',
            registrarUrl: 'https://example-registrar.com',
        };
        render(<WhoisInfoSection whoisInfo={partial} />);

        expect(screen.queryByText(/This domain was created on/i)).toBeNull();
    });
});

