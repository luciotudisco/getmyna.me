import { render, screen } from '@testing-library/react';
import DomainDetailDrawer from './DomainDetailDrawer';
import { Domain, DomainStatus } from '@/models/domain';

jest.mock('@/components/ui/drawer', () => ({
    Drawer: ({ children }: any) => <div>{children}</div>,
    DrawerContent: ({ children }: any) => <div>{children}</div>,
    DrawerHeader: ({ children }: any) => <div>{children}</div>,
    DrawerTitle: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/services/tld-info', () => ({
    getTldInfo: jest.fn(() => Promise.resolve({ description: 'Test', wikipediaUrl: 'https://example.com' })),
}));

describe('DomainDetailDrawer', () => {
    beforeAll(() => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation((query) => ({
                matches: false,
                media: query,
                onchange: null,
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            })),
        });
    });

    it('shows registrar links when domain is available', async () => {
        const domain = new Domain('example.com');
        domain.setStatus(DomainStatus.inactive);
        render(
            <DomainDetailDrawer domain={domain} status={domain.getStatus()} open={true} onClose={() => {}} />,
        );

        const godaddyLink = await screen.findByRole('link', { name: /GoDaddy/i });
        const namecheapLink = screen.getByRole('link', { name: /Namecheap/i });
        const googleLink = screen.getByRole('link', { name: /Google Domains/i });

        expect(godaddyLink).toHaveAttribute(
            'href',
            `https://www.godaddy.com/domainsearch/find?domainToCheck=${domain.getName()}`,
        );
        expect(namecheapLink).toHaveAttribute(
            'href',
            `https://www.namecheap.com/domains/registration/results/?domain=${domain.getName()}`,
        );
        expect(googleLink).toHaveAttribute(
            'href',
            `https://domains.google.com/registrar/search?searchTerm=${domain.getName()}`,
        );
    });

    it('does not show registrar links when domain is not available', async () => {
        const domain = new Domain('example.com');
        domain.setStatus(DomainStatus.active);
        render(
            <DomainDetailDrawer domain={domain} status={domain.getStatus()} open={true} onClose={() => {}} />,
        );

        expect(screen.queryByText(/Buy this domain:/i)).toBeNull();
    });
});
