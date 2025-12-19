import { createPortal } from 'react-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Domain, DomainStatus } from '@/models/domain';
import { apiClient } from '@/services/api';

const mockAlgoliaSearch = jest.fn();

jest.mock('algoliasearch/lite', () => ({
    liteClient: () => ({
        search: mockAlgoliaSearch,
    }),
}));

jest.mock('@/services/api', () => ({
    apiClient: {
        getDomainStatus: jest.fn(),
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
        return createPortal(
            <div data-testid="domain-detail-drawer" data-open={open} data-domain={domain.getName()}>
                <button data-testid="close-drawer" onClick={onClose}>
                    Close
                </button>
            </div>,
            document.body,
        );
    };
});

const mockGetDomainStatus = apiClient.getDomainStatus as jest.MockedFunction<typeof apiClient.getDomainStatus>;

describe('TLDDictionaryEntriesSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAlgoliaSearch.mockReset();
    });

    it('queries algolia and renders up to 20 available hits', async () => {
        mockAlgoliaSearch.mockResolvedValue({
            results: [
                {
                    hits: [
                        {
                            objectID: '1',
                            word: 'hello',
                            category: 'common',
                            domain: 'hello.com',
                            tld: 'com',
                            isAvailable: true,
                        },
                        {
                            objectID: '2',
                            word: 'world',
                            category: 'names',
                            domain: 'world.com',
                            tld: 'com',
                            isAvailable: true,
                        },
                    ],
                },
            ],
        });

        const TLDDictionaryEntriesSection = (await import('@/components/TLDDictionaryEntriesSection')).default;
        render(<TLDDictionaryEntriesSection tld="com" />);

        await waitFor(() => expect(screen.getByText('hello.com')).toBeInTheDocument());
        expect(screen.getByText('world.com')).toBeInTheDocument();
        expect(screen.getByText('hello')).toBeInTheDocument();

        expect(mockAlgoliaSearch).toHaveBeenCalledTimes(1);
        const firstCallArg = mockAlgoliaSearch.mock.calls[0]?.[0]?.[0];
        expect(firstCallArg?.indexName).toBe(process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME);
        expect(firstCallArg?.params?.hitsPerPage).toBe(20);
        expect(firstCallArg?.params?.filters).toBe(
            'tld:"com" AND isAvailable:true AND (category:"common" OR category:"names")',
        );
    });

    it('shows an empty state when no hits are found', async () => {
        mockAlgoliaSearch.mockResolvedValue({
            results: [{ hits: [] }],
        });

        const TLDDictionaryEntriesSection = (await import('@/components/TLDDictionaryEntriesSection')).default;
        render(<TLDDictionaryEntriesSection tld="com" />);

        await waitFor(() =>
            expect(screen.getByText('No available dictionary entries found for this TLD.')).toBeInTheDocument(),
        );
    });

    it('calls domain status API when clicking a result', async () => {
        mockAlgoliaSearch.mockResolvedValue({
            results: [
                {
                    hits: [
                        {
                            objectID: '1',
                            word: 'hello',
                            category: 'common',
                            domain: 'hello.com',
                            tld: 'com',
                            isAvailable: true,
                        },
                    ],
                },
            ],
        });
        mockGetDomainStatus.mockResolvedValue(DomainStatus.ACTIVE);

        const TLDDictionaryEntriesSection = (await import('@/components/TLDDictionaryEntriesSection')).default;
        render(<TLDDictionaryEntriesSection tld="com" />);

        await waitFor(() => expect(screen.getByText('hello.com')).toBeInTheDocument());

        fireEvent.click(screen.getByText('hello.com'));
        await waitFor(() => expect(mockGetDomainStatus).toHaveBeenCalledWith('hello.com'));
    });
});
