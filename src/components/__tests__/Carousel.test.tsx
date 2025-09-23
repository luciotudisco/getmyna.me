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
    it('should render carousel component', () => {
        render(<Carousel />);

        expect(screen.getByTestId('carousel-root')).toBeInTheDocument();
        expect(screen.getByTestId('carousel-content')).toBeInTheDocument();
    });

    it('should render all carousel items', () => {
        render(<Carousel />);

        const carouselItems = screen.getAllByTestId('carousel-item');
        expect(carouselItems).toHaveLength(7);
    });

    it('should render the first carousel item with general description', () => {
        render(<Carousel />);

        expect(
            screen.getByText(
                'A domain hack is a clever twist where the domain and extension merge together. Perfect for creating short, catchy, and brandable web addresses.',
            ),
        ).toBeInTheDocument();
    });

    it('should render Instagram domain hack example', () => {
        render(<Carousel />);

        expect(screen.getByText('instagr.am')).toBeInTheDocument();
        expect(
            screen.getByText(
                'The original domain for Instagram utilized the TLD of Armenia (.am) to form a memorable and brand-aligned name',
            ),
        ).toBeInTheDocument();
    });

    it('should render Matt Mullenweg domain hack example', () => {
        render(<Carousel />);

        expect(screen.getByText('ma.tt')).toBeInTheDocument();
        expect(
            screen.getByText(
                "Matt Mullenweg - co-founder of WordPress - uses Trinidad and Tobago's TLD (.tt) to create an ultra-short domain.",
            ),
        ).toBeInTheDocument();
    });

    it('should render bit.ly domain hack example', () => {
        render(<Carousel />);

        expect(screen.getByText('bit.ly')).toBeInTheDocument();
        expect(
            screen.getByText(
                'A widely recognized URL shortening service that uses the TLD of Libya (.ly) to create a catchy and memorable name.',
            ),
        ).toBeInTheDocument();
    });

    it('should render Naval domain hack example', () => {
        render(<Carousel />);

        expect(screen.getByText('nav.al')).toBeInTheDocument();
        expect(
            screen.getByText(
                "Naval Ravikant - co-founder of AngelList - uses Albania's TLD (.al) to succinctly spells out his name.",
            ),
        ).toBeInTheDocument();
    });

    it('should render Flickr domain hack example', () => {
        render(<Carousel />);

        expect(screen.getByText('flic.kr')).toBeInTheDocument();
        expect(
            screen.getByText(
                'Flickr uses a domain hack with the TLD of South Korea (.kr) to create a short and recognizable name',
            ),
        ).toBeInTheDocument();
    });

    it('should render Kevin Rose domain hack example', () => {
        render(<Carousel />);

        expect(screen.getByText('kevinro.se')).toBeInTheDocument();
        expect(
            screen.getByText("Kevin Rose - founder of Digg - uses Sweden's TLD (.se) to complete his last name."),
        ).toBeInTheDocument();
    });

    it('should apply correct styling to domain elements', () => {
        render(<Carousel />);

        const instagramDomain = screen.getByText('instagr.am');
        expect(instagramDomain).toHaveStyle('background-color: #fde2e4');

        const mattDomain = screen.getByText('ma.tt');
        expect(mattDomain).toHaveStyle('background-color: #eff7f6');

        const bitlyDomain = screen.getByText('bit.ly');
        expect(bitlyDomain).toHaveStyle('background-color: #e5b3fe');

        const navalDomain = screen.getByText('nav.al');
        expect(navalDomain).toHaveStyle('background-color: #ffd6a5');

        const flickrDomain = screen.getByText('flic.kr');
        expect(flickrDomain).toHaveStyle('background-color: #bcd4e6');

        const kevinDomain = screen.getByText('kevinro.se');
        expect(kevinDomain).toHaveStyle('background-color: #cbf3f0');
    });

    it('should have proper CSS classes applied', () => {
        render(<Carousel />);

        const carouselRoot = screen.getByTestId('carousel-root');
        expect(carouselRoot).toHaveClass('w-full', 'p-5');

        const carouselContent = screen.getByTestId('carousel-content');
        expect(carouselContent).toHaveClass('text-sm');

        const carouselItems = screen.getAllByTestId('carousel-item');
        carouselItems.forEach((item) => {
            expect(item).toHaveClass('m-2', 'flex', 'items-center', 'justify-center', 'align-middle', 'md:m-5');
        });
    });

    it('should render domain elements with proper styling classes', () => {
        render(<Carousel />);

        const domainElements = screen.getAllByText(/\.(am|tt|ly|al|kr|se)$/);
        domainElements.forEach((element) => {
            expect(element).toHaveClass('rounded-md', 'p-1', 'font-bold');
        });
    });
});
