import { render, screen, waitFor } from '@testing-library/react';

import TLDCounter from '@/components/TLDCounter';
import { apiClient } from '@/services/api';

// Mock the NumberTicker component
jest.mock('@/components/ui/number-ticker', () => {
    return function MockNumberTicker({ value, className }: { value: number; className?: string }) {
        return (
            <span className={className} data-testid="number-ticker">
                {value}
            </span>
        );
    };
});

// Mock the API client
jest.mock('@/services/api', () => ({
    apiClient: {
        getTLDsCount: jest.fn(),
    },
}));

const mockGetTLDsCount = apiClient.getTLDsCount as jest.MockedFunction<typeof apiClient.getTLDsCount>;

describe('TLDCounter', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetTLDsCount.mockReset();
    });

    it('should render the main container with proper structure', async () => {
        mockGetTLDsCount.mockResolvedValue(1234);

        render(<TLDCounter />);

        // Check heading text
        const heading = screen.getByText('Powered by a collection of');
        expect(heading).toBeInTheDocument();

        // Wait for async state update to complete
        await waitFor(() => {
            expect(screen.getByTestId('number-ticker')).toBeInTheDocument();
        });
    });

    it('should display TLD count when API call succeeds', async () => {
        const mockCount = 1234;
        mockGetTLDsCount.mockResolvedValue(mockCount);

        render(<TLDCounter />);

        await waitFor(() => {
            expect(screen.getByTestId('number-ticker')).toBeInTheDocument();
        });

        // Check number ticker is rendered with correct value and label
        const numberTicker = screen.getByTestId('number-ticker');
        expect(numberTicker).toHaveTextContent(mockCount.toString());
        const tldsLabel = screen.getByText('TLDs');
        expect(tldsLabel).toBeInTheDocument();
    });

    it('should display error state when API call fails', async () => {
        mockGetTLDsCount.mockRejectedValue(new Error('API Error'));

        render(<TLDCounter />);

        await waitFor(() => {
            expect(screen.getByText('¯\\_(ツ)_/¯')).toBeInTheDocument();
        });

        // Check error message is rendered
        const errorEmoji = screen.getByText('¯\\_(ツ)_/¯');
        expect(errorEmoji).toBeInTheDocument();
        const errorText = screen.getByText('something went wrong counting our TLDs');
        expect(errorText).toBeInTheDocument();
    });
});
