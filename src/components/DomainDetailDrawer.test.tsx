import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DomainDetailDrawer from './DomainDetailDrawer';
import { Domain, DomainStatus } from '@/models/domain';
import { apiService } from '@/services/api';

jest.mock('@/components/ui/drawer', () => ({
    Drawer: ({ children }: any) => <div>{children}</div>,
    DrawerContent: ({ children, className }: any) => <div className={className}>{children}</div>,
    DrawerHeader: ({ children }: any) => <div>{children}</div>,
    DrawerTitle: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/services/api', () => ({
    apiService: {
        getDomainWhois: jest.fn(),
        getTldInfo: jest.fn(() => Promise.resolve({ description: 'Test' })),
    },
}));
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

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

    beforeEach(() => {
        mockedApiService.getDomainWhois.mockResolvedValue({
            creationDate: '2025-10-03',
            expirationDate: '2030-01-01',
            registrar: 'Example Registrar',
            registrarUrl: 'https://example-registrar.com',
        });
    });

    afterEach(() => {
        mockedApiService.getDomainWhois.mockReset();
    });

    it('shows registrar buttons but hides status and whois info when domain is available', async () => {
        const domain = new Domain('example.com');
        domain.setStatus(DomainStatus.inactive);

        render(<DomainDetailDrawer domain={domain} status={domain.getStatus()} open={true} onClose={() => {}} />);

        const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

        const porkbunButton = await screen.findByRole('button', { name: /Porkbun/i });
        const dynadotButton = screen.getByRole('button', { name: /Dynadot/i });
        const namecomButton = screen.getByRole('button', { name: /Name.com/i });

        fireEvent.click(porkbunButton);
        expect(openSpy).toHaveBeenNthCalledWith(
            1,
            `https://porkbun.com/checkout/search?q=${domain.getName()}`,
            '_blank',
        );

        fireEvent.click(dynadotButton);
        expect(openSpy).toHaveBeenNthCalledWith(
            2,
            `https://www.dynadot.com/domain/search.html?domain=${domain.getName()}`,
            '_blank',
        );

        fireEvent.click(namecomButton);
        expect(openSpy).toHaveBeenNthCalledWith(
            3,
            `https://www.name.com/domain/search/${domain.getName()}`,
            '_blank',
        );

        const learnMoreLink = await screen.findByRole('link', { name: /Learn more on Wikipedia/i });
        expect(learnMoreLink).toHaveAttribute('href', `https://en.wikipedia.org/wiki/.${domain.getTLD()}`);

        await waitFor(() => expect(mockedApiService.getDomainWhois).not.toHaveBeenCalled());

        expect(screen.queryByText(/This domain was created on/i)).not.toBeInTheDocument();

        expect(screen.queryByRole('heading', { name: /Status/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: /Whois info/i })).not.toBeInTheDocument();
        expect(await screen.findByRole('heading', { name: /TLD/i })).toBeInTheDocument();

        openSpy.mockRestore();
    });

    it('shows whois information when domain is not available', async () => {
        const domain = new Domain('example.com');
        domain.setStatus(DomainStatus.active);

        render(<DomainDetailDrawer domain={domain} status={domain.getStatus()} open={true} onClose={() => {}} />);

        const whoisParagraph = await screen.findByText(/This domain was created on/i);
        expect(whoisParagraph).toHaveTextContent(
            'This domain was created on October 3rd, 2025. It is registered with Example Registrar. It is set to expire on January 1st, 2030.',
        );
        const registrarLink = screen.getByRole('link', { name: 'Example Registrar' });
        expect(registrarLink).toHaveAttribute('href', 'https://example-registrar.com');
        expect(registrarLink).toHaveClass('font-bold');
        const creationSpan = screen.getByText('October 3rd, 2025');
        expect(creationSpan).toHaveClass('font-bold');
        const expirationSpan = screen.getByText('January 1st, 2030');
        expect(expirationSpan).toHaveClass('font-bold');

        expect(screen.getByRole('heading', { name: /Status/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /Whois info/i })).toBeInTheDocument();
        await waitFor(() => expect(mockedApiService.getDomainWhois).toHaveBeenCalledWith(domain.getName()));
    });
});
