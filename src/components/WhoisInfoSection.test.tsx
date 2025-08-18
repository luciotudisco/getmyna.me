import { render, screen } from '@testing-library/react';
import { WhoisInfoSection } from './WhoisInfoSection';
import { WhoisInfo } from '@/models/whois';

const info: WhoisInfo = {
    creationDate: '2025-10-03',
    expirationDate: '2030-01-01',
    registrar: 'Example Registrar',
    registrarUrl: 'https://example-registrar.com',
};

describe('WhoisInfoSection', () => {
    it('renders whois information', () => {
        render(<WhoisInfoSection whoisInfo={info} />);

        const paragraph = screen.getByText(/This domain was created on/i);
        expect(paragraph).toHaveTextContent(
            'This domain was created on October 3rd, 2025. It is registered with Example Registrar. It is set to expire on January 1st, 2030.',
        );
        const registrarLink = screen.getByRole('link', { name: 'Example Registrar' });
        expect(registrarLink).toHaveAttribute('href', 'https://example-registrar.com');
        expect(registrarLink).toHaveClass('font-bold');
        const creationSpan = screen.getByText('October 3rd, 2025');
        expect(creationSpan).toHaveClass('font-bold');
        const expirationSpan = screen.getByText('January 1st, 2030');
        expect(expirationSpan).toHaveClass('font-bold');
    });

    it('returns null when required info is missing', () => {
        const partial: WhoisInfo = {
            creationDate: '2025-10-03',
            expirationDate: null,
            registrar: 'Example Registrar',
            registrarUrl: 'https://example-registrar.com',
        };
        render(<WhoisInfoSection whoisInfo={partial} />);

        expect(screen.queryByText(/This domain was created on/i)).toBeNull();
    });
});
