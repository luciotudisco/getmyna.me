import { render, screen, fireEvent } from '@testing-library/react';
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

    it('shows registrar buttons when domain is available', async () => {
        const domain = new Domain('example.com');
        domain.setStatus(DomainStatus.inactive);
        render(
            <DomainDetailDrawer domain={domain} status={domain.getStatus()} open={true} onClose={() => {}} />,
        );

        const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

        const godaddyButton = await screen.findByRole('button', { name: /GoDaddy/i });
        const namecheapButton = screen.getByRole('button', { name: /Namecheap/i });
        const hoverButton = screen.getByRole('button', { name: /Hover/i });

        fireEvent.click(godaddyButton);
        expect(openSpy).toHaveBeenNthCalledWith(
            1,
            `https://www.godaddy.com/domainsearch/find?domainToCheck=${domain.getName()}`,
            '_blank',
        );

        fireEvent.click(namecheapButton);
        expect(openSpy).toHaveBeenNthCalledWith(
            2,
            `https://www.namecheap.com/domains/registration/results/?domain=${domain.getName()}`,
            '_blank',
        );

        fireEvent.click(hoverButton);
        expect(openSpy).toHaveBeenNthCalledWith(
            3,
            `https://www.hover.com/domains/results?q=${domain.getName()}`,
            '_blank',
        );

        openSpy.mockRestore();
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
