import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
        render(<DomainDetailDrawer domain={domain} status={domain.getStatus()} open={true} onClose={() => {}} />);

        const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

        const godaddyButton = await screen.findByRole('button', { name: /GoDaddy/i });
        const namecheapButton = screen.getByRole('button', { name: /Namecheap/i });
        const porkbunButton = screen.getByRole('button', { name: /Porkbun/i });

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

        fireEvent.click(porkbunButton);
        expect(openSpy).toHaveBeenNthCalledWith(
            3,
            `https://porkbun.com/checkout/search?q=${domain.getName()}`,
            '_blank',
        );

        const learnMoreLink = await screen.findByRole('link', { name: /Learn more on Wikipedia/i });
        expect(learnMoreLink).toHaveAttribute('href', 'https://example.com');

        openSpy.mockRestore();
    });

    it('shows website link when domain is not available with A record', async () => {
        const domain = new Domain('example.com');
        domain.setStatus(DomainStatus.active);

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        result: {
                            domain: 'example.com',
                            records: { A: ['1.2.3.4'] },
                        },
                    }),
            }),
        ) as jest.Mock;

        render(<DomainDetailDrawer domain={domain} status={domain.getStatus()} open={true} onClose={() => {}} />);

        expect(screen.queryByRole('button', { name: /GoDaddy/i })).toBeNull();
        expect(screen.queryByRole('button', { name: /Namecheap/i })).toBeNull();
        expect(screen.queryByRole('button', { name: /Porkbun/i })).toBeNull();

        const websiteLink = await screen.findByRole('link', { name: /Visit website/i });
        expect(websiteLink).toHaveAttribute('href', 'https://example.com');
        expect(screen.queryByText(/DNS Records/)).toBeNull();

        (global.fetch as jest.Mock).mockRestore();
    });

    it('does not show website link when domain has no A record', async () => {
        const domain = new Domain('example.com');
        domain.setStatus(DomainStatus.active);

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        result: {
                            domain: 'example.com',
                            records: { CNAME: ['alias.example.com.'] },
                        },
                    }),
            }),
        ) as jest.Mock;

        render(<DomainDetailDrawer domain={domain} status={domain.getStatus()} open={true} onClose={() => {}} />);

        await waitFor(() => expect(global.fetch).toHaveBeenCalled());
        expect(screen.queryByRole('link', { name: /Visit website/i })).toBeNull();
        expect(screen.queryByText(/DNS Records/)).toBeNull();

        (global.fetch as jest.Mock).mockRestore();
    });
});
