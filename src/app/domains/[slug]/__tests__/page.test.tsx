import { render, screen, waitFor } from '@testing-library/react';
import type { ComponentType } from 'react';

import { DomainStatus } from '@/models/domain';
import { apiClient } from '@/services/api';

// React 19 + `useTransition(async () => ...)` can be flaky in Jest/jsdom.
// We provide a deterministic `useTransition` implementation that:
// - toggles `isPending` true while the transition promise is pending
// - toggles back to false when it settles
jest.mock('react', () => {
    const actual = jest.requireActual<typeof import('react')>('react');
    return {
        ...actual,
        useTransition: () => {
            const [isPending, setIsPending] = actual.useState(false);
            const startTransition = (cb: () => unknown) => {
                setIsPending(true);
                Promise.resolve()
                    .then(() => cb())
                    .finally(() => setIsPending(false));
            };
            return [isPending, startTransition] as const;
        },
    };
});

const DomainPage = require('../page').default as ComponentType<{ params: Promise<{ slug: string }> }>;

jest.mock('@/components/ErrorMessage', () => {
    return function MockErrorMessage() {
        return <div data-testid="error-message">Something went wrong. Please try again later.</div>;
    };
});

jest.mock('@/components/LoadingMessage', () => {
    return function MockLoadingMessage() {
        return <div data-testid="loading-message">Loading...</div>;
    };
});

jest.mock('@/components/DomainStatusBadge', () => {
    return function MockDomainStatusBadge({ status }: { status: string }) {
        return <div data-testid="domain-status-badge">{status}</div>;
    };
});

jest.mock('@/components/DomainRegistrarButtons', () => {
    return function MockDomainRegistrarButtons({ domainName }: { domainName: string }) {
        return <div data-testid="domain-registrar-buttons">{domainName}</div>;
    };
});

jest.mock('@/components/DomainStatusSection', () => ({
    DomainStatusSection: ({ status }: { status: string }) => <div data-testid="domain-status-section">{status}</div>,
}));

jest.mock('@/components/DomainWhoisSection', () => ({
    DomainWhoisSection: ({ whoisInfo }: { whoisInfo: { creationDate?: string } }) => (
        <div data-testid="domain-whois-section">{whoisInfo?.creationDate ?? ''}</div>
    ),
}));

jest.mock('@/components/TLDSection', () => {
    return function MockTLDSection({ name }: { name?: string }) {
        return <div data-testid="tld-section">{name}</div>;
    };
});

jest.mock('@/services/api', () => ({
    apiClient: {
        getDomainStatus: jest.fn(),
        getWhoisInfo: jest.fn(),
        getDomainTLD: jest.fn(),
    },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('DomainPage (slug page)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * `DomainPage` uses React 19's `use(params)` where `params` is a thenable.
     * In tests, we provide a "fulfilled thenable" so React won't suspend.
     */
    const makeParams = (slug: string) => {
        const value = { slug };
        const thenable: any = {
            status: 'fulfilled',
            value,
            then: (resolve: (v: typeof value) => void) => resolve(value),
        };
        return thenable as Promise<{ slug: string }>;
    };

    it('shows loading state while the domain is being fetched', async () => {
        mockApiClient.getDomainStatus.mockImplementation(() => new Promise(() => {}));

        render(<DomainPage params={makeParams('instagr.am')} />);

        expect(await screen.findByTestId('loading-message')).toBeInTheDocument();
    });

    it('shows error message when the API call fails', async () => {
        mockApiClient.getDomainStatus.mockRejectedValue(new Error('API error'));

        render(<DomainPage params={makeParams('instagr.am')} />);

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
        });
    });

    it(
        'renders available domain details and registrar buttons (decoded slug)',
        async () => {
        const decodedDomain = 'bücher.de';
        const encodedSlug = encodeURIComponent(decodedDomain);

        mockApiClient.getDomainStatus.mockResolvedValue(DomainStatus.INACTIVE);
        mockApiClient.getDomainTLD.mockResolvedValue({ name: 'de' });

        render(<DomainPage params={makeParams(encodedSlug)} />);

        await waitFor(() => expect(mockApiClient.getDomainStatus).toHaveBeenCalled(), { timeout: 2000 });
        await waitFor(() => expect(mockApiClient.getDomainTLD).toHaveBeenCalled(), { timeout: 2000 });
        await waitFor(() => expect(screen.queryByTestId('loading-message')).not.toBeInTheDocument(), {
            timeout: 2000,
        });

        expect(screen.getByRole('heading', { level: 1, name: decodedDomain })).toBeInTheDocument();

        expect(screen.getByTestId('domain-status-badge')).toBeInTheDocument();
        expect(screen.getByTestId('domain-registrar-buttons')).toHaveTextContent(decodedDomain);
        expect(screen.getByTestId('tld-section')).toHaveTextContent('de');

        expect(screen.queryByTestId('domain-status-section')).not.toBeInTheDocument();
        expect(screen.queryByTestId('domain-whois-section')).not.toBeInTheDocument();
        },
        10000,
    );

    it('renders taken domain details (status + whois), without registrar buttons', async () => {
        mockApiClient.getDomainStatus.mockResolvedValue(DomainStatus.ACTIVE);
        mockApiClient.getDomainTLD.mockResolvedValue({ name: 'am' });
        mockApiClient.getWhoisInfo.mockResolvedValue({ creationDate: '2010-01-01' });

        render(<DomainPage params={makeParams('instagr.am')} />);

        expect(await screen.findByText('instagr.am', {}, { timeout: 5000 })).toBeInTheDocument();

        expect(screen.getByTestId('domain-status-section')).toHaveTextContent(DomainStatus.ACTIVE);
        expect(screen.getByTestId('domain-whois-section')).toHaveTextContent('2010-01-01');
        expect(screen.getByTestId('tld-section')).toHaveTextContent('am');

        expect(screen.queryByTestId('domain-registrar-buttons')).not.toBeInTheDocument();
    });
});

