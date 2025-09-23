import { render, screen } from '@testing-library/react';

import Carousel from '@/components/Carousel';

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

describe('Carousel', () => {
    it('should render carousel component with all items', () => {
        render(<Carousel />);

        // Check carousel structure
        expect(screen.getByTestId('carousel-root')).toBeInTheDocument();
        expect(screen.getByTestId('carousel-content')).toBeInTheDocument();

        // Check all carousel items are rendered
        const carouselItems = screen.getAllByTestId('carousel-item');
        expect(carouselItems).toHaveLength(7);
    });

    it('should render domain hack examples with proper content', () => {
        render(<Carousel />);

        // Check that domain examples are present
        expect(screen.getByText('instagr.am')).toBeInTheDocument();
        expect(screen.getByText('ma.tt')).toBeInTheDocument();
        expect(screen.getByText('bit.ly')).toBeInTheDocument();
        expect(screen.getByText('nav.al')).toBeInTheDocument();
        expect(screen.getByText('flic.kr')).toBeInTheDocument();
        expect(screen.getByText('kevinro.se')).toBeInTheDocument();

        // Check that general description is present
        expect(
            screen.getByText(
                'A domain hack is a clever twist where the domain and extension merge together. Perfect for creating short, catchy, and brandable web addresses.',
            ),
        ).toBeInTheDocument();
    });

    it('should apply correct styling and classes', () => {
        render(<Carousel />);

        // Check carousel container classes
        const carouselRoot = screen.getByTestId('carousel-root');
        expect(carouselRoot).toHaveClass('w-full', 'p-5');

        const carouselContent = screen.getByTestId('carousel-content');
        expect(carouselContent).toHaveClass('text-sm');

        // Check carousel item classes
        const carouselItems = screen.getAllByTestId('carousel-item');
        carouselItems.forEach((item) => {
            expect(item).toHaveClass('m-2', 'flex', 'items-center', 'justify-center', 'align-middle', 'md:m-5');
        });

        // Check domain elements have proper styling
        const domainElements = screen.getAllByText(/\.(am|tt|ly|al|kr|se)$/);
        domainElements.forEach((element) => {
            expect(element).toHaveClass('rounded-md', 'p-1', 'font-bold');
        });

        // Check that domain elements have background colors
        expect(screen.getByText('instagr.am')).toHaveStyle('background-color: #fde2e4');
        expect(screen.getByText('ma.tt')).toHaveStyle('background-color: #eff7f6');
    });
});
