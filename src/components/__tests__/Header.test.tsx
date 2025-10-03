import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';

import Header from '@/components/Header';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
    return function MockImage({ src, alt, priority, ...props }: any) {
        return <img src={src} alt={alt} data-priority={priority} {...props} />;
    };
});

// Mock Next.js Link component
jest.mock('next/link', () => {
    return function MockLink({ href, children, prefetch, ...props }: any) {
        return (
            <a href={href} data-prefetch={prefetch} {...props}>
                {children}
            </a>
        );
    };
});

// Mock SearchBar component
jest.mock('@/components/SearchBar', () => {
    return function MockSearchBar() {
        return <div data-testid="search-bar">Search Bar</div>;
    };
});

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('Header', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render header with logo and title on home page', () => {
        mockUsePathname.mockReturnValue('/');

        render(<Header />);

        // Check logo link
        const logoLink = screen.getByLabelText('Go to homepage');
        expect(logoLink).toHaveAttribute('href', '/');

        // Check logo image
        const logoImage = screen.getByAltText('GetMyNa.me');
        expect(logoImage).toHaveAttribute('src', '/logo.svg');

        // Check title on home page
        const title = screen.getByText('GetMyNa.me');
        expect(title).toBeInTheDocument();

        // Check about buttons (desktop and mobile)
        const aboutButton = screen.getByLabelText('About GetMyNa.me');
        expect(aboutButton).toBeInTheDocument();
        expect(aboutButton).toHaveAttribute('href', '/about');
    });

    it('should render search bar on non-home pages', () => {
        mockUsePathname.mockReturnValue('/search');

        render(<Header />);

        // Check header element
        const header = screen.getByRole('banner');
        expect(header).toBeInTheDocument();

        // Check logo link
        const logoLink = screen.getByLabelText('Go to homepage');
        expect(logoLink).toHaveAttribute('href', '/');

        // Check logo image
        const logoImage = screen.getByAltText('GetMyNa.me');
        expect(logoImage).toHaveAttribute('src', '/logo.svg');

        // Check search bar is rendered instead of title
        const searchBar = screen.getByTestId('search-bar');
        expect(searchBar).toBeInTheDocument();
        expect(searchBar).toHaveTextContent('Search Bar');

        // Title should not be present
        const title = screen.queryByText('GetMyNa.me');
        expect(title).not.toBeInTheDocument();

        // Check about button
        const aboutButton = screen.getByLabelText('About GetMyNa.me');
        expect(aboutButton).toBeInTheDocument();
        expect(aboutButton).toHaveAttribute('href', '/about');
    });
});
