import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DomainDetailDrawer from './DomainDetailDrawer';
import { Domain, DomainStatus } from '@/models/domain';
import { apiService } from '@/services/api';
import { DNSRecordType } from '@/models/dig';

jest.mock('@/components/ui/drawer', () => ({
    Drawer: ({ children }: any) => <div>{children}</div>,
    DrawerContent: ({ children, className }: any) => <div className={className}>{children}</div>,
    DrawerHeader: ({ children }: any) => <div>{children}</div>,
    DrawerTitle: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/services/api', () => ({
    apiService: {
        digDomain: jest.fn(),
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
        expect(learnMoreLink).toHaveAttribute('href', `https://en.wikipedia.org/wiki/.${domain.getTLD()}`);

        openSpy.mockRestore();
    });

    it('shows website link when domain is not available with A record', async () => {
        const domain = new Domain('example.com');
        domain.setStatus(DomainStatus.active);

        mockedApiService.digDomain.mockResolvedValue({
            records: { [DNSRecordType.A]: ['1.2.3.4'] },
        });
        mockedApiService.getDomainWhois.mockResolvedValue({
            creationDate: '2025-10-03',
            expirationDate: '2030-01-01',
            registrar: 'Example Registrar',
            registrarUrl: 'https://example-registrar.com',
        });

        render(<DomainDetailDrawer domain={domain} status={domain.getStatus()} open={true} onClose={() => {}} />);

        expect(screen.queryByRole('button', { name: /GoDaddy/i })).toBeNull();
        expect(screen.queryByRole('button', { name: /Namecheap/i })).toBeNull();
        expect(screen.queryByRole('button', { name: /Porkbun/i })).toBeNull();

        const websiteLink = await screen.findByRole('link', { name: /Visit website/i });
        expect(websiteLink).toHaveAttribute('href', 'https://example.com');
        expect(screen.queryByText(/DNS Records/)).toBeNull();

        expect(mockedApiService.digDomain).toHaveBeenCalledWith(domain.getName(), DNSRecordType.A);

        mockedApiService.digDomain.mockReset();
        mockedApiService.getDomainWhois.mockReset();
    });

    it('does not show website link when domain has no A record', async () => {
        const domain = new Domain('example.com');
        domain.setStatus(DomainStatus.active);

        mockedApiService.digDomain.mockResolvedValue({
            records: { [DNSRecordType.CNAME]: ['alias.example.com.'] },
        });
        mockedApiService.getDomainWhois.mockResolvedValue({
            creationDate: '2025-10-03',
            expirationDate: '2030-01-01',
            registrar: 'Example Registrar',
            registrarUrl: 'https://example-registrar.com',
        });

        render(<DomainDetailDrawer domain={domain} status={domain.getStatus()} open={true} onClose={() => {}} />);

        await waitFor(() => expect(mockedApiService.digDomain).toHaveBeenCalledWith(domain.getName(), DNSRecordType.A));
        expect(screen.queryByRole('link', { name: /Visit website/i })).toBeNull();
        expect(screen.queryByText(/DNS Records/)).toBeNull();

        mockedApiService.digDomain.mockReset();
        mockedApiService.getDomainWhois.mockReset();
    });

    it('shows whois information when domain is not available', async () => {
        const domain = new Domain('example.com');
        domain.setStatus(DomainStatus.active);

        mockedApiService.digDomain.mockResolvedValue({
            records: { [DNSRecordType.A]: ['1.2.3.4'] },
        });
        mockedApiService.getDomainWhois.mockResolvedValue({
            creationDate: '2025-10-03',
            expirationDate: '2030-01-01',
            registrar: 'Example Registrar',
            registrarUrl: 'https://example-registrar.com',
        });

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

        expect(mockedApiService.digDomain).toHaveBeenCalledWith(domain.getName(), DNSRecordType.A);

        mockedApiService.digDomain.mockReset();
        mockedApiService.getDomainWhois.mockReset();
    });
});
