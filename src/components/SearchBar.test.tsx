import { render, screen } from '@testing-library/react';
import SearchBar from './SearchBar';
import { useRouter, useSearchParams } from 'next/navigation';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}));

describe('SearchBar', () => {
    it('displays search term from query params', () => {
        (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), refresh: jest.fn() });
        (useSearchParams as jest.Mock).mockReturnValue({
            get: (key: string) => (key === 'term' ? 'example' : null),
        });

        render(<SearchBar />);

        expect(screen.getByPlaceholderText('Find the perfect domain hack')).toHaveValue('example');
    });
});
