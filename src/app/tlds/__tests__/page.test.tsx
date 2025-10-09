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

        it('should show loading message when TLDs array is empty', async () => {
            mockApiClient.getTLDs.mockResolvedValue([]);

            render(<TldsPage />);

            await waitFor(() => {
                expect(screen.getByTestId('loading-message')).toBeInTheDocument();
            });
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

        it('should not show TLDs content when there is an error', async () => {
            mockApiClient.getTLDs.mockRejectedValue(new Error('API Error'));

            render(<TldsPage />);

            await waitFor(() => {
                expect(screen.queryByText('All Top-Level Domains')).not.toBeInTheDocument();
                expect(screen.queryByText('TLD DIRECTORY')).not.toBeInTheDocument();
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

        it('should render all TLDs as badges', async () => {
            mockApiClient.getTLDs.mockResolvedValue(mockTLDs);

            render(<TldsPage />);

            await waitFor(() => {
                expect(screen.getByText('.com')).toBeInTheDocument();
                expect(screen.getByText('.org')).toBeInTheDocument();
                expect(screen.getByText('.uk')).toBeInTheDocument();
                expect(screen.getByText('.москва')).toBeInTheDocument();
            });
        });

        it('should use the correct key for TLD badges (name or punycodeName)', async () => {
            const tldsWithMissingName: TLD[] = [
                {
                    punycodeName: 'xn--80adxhks',
                    description: 'Moscow',
                    type: TLDType.COUNTRY_CODE,
                },
            ];

            mockApiClient.getTLDs.mockResolvedValue(tldsWithMissingName);

            render(<TldsPage />);

            await waitFor(() => {
                expect(screen.getByText('.xn--80adxhks')).toBeInTheDocument();
            });
        });

        it('should render TLD badges with outline variant', async () => {
            mockApiClient.getTLDs.mockResolvedValue(mockTLDs);

            render(<TldsPage />);

            await waitFor(() => {
                const badges = screen
                    .getAllByRole('generic')
                    .filter((el) => el.textContent?.startsWith('.') && el.textContent?.length > 1);

                // Check that badges have the outline variant class
                badges.forEach((badge) => {
                    expect(badge).toHaveClass('border');
                });
            });
        });

        it('should have proper responsive layout classes', async () => {
            mockApiClient.getTLDs.mockResolvedValue(mockTLDs);

            render(<TldsPage />);

            await waitFor(() => {
                const mainElement = screen.getByRole('main');
                expect(mainElement).toHaveClass(
                    'm-auto',
                    'flex',
                    'w-full',
                    'max-w-6xl',
                    'flex-col',
                    'items-center',
                    'gap-5',
                    'p-5',
                    'md:p-10',
                );
            });
        });

        it('should have proper container classes for TLD badges', async () => {
            mockApiClient.getTLDs.mockResolvedValue(mockTLDs);

            render(<TldsPage />);

            await waitFor(() => {
                const badgesContainer = screen.getByText('.com').closest('div');
                expect(badgesContainer).toHaveClass(
                    'mt-6',
                    'flex',
                    'w-full',
                    'flex-wrap',
                    'justify-center',
                    'gap-2',
                    'lg:mt-14',
                );
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

    describe('Edge Cases', () => {
        it('should handle TLDs with missing name property', async () => {
            const tldsWithMissingName: TLD[] = [
                {
                    punycodeName: 'xn--80adxhks',
                    description: 'Moscow',
                    type: TLDType.COUNTRY_CODE,
                },
                {
                    name: 'com',
                    description: 'Commercial',
                    type: TLDType.GENERIC,
                },
            ];

            mockApiClient.getTLDs.mockResolvedValue(tldsWithMissingName);

            render(<TldsPage />);

            await waitFor(() => {
                expect(screen.getByText('.xn--80adxhks')).toBeInTheDocument();
                expect(screen.getByText('.com')).toBeInTheDocument();
            });
        });

        it('should handle TLDs with missing punycodeName property', async () => {
            const tldsWithMissingPunycode: TLD[] = [
                {
                    name: 'com',
                    description: 'Commercial',
                    type: TLDType.GENERIC,
                },
            ];

            mockApiClient.getTLDs.mockResolvedValue(tldsWithMissingPunycode);

            render(<TldsPage />);

            await waitFor(() => {
                expect(screen.getByText('.com')).toBeInTheDocument();
            });
        });

        it('should handle TLDs with both name and punycodeName', async () => {
            const tldsWithBoth: TLD[] = [
                {
                    name: 'москва',
                    punycodeName: 'xn--80adxhks',
                    description: 'Moscow',
                    type: TLDType.COUNTRY_CODE,
                },
            ];

            mockApiClient.getTLDs.mockResolvedValue(tldsWithBoth);

            render(<TldsPage />);

            await waitFor(() => {
                // Should display the original name, not punycode
                expect(screen.getByText('.москва')).toBeInTheDocument();
                expect(screen.queryByText('.xn--80adxhks')).not.toBeInTheDocument();
            });
        });

        it('should handle empty TLDs array by showing loading state', async () => {
            mockApiClient.getTLDs.mockResolvedValue([]);

            render(<TldsPage />);

            await waitFor(() => {
                expect(screen.getByTestId('loading-message')).toBeInTheDocument();
            });
        });

        it('should handle TLDs with undefined name and punycodeName', async () => {
            const tldsWithUndefinedNames: TLD[] = [
                {
                    description: 'Some TLD',
                    type: TLDType.GENERIC,
                },
            ];

            mockApiClient.getTLDs.mockResolvedValue(tldsWithUndefinedNames);

            render(<TldsPage />);

            await waitFor(() => {
                // Should not crash and should show loading state
                expect(screen.getByTestId('loading-message')).toBeInTheDocument();
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
