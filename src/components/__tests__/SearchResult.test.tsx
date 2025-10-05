import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { SearchResult } from '@/components/SearchResult';
import { Domain, DomainStatus } from '@/models/domain';
import { apiClient } from '@/services/api';
import { rateLimiter } from '@/utils/rate-limiter';

// Mock the API client
jest.mock('@/services/api', () => ({
    apiClient: {
        getDomainStatus: jest.fn(),
    },
}));

// Mock the rate limiter
jest.mock('@/utils/rate-limiter', () => ({
    rateLimiter: {
        add: jest.fn(),
    },
}));

jest.mock('@/components/DomainDetailDrawer', () => {
    return function MockDomainDetailDrawer({
        domain,
        open,
        onClose,
    }: {
        domain: Domain;
        open: boolean;
        onClose: () => void;
    }) {
        return (
            <div data-testid="domain-detail-drawer" data-open={open} data-domain={domain.getName()}>
                <button data-testid="close-drawer" onClick={onClose}>
                    Close
                </button>
            </div>
        );
    };
});

const mockGetDomainStatus = apiClient.getDomainStatus as jest.MockedFunction<typeof apiClient.getDomainStatus>;
const mockRateLimiterAdd = rateLimiter.add as jest.MockedFunction<typeof rateLimiter.add>;

describe('SearchResult', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRateLimiterAdd.mockImplementation((task) => task());
    });

    it('should render with UNKNOWN status initially', () => {
        const exampleDomain = new Domain('example.com');
        render(<SearchResult domain={exampleDomain} />);

        // For UNKNOWN status, we should see a loading spinner
        const loadingSpinner = document.querySelector('.animate-spin');
        expect(loadingSpinner).toBeInTheDocument();
    });

    it('should update status when API call succeeds', async () => {
        mockGetDomainStatus.mockResolvedValue(DomainStatus.ACTIVE);

        const exampleDomain = new Domain('example.com');
        render(<SearchResult domain={exampleDomain} />);

        // ACTIVE status is displayed as "Taken" in the UI
        await waitFor(() => expect(screen.getByText('Taken')).toBeInTheDocument());

        expect(exampleDomain.getStatus()).toBe(DomainStatus.ACTIVE);
    });

    it('should handle API errors and set status to ERROR', async () => {
        mockGetDomainStatus.mockRejectedValue(new Error('API Error'));

        const exampleDomain = new Domain('example.com');
        render(<SearchResult domain={exampleDomain} />);

        // ERROR status is displayed as "Error" in the UI
        await waitFor(() => expect(screen.getByText('Error')).toBeInTheDocument());

        expect(exampleDomain.getStatus()).toBe(DomainStatus.ERROR);
    });

    it('should open and close drawer', async () => {
        mockGetDomainStatus.mockResolvedValue(DomainStatus.ACTIVE);

        const exampleDomain = new Domain('example.com');
        render(<SearchResult domain={exampleDomain} />);

        await waitFor(() => expect(screen.getByText('Taken')).toBeInTheDocument());

        // Open the drawer
        const tableRow = screen.getByText('example.com');
        fireEvent.click(tableRow);

        let drawer = screen.getByTestId('domain-detail-drawer');
        expect(drawer).toHaveAttribute('data-open', 'true');

        // Close the drawer
        const closeButton = screen.getByTestId('close-drawer');
        fireEvent.click(closeButton);

        drawer = screen.getByTestId('domain-detail-drawer');
        expect(drawer).toHaveAttribute('data-open', 'false');
    });
});
