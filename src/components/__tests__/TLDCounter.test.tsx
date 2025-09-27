import { render, screen } from '@testing-library/react';

import TLDCounter from '@/components/TLDCounter';
import { apiClient } from '@/services/api';

// Mock the API client
jest.mock('@/services/api');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Mock the NumberTicker component since it's not critical for these tests
jest.mock('@/components/ui/number-ticker', () => {
    return function MockNumberTicker({ value, className }: { value: number; className: string }) {
        return <span className={className}>{value}</span>;
    };
});

describe('TLDCounter', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('loading state', () => {
        it('should show loading animation initially', () => {
            // Mock a pending promise to keep the loading state
            mockApiClient.getTLDsCount.mockImplementation(() => new Promise(() => {}));

            render(<TLDCounter />);

            expect(screen.getByText('....')).toBeInTheDocument();
            expect(screen.getByText('Powered by a collection of')).toBeInTheDocument();
        });
    });

    describe('API client integration', () => {
        it('should call getTLDsCount on mount', () => {
            mockApiClient.getTLDsCount.mockImplementation(() => new Promise(() => {}));

            render(<TLDCounter />);

            expect(mockApiClient.getTLDsCount).toHaveBeenCalledTimes(1);
        });

        it('should render loading state with correct classes', () => {
            mockApiClient.getTLDsCount.mockImplementation(() => new Promise(() => {}));

            render(<TLDCounter />);

            const loadingElement = screen.getByText('....');
            expect(loadingElement).toHaveClass('animate-pulse', 'text-2xl', 'font-semibold');
        });
    });

    describe('component structure', () => {
        it('should render with correct container classes', () => {
            mockApiClient.getTLDsCount.mockImplementation(() => new Promise(() => {}));

            render(<TLDCounter />);

            const container = screen.getByText('Powered by a collection of').closest('div');
            expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'gap-1', 'pb-8');
        });

        it('should render heading with correct text', () => {
            mockApiClient.getTLDsCount.mockImplementation(() => new Promise(() => {}));

            render(<TLDCounter />);

            expect(screen.getByText('Powered by a collection of')).toBeInTheDocument();
            const heading = screen.getByRole('heading', { level: 2 });
            expect(heading).toHaveTextContent('Powered by a collection of');
        });
    });

    describe('error handling', () => {
        it('should handle API errors gracefully', async () => {
            mockApiClient.getTLDsCount.mockRejectedValue(new Error('Network error'));

            render(<TLDCounter />);

            // Wait for the component to handle the error
            await new Promise(resolve => setTimeout(resolve, 100));

            // The component should still render without crashing
            expect(screen.getByText('Powered by a collection of')).toBeInTheDocument();
        });
    });

    describe('success state', () => {
        it('should handle successful API responses', async () => {
            const mockCount = 1500;
            mockApiClient.getTLDsCount.mockResolvedValue(mockCount);

            render(<TLDCounter />);

            // Wait for the component to handle the success
            await new Promise(resolve => setTimeout(resolve, 100));

            // The component should still render without crashing
            expect(screen.getByText('Powered by a collection of')).toBeInTheDocument();
        });
    });
});