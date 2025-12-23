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
        it('should render domain name and category', () => {
            render(<DictionaryEntryCard entry={mockEntry} />);

            expect(screen.getByText('example.com')).toBeInTheDocument();
            expect(screen.getByText('Technology')).toBeInTheDocument();
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

    describe('Interactions', () => {
        it('should open drawer when card is clicked and fetch domain status', async () => {
            (apiClient.getDomainStatus as jest.Mock).mockResolvedValue('available');

            render(<DictionaryEntryCard entry={mockEntry} />);

            const card = screen.getByText('example.com').closest('.group');
            fireEvent.click(card!);

            await waitFor(() => {
                expect(screen.getByTestId('domain-detail-drawer')).toBeInTheDocument();
            });
            await waitFor(() => {
                expect(apiClient.getDomainStatus).toHaveBeenCalledWith('example.com');
            });
        });
    });
});
