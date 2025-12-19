import { fireEvent, render, screen } from '@testing-library/react';

import { type DictionaryAlgoliaHit, DictionaryHitCard } from '@/components/DictionaryHitCard';

describe('DictionaryHitCard', () => {
    it('renders the domain name and optional details', () => {
        const hit: DictionaryAlgoliaHit = {
            objectID: '1',
            word: 'hello',
            category: 'common',
            domain: 'hello.com',
            tld: 'com',
            isAvailable: true,
        };

        render(
            <DictionaryHitCard
                hit={hit}
                onDomainClick={() => {}}
                details={<p data-testid="details">Category: {hit.category}</p>}
            />,
        );

        expect(screen.getByText('hello.com')).toBeInTheDocument();
        expect(screen.getByTestId('details')).toHaveTextContent('Category: common');
    });

    it('shows the availability indicator when the hit is available', () => {
        const hit: DictionaryAlgoliaHit = {
            objectID: '1',
            word: 'hello',
            domain: 'hello.com',
            tld: 'com',
            isAvailable: true,
        };

        render(<DictionaryHitCard hit={hit} onDomainClick={() => {}} />);
        expect(screen.getByLabelText('Available')).toBeInTheDocument();
    });

    it('does not show the availability indicator when the hit is not available', () => {
        const hit: DictionaryAlgoliaHit = {
            objectID: '1',
            word: 'hello',
            domain: 'hello.com',
            tld: 'com',
            isAvailable: false,
        };

        render(<DictionaryHitCard hit={hit} onDomainClick={() => {}} />);
        expect(screen.queryByLabelText('Available')).not.toBeInTheDocument();
    });

    it('calls onDomainClick with a Domain when clicked', () => {
        const hit: DictionaryAlgoliaHit = {
            objectID: '1',
            word: 'hello',
            domain: 'hello.com',
            tld: 'com',
            isAvailable: true,
        };
        const onDomainClick = jest.fn();

        render(<DictionaryHitCard hit={hit} onDomainClick={onDomainClick} />);

        fireEvent.click(screen.getByText('hello.com'));

        expect(onDomainClick).toHaveBeenCalledTimes(1);
        expect(onDomainClick.mock.calls[0]?.[0]?.getName()).toBe('hello.com');
    });
});
