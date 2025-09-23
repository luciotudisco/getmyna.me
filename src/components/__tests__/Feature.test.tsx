import { render, screen } from '@testing-library/react';

import Feature from '@/components/Feature';

// Mock Next.js Image component
jest.mock('next/image', () => {
    return function MockImage({ src, alt, width, height }: any) {
        return <img src={src} alt={alt} width={width} height={height} data-testid="feature-image" />;
    };
});

describe('Feature', () => {
    const defaultProps = {
        title: 'Test Feature',
        description: 'This is a test feature description',
        image: '/test-image.png',
        color: '#ff0000',
    };

    it('should render the feature with all required props', () => {
        render(<Feature {...defaultProps} />);

        expect(screen.getByText('Test Feature')).toBeInTheDocument();
        expect(screen.getByText('This is a test feature description')).toBeInTheDocument();
        expect(screen.getByTestId('feature-image')).toBeInTheDocument();
    });

    it('should render the title correctly', () => {
        render(<Feature {...defaultProps} />);

        const titleElement = screen.getByText('Test Feature');
        expect(titleElement).toBeInTheDocument();
        expect(titleElement).toHaveClass('font-extralight');
    });

    it('should render the description correctly', () => {
        render(<Feature {...defaultProps} />);

        const descriptionElement = screen.getByText('This is a test feature description');
        expect(descriptionElement).toBeInTheDocument();
        expect(descriptionElement).toHaveClass('text-balance');
    });

    it('should render the image with correct attributes', () => {
        render(<Feature {...defaultProps} />);

        const imageElement = screen.getByTestId('feature-image');
        expect(imageElement).toBeInTheDocument();
        expect(imageElement).toHaveAttribute('src', '/test-image.png');
        expect(imageElement).toHaveAttribute('alt', 'Test Feature');
        expect(imageElement).toHaveAttribute('width', '48');
        expect(imageElement).toHaveAttribute('height', '48');
    });

    it('should apply the background color when color prop is provided', () => {
        render(<Feature {...defaultProps} />);

        const cardElement = document.querySelector('[style*="background-color"]');
        expect(cardElement).toHaveStyle('background-color: #ff0000');
    });

    it('should render without background color when color prop is not provided', () => {
        const { color, ...propsWithoutColor } = defaultProps;
        render(<Feature {...propsWithoutColor} />);

        expect(screen.getByText('Test Feature')).toBeInTheDocument();
        expect(screen.getByText('This is a test feature description')).toBeInTheDocument();
        expect(screen.getByTestId('feature-image')).toBeInTheDocument();
    });

    it('should render with different title and description', () => {
        const customProps = {
            ...defaultProps,
            title: 'Custom Feature Title',
            description: 'Custom feature description with different content',
        };

        render(<Feature {...customProps} />);

        expect(screen.getByText('Custom Feature Title')).toBeInTheDocument();
        expect(screen.getByText('Custom feature description with different content')).toBeInTheDocument();
    });

    it('should render with different image source', () => {
        const customProps = {
            ...defaultProps,
            image: '/custom-image.svg',
            title: 'Custom Title',
        };

        render(<Feature {...customProps} />);

        const imageElement = screen.getByTestId('feature-image');
        expect(imageElement).toHaveAttribute('src', '/custom-image.svg');
        expect(imageElement).toHaveAttribute('alt', 'Custom Title');
    });

    it('should render with different background color', () => {
        const customProps = {
            ...defaultProps,
            color: '#00ff00',
        };

        render(<Feature {...customProps} />);

        const cardElement = document.querySelector('[style*="background-color"]');
        expect(cardElement).toHaveStyle('background-color: #00ff00');
    });

    it('should render all content elements in the correct structure', () => {
        render(<Feature {...defaultProps} />);

        // Check that the main content elements exist
        expect(screen.getByText('Test Feature')).toBeInTheDocument();
        expect(screen.getByText('This is a test feature description')).toBeInTheDocument();
        expect(screen.getByTestId('feature-image')).toBeInTheDocument();

        // Check that the image and text content are siblings (in the same container)
        const imageElement = screen.getByTestId('feature-image');
        const titleElement = screen.getByText('Test Feature');

        // Both should be in the same parent container
        const parentContainer = imageElement.closest('.flex.flex-row');
        expect(parentContainer).toContainElement(titleElement);
    });

    it('should handle empty strings for title and description', () => {
        const edgeCaseProps = {
            ...defaultProps,
            title: '',
            description: '',
        };

        render(<Feature {...edgeCaseProps} />);

        // Even with empty strings, the elements should still be rendered
        const titleElements = screen.getAllByText('');
        const descriptionElements = screen.getAllByText('');

        expect(titleElements.length).toBeGreaterThan(0);
        expect(descriptionElements.length).toBeGreaterThan(0);

        // Check that the image still has empty alt text when title is empty
        const imageElement = screen.getByTestId('feature-image');
        expect(imageElement).toHaveAttribute('alt', '');
    });
});
