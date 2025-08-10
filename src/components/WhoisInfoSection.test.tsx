import { render, screen } from '@testing-library/react';
import { WhoisInfoSection } from './WhoisInfoSection';
import { WhoisInfo } from '@/models/whois';

const info: WhoisInfo = {
    creationDate: '2000-01-01',
    age: '24 years',
    expirationDate: '2030-01-01',
    registrar: 'Example Registrar',
    registrarUrl: 'https://example-registrar.com',
};

describe('WhoisInfoSection', () => {
    it('renders whois fields', () => {
        render(<WhoisInfoSection whoisInfo={info} />);

        expect(screen.getByText(/Created:/i)).toHaveTextContent('2000-01-01');
        expect(screen.getByText(/Age:/i)).toHaveTextContent('24 years');
        expect(screen.getByText(/Expires:/i)).toHaveTextContent('2030-01-01');
        expect(screen.getByText(/Registrar:/i)).toHaveTextContent('Example Registrar');
        const registrarLink = screen.getByRole('link', { name: 'https://example-registrar.com' });
        expect(registrarLink).toHaveAttribute('href', 'https://example-registrar.com');
    });

    it('hides empty fields', () => {
        const partial: WhoisInfo = {
            creationDate: null,
            age: null,
            expirationDate: null,
            registrar: null,
            registrarUrl: null,
        };
        render(<WhoisInfoSection whoisInfo={partial} />);

        expect(screen.queryByText(/Created:/i)).toBeNull();
        expect(screen.queryByText(/Age:/i)).toBeNull();
        expect(screen.queryByText(/Expires:/i)).toBeNull();
        expect(screen.queryByText(/Registrar:/i)).toBeNull();
        expect(screen.queryByText(/Registrar URL:/i)).toBeNull();
    });
});

