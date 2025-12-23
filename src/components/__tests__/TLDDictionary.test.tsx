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
            isAvailable: true,
        },
        {
            objectID: '2',
            domain: 'test.com',
            tld: 'com',
            isAvailable: true,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the component with header and dictionary entries', () => {
        mockUseHits.mockReturnValue({ items: mockEntries });

        render(<TLDDictionary tld="com" />);

        expect(screen.getByText('Domain Hacks')).toBeInTheDocument();
        expect(screen.getByTestId('instant-search')).toBeInTheDocument();

        const cards = screen.getAllByTestId('dictionary-entry-card');
        expect(cards).toHaveLength(2);
        expect(screen.getByText('example.com')).toBeInTheDocument();
        expect(screen.getByText('test.com')).toBeInTheDocument();
    });

    it('should render empty state when no hits are available', () => {
        mockUseHits.mockReturnValue({ items: [] });

        render(<TLDDictionary tld="com" />);

        expect(screen.queryByText('Domain Hacks')).toBeNull();
        expect(screen.queryAllByTestId('dictionary-entry-card')).toHaveLength(0);
    });

    it('should generate correct filter for the provided TLD', () => {
        mockUseHits.mockReturnValue({ items: mockEntries });

        render(<TLDDictionary tld="com" />);

        const configure = screen.getByTestId('configure');
        expect(configure).toHaveAttribute('data-filters', 'tld:com AND isAvailable:true');
        expect(configure).toHaveAttribute('data-hits-per-page', '20');
    });
});
