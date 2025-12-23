import { render, screen } from '@testing-library/react';

import TLDDictionary from '@/components/TLDDictionary';
import { DictionaryEntry } from '@/models/dictionary';

// Mock react-instantsearch
const mockUseHits = jest.fn();
jest.mock('react-instantsearch', () => ({
    InstantSearch: ({ children }: { children: React.ReactNode }) => <div data-testid="instant-search">{children}</div>,
    Configure: ({ filters, hitsPerPage }: { filters?: string; hitsPerPage?: number }) => (
        <div data-testid="configure" data-filters={filters} data-hits-per-page={hitsPerPage} />
    ),
    useHits: () => mockUseHits(),
}));

// Mock DictionaryEntryCard
jest.mock('@/components/DictionaryEntryCard', () => {
    return function MockDictionaryEntryCard({ entry }: { entry: DictionaryEntry }) {
        return <div data-testid="dictionary-entry-card">{entry.domain}</div>;
    };
});

// Mock algoliasearch
jest.mock('algoliasearch/lite', () => ({
    liteClient: jest.fn(() => ({})),
}));

describe('TLDDictionary', () => {
    const mockEntries: DictionaryEntry[] = [
        {
            objectID: '1',
            domain: 'example.com',
            tld: 'com',
            word: 'example',
            category: 'common',
            isAvailable: true,
        },
        {
            objectID: '2',
            domain: 'test.io',
            tld: 'io',
            word: 'test',
            category: 'common',
            isAvailable: true,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the component with header and search component', () => {
        mockUseHits.mockReturnValue({ items: [] });

        render(<TLDDictionary tld="com" />);

        expect(screen.getByText('Dictionary entries')).toBeInTheDocument();
        expect(screen.getByTestId('instant-search')).toBeInTheDocument();
    });

    it('should render dictionary entry cards when hits are available', () => {
        mockUseHits.mockReturnValue({ items: mockEntries });

        render(<TLDDictionary tld="com" />);

        const cards = screen.getAllByTestId('dictionary-entry-card');
        expect(cards).toHaveLength(2);
        expect(screen.getByText('example.com')).toBeInTheDocument();
        expect(screen.getByText('test.io')).toBeInTheDocument();
    });

    it('should render empty state when no hits are available', () => {
        mockUseHits.mockReturnValue({ items: [] });

        render(<TLDDictionary tld="com" />);

        expect(screen.getByText('No available domain hacks for this TLD.')).toBeInTheDocument();
    });

    it('should generate correct filter for the provided TLD', () => {
        mockUseHits.mockReturnValue({ items: [] });

        render(<TLDDictionary tld="com" />);

        const configure = screen.getByTestId('configure');
        expect(configure).toHaveAttribute('data-filters', 'tld:com AND isAvailable:true');
        expect(configure).toHaveAttribute('data-hits-per-page', '20');
    });
});
