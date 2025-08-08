import { render, screen, within } from '@testing-library/react';
import { SearchResults } from './SearchResults';
import { useSearchParams } from 'next/navigation';

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

describe('SearchResults', () => {
    beforeEach(() => {
        (useSearchParams as jest.Mock).mockReturnValue({
            get: (key: string) => (key === 'term' ? 'example' : null),
        });

        global.fetch = jest.fn((url: string) => {
            if (url.startsWith('/api/domains/search')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ domains: ['c.com', 'b.a.com'] }),
                } as Response);
            }

            if (url.startsWith('/api/domains/status')) {
                const domain = new URL('http://test' + url).searchParams.get('domain');
                const summary = domain === 'c.com' ? 'active' : 'inactive';
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ status: [{ summary }] }),
                } as Response);
            }

            return Promise.reject(new Error('Unknown URL'));
        }) as jest.Mock;
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
