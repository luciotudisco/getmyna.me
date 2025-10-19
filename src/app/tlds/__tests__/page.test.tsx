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
                expect(screen.getByText('The ultimate TLD list')).toBeInTheDocument();
            });
        });

        it('should display the correct count of TLDs in the description', async () => {
            mockApiClient.getTLDs.mockResolvedValue(mockTLDs);

            render(<TldsPage />);

            await waitFor(() => {
                expect(screen.getByText('4 TLDs')).toBeInTheDocument();
            });
        });

        it('should render filter buttons for all TLD types', async () => {
            mockApiClient.getTLDs.mockResolvedValue(mockTLDs);

            render(<TldsPage />);

            await waitFor(() => {
                expect(screen.getByText('Generic')).toBeInTheDocument();
                expect(screen.getByText('Country Code')).toBeInTheDocument();
                expect(screen.getByText('Infrastructure')).toBeInTheDocument();
                expect(screen.getByText('Sponsored')).toBeInTheDocument();
                expect(screen.getByText('Generic Restricted')).toBeInTheDocument();
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

            // Click on Country Code filter
            const countryCodeButton = screen.getByText('Country Code');
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

        it('should deselect filter when same type is clicked again', async () => {
            mockApiClient.getTLDs.mockResolvedValue(mockTLDs);

            render(<TldsPage />);

            await waitFor(() => {
                // Click on Country Code filter
                const countryCodeButton = screen.getByText('Country Code');
                fireEvent.click(countryCodeButton);
            });

            await waitFor(() => {
                // Only country code TLDs should be visible
                expect(screen.getByText('2 TLDs')).toBeInTheDocument();
            });

            // Click the same filter again to deselect
            const countryCodeButton = screen.getByText('Country Code');
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
    });
});
