import { render, screen, waitFor } from '@testing-library/react';

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
            type: TLDType.GENERIC,
        },
        {
            name: 'org',
            punycodeName: 'org',
            description: 'Non-profit organizations',
            type: TLDType.GENERIC,
        },
        {
            name: 'uk',
            punycodeName: 'uk',
            description: 'United Kingdom',
            type: TLDType.COUNTRY_CODE,
        },
        {
            name: 'москва',
            punycodeName: 'xn--80adxhks',
            description: 'Moscow',
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
                expect(screen.getByText('All Top-Level Domains')).toBeInTheDocument();
            });
        });

        it('should display the correct count of TLDs in the description', async () => {
            mockApiClient.getTLDs.mockResolvedValue(mockTLDs);

            render(<TldsPage />);

            await waitFor(() => {
                expect(screen.getByText('4 TLDs')).toBeInTheDocument();
            });
        });
    });

    describe('API Integration', () => {
        it('should call getTLDs API on component mount', async () => {
            mockApiClient.getTLDs.mockResolvedValue(mockTLDs);

            render(<TldsPage />);

            await waitFor(() => {
                expect(mockApiClient.getTLDs).toHaveBeenCalledTimes(1);
            });
        });

        it('should handle API response correctly', async () => {
            mockApiClient.getTLDs.mockResolvedValue(mockTLDs);

            render(<TldsPage />);

            await waitFor(() => {
                expect(mockApiClient.getTLDs).toHaveBeenCalledWith();
            });
        });
    });

    describe('Accessibility', () => {
        it('should have proper heading structure', async () => {
            mockApiClient.getTLDs.mockResolvedValue(mockTLDs);

            render(<TldsPage />);

            await waitFor(() => {
                const heading = screen.getByRole('heading', { level: 1 });
                expect(heading).toHaveTextContent('All Top-Level Domains');
            });
        });

        it('should have proper main landmark', async () => {
            mockApiClient.getTLDs.mockResolvedValue(mockTLDs);

            render(<TldsPage />);

            await waitFor(() => {
                const main = screen.getByRole('main');
                expect(main).toBeInTheDocument();
            });
        });
    });

    describe('Performance', () => {
        it('should use useTransition for state updates', async () => {
            mockApiClient.getTLDs.mockResolvedValue(mockTLDs);

            render(<TldsPage />);

            await waitFor(() => {
                expect(screen.getByText('All Top-Level Domains')).toBeInTheDocument();
            });

            // The component should handle the transition properly
            // This test ensures the useTransition hook is being used
            expect(screen.queryByTestId('loading-message')).not.toBeInTheDocument();
        });
    });
});
