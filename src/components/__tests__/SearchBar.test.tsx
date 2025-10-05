import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';

import SearchBar from '@/components/SearchBar';

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}));

describe('SearchBar', () => {
    const mockPush = jest.fn();
    const mockRefresh = jest.fn();
    const mockGet = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();

        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
            refresh: mockRefresh,
        });

        (useSearchParams as jest.Mock).mockReturnValue({
            get: mockGet,
        });
    });

    it('renders search input with correct placeholder and button', () => {
        mockGet.mockReturnValue(null);

        render(<SearchBar />);

        const input = screen.getByPlaceholderText('Find the perfect domain hack');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('type', 'text');

        const searchButton = screen.getByRole('button', { name: 'Search' });
        expect(searchButton).toBeInTheDocument();
        expect(searchButton).toHaveClass('hidden', 'rounded-md', 'shadow-sm', 'md:inline');
    });

    it('initializes with search term from URL params', () => {
        mockGet.mockReturnValue('test-domain');

        render(<SearchBar />);

        const input = screen.getByDisplayValue('test-domain');
        expect(input).toBeInTheDocument();
    });

    it('shows clear button when search term is not empty', () => {
        mockGet.mockReturnValue(null);

        render(<SearchBar />);

        const input = screen.getByPlaceholderText('Find the perfect domain hack');
        fireEvent.change(input, { target: { value: 'test' } });

        const clearButton = screen.getByRole('button', { name: 'Clear search' });
        expect(clearButton).toBeInTheDocument();
    });

    it('clears search term when clear button is clicked', () => {
        mockGet.mockReturnValue(null);

        render(<SearchBar />);

        const input = screen.getByPlaceholderText('Find the perfect domain hack');
        fireEvent.change(input, { target: { value: 'test' } });

        const clearButton = screen.getByRole('button', { name: 'Clear search' });
        fireEvent.click(clearButton);

        expect(input).toHaveValue('');
    });

    it('submits form with search term', async () => {
        mockGet.mockReturnValue(null);

        render(<SearchBar />);

        const input = screen.getByPlaceholderText('Find the perfect domain hack');
        const form = input.closest('form');

        fireEvent.change(input, { target: { value: 'test-domain' } });
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/search?term=test-domain');
            expect(mockRefresh).toHaveBeenCalled();
        });
    });
});
