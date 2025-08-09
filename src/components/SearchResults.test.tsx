import { render, screen, within } from '@testing-library/react';
import { SearchResults } from './SearchResults';
import { useSearchParams } from 'next/navigation';
import { apiService } from '@/services/api';
import { DomainStatus } from '@/models/domain';

jest.mock('next/navigation', () => ({
    useSearchParams: jest.fn(),
}));

jest.mock('@/components/DomainDetailDrawer', () => () => null);

jest.mock('@/lib/rate-limiter', () => ({
    RateLimiter: class {
        add<T>(task: () => Promise<T>): Promise<T> {
            return task();
        }
    },
}));

jest.mock('@/services/api', () => ({
    apiService: {
        searchDomains: jest.fn(),
        getDomainStatus: jest.fn(),
    },
}));

const mockedApiService = apiService as jest.Mocked<typeof apiService>;

describe('SearchResults', () => {
    beforeEach(() => {
        (useSearchParams as jest.Mock).mockReturnValue({
            get: (key: string) => (key === 'term' ? 'example' : null),
        });

        mockedApiService.searchDomains.mockResolvedValue(['c.com', 'b.a.com']);
        mockedApiService.getDomainStatus.mockImplementation((domain: string) =>
            Promise.resolve(domain === 'c.com' ? DomainStatus.active : DomainStatus.inactive),
        );
    });

    it('orders domains by level', async () => {
        render(<SearchResults />);

        const rows = await screen.findAllByRole('row');
        expect(rows[1]).toHaveTextContent('c.com');
        expect(rows[2]).toHaveTextContent('b.a.com');
    });

    it('does not show visit link for any domains', async () => {
        render(<SearchResults />);

        const rows = await screen.findAllByRole('row');
        const takenRow = rows[1];
        const availableRow = rows[2];

        expect(within(takenRow).queryByRole('link', { name: /visit/i })).toBeNull();
        expect(within(availableRow).queryByRole('link', { name: /visit/i })).toBeNull();
    });
});
