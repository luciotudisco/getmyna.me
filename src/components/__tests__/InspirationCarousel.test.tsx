import { render, screen } from '@testing-library/react';

import InspirationCarousel from '@/components/InspirationCarousel';

// Mock the UI carousel components
jest.mock('@/components/ui/carousel', () => ({
    Carousel: ({ children, className, ...props }: any) => (
        <div data-testid="carousel-root" className={className} {...props}>
            {children}
        </div>
    ),
    CarouselContent: ({ children, className }: any) => (
        <div data-testid="carousel-content" className={className}>
            {children}
        </div>
    ),
    CarouselItem: ({ children, className }: any) => (
        <div data-testid="carousel-item" className={className}>
            {children}
        </div>
    ),
}));

describe('InspirationCarousel', () => {
    it('should render carousel component with all items', () => {
        render(<InspirationCarousel />);

        // Check carousel structure
        expect(screen.getByTestId('carousel-root')).toBeInTheDocument();
        expect(screen.getByTestId('carousel-content')).toBeInTheDocument();

        // Check all carousel items are rendered
        const carouselItems = screen.getAllByTestId('carousel-item');
        expect(carouselItems).toHaveLength(7);
    });

    it('should render domain hack examples with proper content', () => {
        render(<InspirationCarousel />);

        // Check that domain examples are present
        expect(screen.getByText('instagr.am')).toBeInTheDocument();
        expect(screen.getByText('ma.tt')).toBeInTheDocument();
        expect(screen.getByText('bit.ly')).toBeInTheDocument();
        expect(screen.getByText('nav.al')).toBeInTheDocument();
        expect(screen.getByText('flic.kr')).toBeInTheDocument();
        expect(screen.getByText('kevinro.se')).toBeInTheDocument();

        // Check that general description is present
        expect(screen.getByText('A domain hack is a clever twist', { exact: false })).toBeInTheDocument();
    });
});
