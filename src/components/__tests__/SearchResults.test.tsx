import { render, screen, waitFor, act } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';

import { SearchResults } from '@/components/SearchResults';
import { Domain } from '@/models/domain';
import { apiClient } from '@/services/api';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useSearchParams: jest.fn(),
}));

// Mock API client
jest.mock('@/services/api', () => ({
    apiClient: {
        searchDomains: jest.fn(),
    },
}));

// Mock child components
jest.mock('@/components/ErrorMessage', () => {
    return function MockErrorMessage() {
        return <div data-testid="error-message">Error occurred</div>;
    };
});

jest.mock('@/components/LoadingMessage', () => {
    return function MockLoadingMessage() {
        return <div data-testid="loading-message">Loading...</div>;
    };
});

jest.mock('@/components/NoResultsMessage', () => {
    return function MockNoResultsMessage() {
        return <div data-testid="no-results-message">No results found</div>;
    };
});

jest.mock('@/components/SearchResult', () => ({
    SearchResult: function MockSearchResult({ domain }: { domain: Domain }) {
        return <div data-testid="search-result">{domain.getName()}</div>;
    },
}));

jest.mock('@/components/ui/number-ticker', () => {
    return function MockNumberTicker({ value }: { value: number }) {
        return <span data-testid="number-ticker">{value}</span>;
    };
});

const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('SearchResults', () => {
    const mockSearchParams = new URLSearchParams();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseSearchParams.mockReturnValue(mockSearchParams as any);
    });

    describe('Loading State', () => {
        it('should show loading message when isPending is true', () => {
            // Mock a pending state by not resolving the API call immediately
            mockApiClient.searchDomains.mockImplementation(
                () => new Promise(() => {}) // Never resolves
            );

            render(<SearchResults />);

            expect(screen.getByTestId('loading-message')).toBeInTheDocument();
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });
    });

    describe('Error State', () => {
        it('should show error message when API call fails', async () => {
            mockApiClient.searchDomains.mockRejectedValue(new Error('API Error'));

            await act(async () => {
                render(<SearchResults />);
            });

            await waitFor(() => {
                expect(screen.getByTestId('error-message')).toBeInTheDocument();
                expect(screen.getByText('Error occurred')).toBeInTheDocument();
            });
        });

        it('should clear domains array when error occurs', async () => {
            mockApiClient.searchDomains.mockRejectedValue(new Error('API Error'));

            await act(async () => {
                render(<SearchResults />);
            });

            await waitFor(() => {
                expect(screen.queryByTestId('search-result')).not.toBeInTheDocument();
            });
        });
    });

    describe('No Results State', () => {
        it('should show no results message when domains array is empty', async () => {
            mockApiClient.searchDomains.mockResolvedValue([]);

            await act(async () => {
                render(<SearchResults />);
            });

            await waitFor(() => {
                expect(screen.getByTestId('no-results-message')).toBeInTheDocument();
                expect(screen.getByText('No results found')).toBeInTheDocument();
            });
        });
    });

    describe('Success State', () => {
        it('should render search results when domains are found', async () => {
            const mockDomains = ['example.com', 'test.org', 'sample.net'];
            mockApiClient.searchDomains.mockResolvedValue(mockDomains);

            await act(async () => {
                render(<SearchResults />);
            });

            await waitFor(() => {
                expect(screen.getByTestId('number-ticker')).toHaveTextContent('3');
                expect(screen.getByText('results found')).toBeInTheDocument();
            });

            // Check that SearchResult components are rendered
            expect(screen.getByText('example.com')).toBeInTheDocument();
            expect(screen.getByText('test.org')).toBeInTheDocument();
            expect(screen.getByText('sample.net')).toBeInTheDocument();
        });

        it('should render table with correct structure', async () => {
            const mockDomains = ['example.com'];
            mockApiClient.searchDomains.mockResolvedValue(mockDomains);

            await act(async () => {
                render(<SearchResults />);
            });

            await waitFor(() => {
                expect(screen.getByRole('table')).toBeInTheDocument();
                expect(screen.getByText('Domain')).toBeInTheDocument();
                expect(screen.getByText('Status')).toBeInTheDocument();
            });
        });

        it('should display correct number of results', async () => {
            const mockDomains = ['example.com', 'test.org'];
            mockApiClient.searchDomains.mockResolvedValue(mockDomains);

            await act(async () => {
                render(<SearchResults />);
            });

            await waitFor(() => {
                expect(screen.getByTestId('number-ticker')).toHaveTextContent('2');
                expect(screen.getByText('results found')).toBeInTheDocument();
            });
        });
    });

    describe('Search Parameters', () => {
        it('should call API with search term from URL params', async () => {
            mockSearchParams.set('term', 'example');
            mockApiClient.searchDomains.mockResolvedValue([]);

            await act(async () => {
                render(<SearchResults />);
            });

            await waitFor(() => {
                expect(mockApiClient.searchDomains).toHaveBeenCalledWith('example', false);
            });
        });

        it('should call API with include_subdomains parameter', async () => {
            mockSearchParams.set('term', 'example');
            mockSearchParams.set('include_subdomains', 'true');
            mockApiClient.searchDomains.mockResolvedValue([]);

            await act(async () => {
                render(<SearchResults />);
            });

            await waitFor(() => {
                expect(mockApiClient.searchDomains).toHaveBeenCalledWith('example', true);
            });
        });

        it('should handle missing search term', async () => {
            mockApiClient.searchDomains.mockResolvedValue([]);

            await act(async () => {
                render(<SearchResults />);
            });

            await waitFor(() => {
                expect(mockApiClient.searchDomains).toHaveBeenCalledWith('', false);
            });
        });

        it('should handle missing include_subdomains parameter', async () => {
            mockSearchParams.set('term', 'example');
            mockApiClient.searchDomains.mockResolvedValue([]);

            await act(async () => {
                render(<SearchResults />);
            });

            await waitFor(() => {
                expect(mockApiClient.searchDomains).toHaveBeenCalledWith('example', false);
            });
        });
    });

    describe('Domain Creation', () => {
        it('should create Domain objects from API response', async () => {
            const mockDomains = ['example.com', 'test.org'];
            mockApiClient.searchDomains.mockResolvedValue(mockDomains);

            await act(async () => {
                render(<SearchResults />);
            });

            await waitFor(() => {
                // Verify that Domain objects are created and passed to SearchResult
                expect(screen.getByText('example.com')).toBeInTheDocument();
                expect(screen.getByText('test.org')).toBeInTheDocument();
            });
        });

        it('should handle empty domain names gracefully', async () => {
            const mockDomains = ['', 'example.com'];
            mockApiClient.searchDomains.mockResolvedValue(mockDomains);

            // This should not throw an error, but might filter out invalid domains
            await act(async () => {
                render(<SearchResults />);
            });

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            });
        });
    });

    describe('Component Re-rendering', () => {
        it('should re-fetch data when search params change', async () => {
            mockApiClient.searchDomains.mockResolvedValue(['example.com']);
            
            const { rerender } = await act(async () => {
                return render(<SearchResults />);
            });

            // First render
            await waitFor(() => {
                expect(mockApiClient.searchDomains).toHaveBeenCalledTimes(1);
            });

            // Change search params
            mockSearchParams.set('term', 'test');
            mockApiClient.searchDomains.mockResolvedValue(['test.org']);

            await act(async () => {
                rerender(<SearchResults />);
            });

            await waitFor(() => {
                expect(mockApiClient.searchDomains).toHaveBeenCalledTimes(2);
                expect(mockApiClient.searchDomains).toHaveBeenLastCalledWith('test', false);
            });
        });

        it('should clear error state on successful re-render', async () => {
            // First render with error
            mockApiClient.searchDomains.mockRejectedValue(new Error('API Error'));
            const { rerender } = await act(async () => {
                return render(<SearchResults />);
            });

            await waitFor(() => {
                expect(screen.getByTestId('error-message')).toBeInTheDocument();
            });

            // Second render with success
            mockApiClient.searchDomains.mockResolvedValue(['example.com']);
            await act(async () => {
                rerender(<SearchResults />);
            });

            await waitFor(() => {
                expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
                expect(screen.getByText('example.com')).toBeInTheDocument();
            });
        });
    });

    describe('Layout and Styling', () => {
        it('should render main container with correct classes', async () => {
            const mockDomains = ['example.com'];
            mockApiClient.searchDomains.mockResolvedValue(mockDomains);

            await act(async () => {
                render(<SearchResults />);
            });

            await waitFor(() => {
                const main = screen.getByRole('main');
                expect(main).toBeInTheDocument();
                expect(main).toHaveClass('m-auto', 'flex', 'flex-col', 'items-center');
            });
        });

        it('should render results counter with correct styling', async () => {
            const mockDomains = ['example.com', 'test.org'];
            mockApiClient.searchDomains.mockResolvedValue(mockDomains);

            await act(async () => {
                render(<SearchResults />);
            });

            await waitFor(() => {
                const counter = screen.getByText('results found');
                expect(counter).toBeInTheDocument();
                expect(counter).toHaveClass('font-mono', 'text-xs');
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle very large number of results', async () => {
            const largeDomainList = Array.from({ length: 1000 }, (_, i) => `domain${i}.com`);
            mockApiClient.searchDomains.mockResolvedValue(largeDomainList);

            await act(async () => {
                render(<SearchResults />);
            });

            await waitFor(() => {
                expect(screen.getByTestId('number-ticker')).toHaveTextContent('1000');
            });
        });

        it('should handle special characters in domain names', async () => {
            const mockDomains = ['example.com', 'test-site.org', 'sub.domain.co.uk'];
            mockApiClient.searchDomains.mockResolvedValue(mockDomains);

            await act(async () => {
                render(<SearchResults />);
            });

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
                expect(screen.getByText('test-site.org')).toBeInTheDocument();
                expect(screen.getByText('sub.domain.co.uk')).toBeInTheDocument();
            });
        });

        it('should handle API returning null or undefined', async () => {
            mockApiClient.searchDomains.mockResolvedValue(null as any);

            await act(async () => {
                render(<SearchResults />);
            });

            await waitFor(() => {
                expect(screen.getByTestId('no-results-message')).toBeInTheDocument();
            });
        });
    });

    describe('Performance', () => {
        it('should use useTransition for non-blocking updates', async () => {
            mockApiClient.searchDomains.mockResolvedValue(['example.com']);

            await act(async () => {
                render(<SearchResults />);
            });

            // The component should render without blocking the main thread
            expect(screen.getByTestId('loading-message')).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            });
        });
    });
});