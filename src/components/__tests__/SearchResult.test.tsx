import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';

import { SearchResult } from '@/components/SearchResult';
import { Domain, DomainStatus } from '@/models/domain';
import { apiClient } from '@/services/api';
import { RateLimiter } from '@/utils/rate-limiter';
import { Table, TableBody } from '@/components/ui/table';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useSearchParams: jest.fn(),
}));

// Mock API client
jest.mock('@/services/api', () => ({
    apiClient: {
        getDomainStatus: jest.fn(),
    },
}));

// Mock RateLimiter
jest.mock('@/utils/rate-limiter', () => ({
    RateLimiter: jest.fn().mockImplementation(() => ({
        add: jest.fn(),
    })),
}));

// Mock DomainDetailDrawer component
jest.mock('@/components/DomainDetailDrawer', () => {
    return function MockDomainDetailDrawer({ domain, status, open, onClose }: any) {
        if (!open) return null;
        return (
            <div data-testid="domain-detail-drawer" onClick={onClose}>
                Domain Detail Drawer for {domain.getName()}
            </div>
        );
    };
});

// Mock DomainStatusBadge component
jest.mock('@/components/DomainStatusBadge', () => {
    return function MockDomainStatusBadge({ domain, status }: any) {
        return <div data-testid="domain-status-badge">{status}</div>;
    };
});

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockRateLimiter = RateLimiter as jest.MockedClass<typeof RateLimiter>;

// Helper function to render SearchResult wrapped in a table
const renderSearchResult = (domain: Domain) => {
    return render(
        <Table>
            <TableBody>
                <SearchResult domain={domain} />
            </TableBody>
        </Table>
    );
};

describe('SearchResult', () => {
    const mockDomain = new Domain('example.com');
    const mockRateLimiterInstance = {
        add: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockRateLimiter.mockImplementation(() => mockRateLimiterInstance as any);
    });

    describe('Rendering', () => {
        it('should render domain name and status badge', () => {
            renderSearchResult(mockDomain);

            expect(screen.getByText('example.com')).toBeInTheDocument();
            expect(screen.getByTestId('domain-status-badge')).toBeInTheDocument();
        });

        it('should render table row with correct structure', () => {
            renderSearchResult(mockDomain);

            const tableRow = screen.getByRole('row');
            expect(tableRow).toBeInTheDocument();
            expect(tableRow).toHaveClass('cursor-pointer');
        });

        it('should not render domain detail drawer initially', () => {
            renderSearchResult(mockDomain);

            expect(screen.queryByTestId('domain-detail-drawer')).not.toBeInTheDocument();
        });
    });

    describe('Domain Status Fetching', () => {
        it('should fetch domain status on mount', async () => {
            mockRateLimiterInstance.add.mockResolvedValue(DomainStatus.ACTIVE);
            mockApiClient.getDomainStatus.mockResolvedValue(DomainStatus.ACTIVE);

            await act(async () => {
                renderSearchResult(mockDomain);
            });

            await waitFor(() => {
                expect(mockRateLimiterInstance.add).toHaveBeenCalledWith(
                    expect.any(Function)
                );
            });

            // Wait for the API call to be made
            await waitFor(() => {
                expect(mockApiClient.getDomainStatus).toHaveBeenCalledWith('example.com');
            });
        });

        it('should handle successful status fetch', async () => {
            mockRateLimiterInstance.add.mockResolvedValue(DomainStatus.ACTIVE);
            mockApiClient.getDomainStatus.mockResolvedValue(DomainStatus.ACTIVE);

            await act(async () => {
                renderSearchResult(mockDomain);
            });

            await waitFor(() => {
                expect(screen.getByTestId('domain-status-badge')).toHaveTextContent('ACTIVE');
            });

            expect(mockDomain.getStatus()).toBe(DomainStatus.ACTIVE);
        });

        it('should handle API error and set status to ERROR', async () => {
            mockRateLimiterInstance.add.mockRejectedValue(new Error('API Error'));
            mockApiClient.getDomainStatus.mockRejectedValue(new Error('API Error'));

            await act(async () => {
                renderSearchResult(mockDomain);
            });

            await waitFor(() => {
                expect(screen.getByTestId('domain-status-badge')).toHaveTextContent('ERROR');
            });

            expect(mockDomain.getStatus()).toBe(DomainStatus.ERROR);
        });

        it('should update domain status when status changes', async () => {
            // Mock successful API call
            mockRateLimiterInstance.add.mockResolvedValue(DomainStatus.ACTIVE);
            mockApiClient.getDomainStatus.mockResolvedValue(DomainStatus.ACTIVE);

            const { rerender } = await act(async () => {
                return renderSearchResult(mockDomain);
            });

            // Wait for initial status fetch to complete
            await waitFor(() => {
                expect(screen.getByTestId('domain-status-badge')).toHaveTextContent('ACTIVE');
            });

            // Create a new domain with different status
            const newDomain = new Domain('test.org');
            mockRateLimiterInstance.add.mockResolvedValue(DomainStatus.ERROR);
            mockApiClient.getDomainStatus.mockResolvedValue(DomainStatus.ERROR);

            await act(async () => {
                rerender(
                    <Table>
                        <TableBody>
                            <SearchResult domain={newDomain} />
                        </TableBody>
                    </Table>
                );
            });

            await waitFor(() => {
                expect(screen.getByTestId('domain-status-badge')).toHaveTextContent('ERROR');
            });
        });
    });

    describe('User Interactions', () => {
        it('should open domain detail drawer when row is clicked', () => {
            renderSearchResult(mockDomain);

            const tableRow = screen.getByRole('row');
            fireEvent.click(tableRow);

            expect(screen.getByTestId('domain-detail-drawer')).toBeInTheDocument();
            expect(screen.getByText('Domain Detail Drawer for example.com')).toBeInTheDocument();
        });

        it('should close domain detail drawer when onClose is called', () => {
            renderSearchResult(mockDomain);

            const tableRow = screen.getByRole('row');
            fireEvent.click(tableRow);

            // Verify drawer is open
            expect(screen.getByTestId('domain-detail-drawer')).toBeInTheDocument();

            // Close drawer
            const drawer = screen.getByTestId('domain-detail-drawer');
            fireEvent.click(drawer);

            // Verify drawer is closed
            expect(screen.queryByTestId('domain-detail-drawer')).not.toBeInTheDocument();
        });

        it('should open drawer on row click and close via onClose callback', () => {
            renderSearchResult(mockDomain);

            const tableRow = screen.getByRole('row');

            // First click - open drawer
            fireEvent.click(tableRow);
            expect(screen.getByTestId('domain-detail-drawer')).toBeInTheDocument();

            // Close drawer via onClose callback
            const drawer = screen.getByTestId('domain-detail-drawer');
            fireEvent.click(drawer);
            expect(screen.queryByTestId('domain-detail-drawer')).not.toBeInTheDocument();

            // Second click - open drawer again
            fireEvent.click(tableRow);
            expect(screen.getByTestId('domain-detail-drawer')).toBeInTheDocument();
        });
    });

    describe('Rate Limiting', () => {
        it('should use RateLimiter with correct configuration', () => {
            renderSearchResult(mockDomain);

            expect(mockRateLimiter).toHaveBeenCalledWith(2);
        });

        it('should call rate limiter add method with API call', async () => {
            mockRateLimiterInstance.add.mockResolvedValue(DomainStatus.ACTIVE);
            mockApiClient.getDomainStatus.mockResolvedValue(DomainStatus.ACTIVE);

            await act(async () => {
                renderSearchResult(mockDomain);
            });

            await waitFor(() => {
                expect(mockRateLimiterInstance.add).toHaveBeenCalledWith(
                    expect.any(Function)
                );
            });

            // Verify the function passed to rate limiter calls the API
            const rateLimiterFunction = mockRateLimiterInstance.add.mock.calls[0][0];
            await rateLimiterFunction();
            expect(mockApiClient.getDomainStatus).toHaveBeenCalledWith('example.com');
        });
    });

    describe('Domain Status Updates', () => {
        it('should update domain object status when API call succeeds', async () => {
            mockRateLimiterInstance.add.mockResolvedValue(DomainStatus.ACTIVE);
            mockApiClient.getDomainStatus.mockResolvedValue(DomainStatus.ACTIVE);

            await act(async () => {
                renderSearchResult(mockDomain);
            });

            await waitFor(() => {
                expect(mockDomain.getStatus()).toBe(DomainStatus.ACTIVE);
            });
        });

        it('should update domain object status to ERROR when API call fails', async () => {
            mockRateLimiterInstance.add.mockRejectedValue(new Error('API Error'));
            mockApiClient.getDomainStatus.mockRejectedValue(new Error('API Error'));

            await act(async () => {
                renderSearchResult(mockDomain);
            });

            await waitFor(() => {
                expect(mockDomain.getStatus()).toBe(DomainStatus.ERROR);
            });
        });
    });

    describe('Component Props', () => {
        it('should work with different domain names', () => {
            const testDomain = new Domain('test.org');
            renderSearchResult(testDomain);

            expect(screen.getByText('test.org')).toBeInTheDocument();
        });

        it('should pass correct props to DomainStatusBadge', () => {
            renderSearchResult(mockDomain);

            const statusBadge = screen.getByTestId('domain-status-badge');
            expect(statusBadge).toBeInTheDocument();
        });

        it('should pass correct props to DomainDetailDrawer when open', () => {
            renderSearchResult(mockDomain);

            const tableRow = screen.getByRole('row');
            fireEvent.click(tableRow);

            const drawer = screen.getByTestId('domain-detail-drawer');
            expect(drawer).toBeInTheDocument();
            expect(drawer).toHaveTextContent('Domain Detail Drawer for example.com');
        });
    });

    describe('Error Handling', () => {
        it('should handle rate limiter errors gracefully', async () => {
            mockRateLimiterInstance.add.mockRejectedValue(new Error('Rate limit exceeded'));

            await act(async () => {
                renderSearchResult(mockDomain);
            });

            await waitFor(() => {
                expect(screen.getByTestId('domain-status-badge')).toHaveTextContent('ERROR');
            });

            expect(mockDomain.getStatus()).toBe(DomainStatus.ERROR);
        });

        it('should handle network errors gracefully', async () => {
            mockRateLimiterInstance.add.mockRejectedValue(new Error('Network error'));
            mockApiClient.getDomainStatus.mockRejectedValue(new Error('Network error'));

            await act(async () => {
                renderSearchResult(mockDomain);
            });

            await waitFor(() => {
                expect(screen.getByTestId('domain-status-badge')).toHaveTextContent('ERROR');
            });
        });
    });
});