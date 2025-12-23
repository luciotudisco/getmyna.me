import { Suspense } from 'react';
import { useHits } from 'react-instantsearch';
import { render, screen } from '@testing-library/react';

import DictionaryWordPage from '../page';

// Mock react to handle `use` hook
jest.mock('react', () => {
    const original = jest.requireActual('react');
    return {
        ...original,
        use: (promise: any) => promise,
    };
});

// Mock react-instantsearch
jest.mock('react-instantsearch', () => ({
    InstantSearch: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Configure: () => null,
    useHits: jest.fn(),
}));

// Mock algoliasearch
jest.mock('algoliasearch/lite', () => ({
    liteClient: jest.fn(() => ({})),
}));

// Mock DictionaryEntryCard
jest.mock('@/components/DictionaryEntryCard', () => {
    return function MockCard({ entry }: { entry: any }) {
        return <div data-testid="entry-card">{entry.domain}</div>;
    };
});

// Mock NoResultsMessage
jest.mock('@/components/NoResultsMessage', () => {
    return function MockNoResults() {
        return <div data-testid="no-results">No Results</div>;
    };
});

describe('DictionaryWordPage', () => {
    const mockUseHits = useHits as jest.Mock;

    beforeEach(() => {
        mockUseHits.mockReturnValue({
            items: [
                {
                    objectID: '1',
                    word: 'apple',
                    domain: 'app.le',
                    tld: 'le',
                    isAvailable: true,
                    category: 'tech',
                },
            ],
        });
    });

    it('renders the page with correct slug and results', async () => {
        // Pass plain object since we mocked `use` to return the input
        const params = { slug: 'apple' } as unknown as Promise<{ slug: string }>;

        render(
            <Suspense fallback={<div>Loading...</div>}>
                <DictionaryWordPage params={params} />
            </Suspense>,
        );

        // No longer async waiting for suspense maybe, but good to keep findByText
        expect(await screen.findByText('Domain hacks for "apple"')).toBeInTheDocument();
        expect(screen.getByTestId('entry-card')).toHaveTextContent('app.le');
    });

    it('renders no results message when no items found', async () => {
        mockUseHits.mockReturnValue({ items: [] });
        const params = { slug: 'banana' } as unknown as Promise<{ slug: string }>;

        render(
            <Suspense fallback={<div>Loading...</div>}>
                <DictionaryWordPage params={params} />
            </Suspense>,
        );

        expect(await screen.findByText('Domain hacks for "banana"')).toBeInTheDocument();
        expect(screen.getByTestId('no-results')).toBeInTheDocument();
    });
});
