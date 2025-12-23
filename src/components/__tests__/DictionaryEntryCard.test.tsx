import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import DictionaryEntryCard from '@/components/DictionaryEntryCard';
import { DictionaryEntry } from '@/models/dictionary';
import { apiClient } from '@/services/api';

// Mock the DomainDetailDrawer component
jest.mock('@/components/DomainDetailDrawer', () => {
    return function MockDomainDetailDrawer({ open, domain, onClose }: any) {
        return open ? (
            <div data-testid="domain-detail-drawer">
                <div>Drawer for {domain?.getName()}</div>
                <button onClick={onClose}>Close</button>
            </div>
        ) : null;
    };
});

// Mock the apiClient
jest.mock('@/services/api', () => ({
    apiClient: {
        getDomainStatus: jest.fn(),
    },
}));

describe('DictionaryEntryCard', () => {
    const mockEntry: DictionaryEntry = {
        objectID: '1',
        word: 'example',
        category: 'Technology',
        domain: 'example.com',
        tld: 'com',
        isAvailable: true,
        lastUpdated: '2025-12-23',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render the domain name', () => {
            render(<DictionaryEntryCard entry={mockEntry} />);

            expect(screen.getByText('example.com')).toBeInTheDocument();
        });

        it('should render the category when provided', () => {
            render(<DictionaryEntryCard entry={mockEntry} />);

            expect(screen.getByText('Technology')).toBeInTheDocument();
        });

        it('should not render category when not provided', () => {
            const entryWithoutCategory = { ...mockEntry, category: undefined };
            render(<DictionaryEntryCard entry={entryWithoutCategory} />);

            expect(screen.queryByText('Technology')).not.toBeInTheDocument();
        });

        it('should show availability indicator when domain is available', () => {
            render(<DictionaryEntryCard entry={mockEntry} />);

            const availableIndicator = document.querySelector('[aria-label="Available"]');
            expect(availableIndicator).toBeInTheDocument();
        });

        it('should not show availability indicator when domain is not available', () => {
            const unavailableEntry = { ...mockEntry, isAvailable: false };
            render(<DictionaryEntryCard entry={unavailableEntry} />);

            const availableIndicator = document.querySelector('[aria-label="Available"]');
            expect(availableIndicator).not.toBeInTheDocument();
        });
    });

    describe('Styling', () => {
        it('should apply green styling when domain is available', () => {
            const { container } = render(<DictionaryEntryCard entry={mockEntry} />);

            const card = container.querySelector('.bg-green-200\\/60');
            expect(card).toBeInTheDocument();
        });

        it('should apply gray styling when domain is not available', () => {
            const unavailableEntry = { ...mockEntry, isAvailable: false };
            const { container } = render(<DictionaryEntryCard entry={unavailableEntry} />);

            const card = container.querySelector('.bg-gray-200\\/60');
            expect(card).toBeInTheDocument();
        });
    });

    describe('Interactions', () => {
        it('should open drawer when card is clicked', async () => {
            (apiClient.getDomainStatus as jest.Mock).mockResolvedValue('available');

            render(<DictionaryEntryCard entry={mockEntry} />);

            const card = screen.getByText('example.com').closest('.group');
            fireEvent.click(card!);

            await waitFor(() => {
                expect(screen.getByTestId('domain-detail-drawer')).toBeInTheDocument();
            });
        });

        it('should call apiClient.getDomainStatus when card is clicked', async () => {
            (apiClient.getDomainStatus as jest.Mock).mockResolvedValue('available');

            render(<DictionaryEntryCard entry={mockEntry} />);

            const card = screen.getByText('example.com').closest('.group');
            fireEvent.click(card!);

            await waitFor(() => {
                expect(apiClient.getDomainStatus).toHaveBeenCalledWith('example.com');
            });
        });

        it('should close drawer when onClose is called', async () => {
            (apiClient.getDomainStatus as jest.Mock).mockResolvedValue('available');

            render(<DictionaryEntryCard entry={mockEntry} />);

            const card = screen.getByText('example.com').closest('.group');
            fireEvent.click(card!);

            await waitFor(() => {
                expect(screen.getByTestId('domain-detail-drawer')).toBeInTheDocument();
            });

            const closeButton = screen.getByText('Close');
            fireEvent.click(closeButton);

            await waitFor(() => {
                expect(screen.queryByTestId('domain-detail-drawer')).not.toBeInTheDocument();
            });
        });
    });

    describe('Variants', () => {
        it('should render with normal variant by default', () => {
            render(<DictionaryEntryCard entry={mockEntry} />);

            // Component should render successfully with default variant
            expect(screen.getByText('example.com')).toBeInTheDocument();
        });

        it('should render with compact variant', () => {
            render(<DictionaryEntryCard entry={mockEntry} variant="compact" />);

            // Component should render successfully with compact variant
            expect(screen.getByText('example.com')).toBeInTheDocument();
        });
    });
});
