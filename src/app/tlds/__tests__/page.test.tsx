import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { TLD, TLDType } from '@/models/tld';
// Import the mocked API client
import { apiClient } from '@/services/api';

import TldsPage from '../page';

// Mock the ErrorMessage and LoadingMessage components
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

// Mock the Highlighter component
jest.mock('@/components/ui/highlighter', () => ({
    Highlighter: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

// Mock the API client
jest.mock('@/services/api', () => ({
    apiClient: {
        getTLDs: jest.fn(),
    },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('TldsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockTLDs: TLD[] = [
        {
            name: 'com',
            punycodeName: 'com',
            description: 'Commercial organizations',
            organization: 'VeriSign',
            type: TLDType.GENERIC,
        },
        {
            name: 'org',
            punycodeName: 'org',
            description: 'Non-profit organizations',
            organization: 'Public Interest Registry',
            type: TLDType.GENERIC,
        },
        {
            name: 'uk',
            punycodeName: 'uk',
            description: 'United Kingdom',
            organization: 'Nominet',
            type: TLDType.COUNTRY_CODE,
        },
        {
            name: 'москва',
            punycodeName: 'xn--80adxhks',
            description: 'Moscow',
            organization: 'Coordination Center for TLD RU',
            type: TLDType.COUNTRY_CODE,
        },
    ];

    describe('Loading State', () => {
        it('should show loading message when TLDs are being fetched', async () => {
            // Mock a delayed API response
            mockApiClient.getTLDs.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        setTimeout(() => resolve([]), 100);
                    }),
            );

            render(<TldsPage />);

            expect(screen.getByTestId('loading-message')).toBeInTheDocument();
        });
    });

    describe('Error State', () => {
        it('should show error message when API call fails', async () => {
            mockApiClient.getTLDs.mockRejectedValue(new Error('API Error'));

            render(<TldsPage />);

            await waitFor(() => {
                expect(screen.getByTestId('error-message')).toBeInTheDocument();
            });
        });
    });

    describe('Success State', () => {
        it('should render TLDs page with correct title and badge', async () => {
            mockApiClient.getTLDs.mockResolvedValue(mockTLDs);

            render(<TldsPage />);

            await waitFor(() => {
                expect(screen.getByText('TLD DIRECTORY')).toBeInTheDocument();
                expect(screen.getByText('The ultimate TLDs list')).toBeInTheDocument();
            });
        });

        it('should display the correct count of TLDs in the description', async () => {
            mockApiClient.getTLDs.mockResolvedValue(mockTLDs);

            render(<TldsPage />);

            await waitFor(() => {
                expect(screen.getByText('4 TLDs')).toBeInTheDocument();
            });
        });

        it('should render filter buttons with all TLD types', async () => {
            mockApiClient.getTLDs.mockResolvedValue(mockTLDs);

            render(<TldsPage />);

            await waitFor(() => {
                // Check that the filter buttons are present
                expect(screen.getByRole('button', { name: /^Country Code\s*\(\d+\)$/i })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /^Generic\s*\(\d+\)$/i })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /^Generic Restricted\s*\(\d+\)$/i })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /^Infrastructure\s*\(\d+\)$/i })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /^Sponsored\s*\(\d+\)$/i })).toBeInTheDocument();
            });
        });

        it('should filter TLDs by type when filter button is clicked', async () => {
            mockApiClient.getTLDs.mockResolvedValue(mockTLDs);

            render(<TldsPage />);

            await waitFor(() => {
                // Initially all TLDs should be visible
                expect(screen.getByText('.com')).toBeInTheDocument();
                expect(screen.getByText('.org')).toBeInTheDocument();
                expect(screen.getByText('.uk')).toBeInTheDocument();
                expect(screen.getByText('.москва')).toBeInTheDocument();
            });

            // Click on the Country Code filter button
            const countryCodeButton = screen.getByRole('button', { name: /Country Code/i });
            fireEvent.click(countryCodeButton);

            await waitFor(() => {
                // Only country code TLDs should be visible
                expect(screen.getByText('.uk')).toBeInTheDocument();
                expect(screen.getByText('.москва')).toBeInTheDocument();
                // Generic TLDs should not be visible
                expect(screen.queryByText('.com')).not.toBeInTheDocument();
                expect(screen.queryByText('.org')).not.toBeInTheDocument();
                // Count should update
                expect(screen.getByText('2 TLDs')).toBeInTheDocument();
            });
        });

        it('should toggle filter when same button is clicked again', async () => {
            mockApiClient.getTLDs.mockResolvedValue(mockTLDs);

            render(<TldsPage />);

            await waitFor(() => {
                // Initially all TLDs should be visible
                expect(screen.getByText('4 TLDs')).toBeInTheDocument();
                expect(screen.getByText('.com')).toBeInTheDocument();
                expect(screen.getByText('.org')).toBeInTheDocument();
                expect(screen.getByText('.uk')).toBeInTheDocument();
                expect(screen.getByText('.москва')).toBeInTheDocument();
            });

            // First click on Country Code filter button
            const countryCodeButton = screen.getByRole('button', { name: /Country Code/i });
            fireEvent.click(countryCodeButton);

            await waitFor(() => {
                expect(screen.getByText('2 TLDs')).toBeInTheDocument();
                expect(screen.getByText('.uk')).toBeInTheDocument();
                expect(screen.getByText('.москва')).toBeInTheDocument();
                expect(screen.queryByText('.com')).not.toBeInTheDocument();
                expect(screen.queryByText('.org')).not.toBeInTheDocument();
            });

            // Click the same button again to clear the filter
            fireEvent.click(countryCodeButton);

            await waitFor(() => {
                // All TLDs should be visible again
                expect(screen.getByText('4 TLDs')).toBeInTheDocument();
                expect(screen.getByText('.com')).toBeInTheDocument();
                expect(screen.getByText('.org')).toBeInTheDocument();
                expect(screen.getByText('.uk')).toBeInTheDocument();
                expect(screen.getByText('.москва')).toBeInTheDocument();
            });
        });

        it('should rank search results by fuzzy score', async () => {
            const searchTlds: TLD[] = [
                { name: 'com', punycodeName: 'com', type: TLDType.GENERIC },
                { name: 'comm', punycodeName: 'comm', type: TLDType.GENERIC },
                { name: 'company', punycodeName: 'company', type: TLDType.GENERIC },
                { name: 'cmo', punycodeName: 'cmo', type: TLDType.GENERIC },
                { name: 'org', punycodeName: 'org', type: TLDType.GENERIC },
            ];

            mockApiClient.getTLDs.mockResolvedValue(searchTlds);

            render(<TldsPage />);

            await waitFor(() => {
                expect(screen.getByText('.com')).toBeInTheDocument();
            });

            const input = screen.getByPlaceholderText('Search TLDs by name ...');
            fireEvent.change(input, { target: { value: 'com' } });

            await waitFor(() => {
                const results = screen.getAllByRole('heading', { level: 3 });
                const texts = results.map((el) => el.textContent);

                // Exact match should be first, followed by close substring matches.
                expect(texts[0]).toBe('.com');
                expect(texts[1]).toBe('.comm');
                expect(texts[2]).toBe('.company');
            });
        });
    });
});
