import { render, screen } from '@testing-library/react';

import Feature from '@/components/Feature';

// Mock Next.js Image component
jest.mock('next/image', () => {
    return function MockImage({ src, alt, width, height }: any) {
        // eslint-disable-next-line @next/next/no-img-element
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

    it('should render all content correctly', () => {
        render(<Feature {...defaultProps} />);

        expect(screen.getByText('Test Feature')).toBeInTheDocument();
        expect(screen.getByText('This is a test feature description')).toBeInTheDocument();
        expect(screen.getByTestId('feature-image')).toBeInTheDocument();
    });

    it('should render image with correct attributes', () => {
        render(<Feature {...defaultProps} />);

        const imageElement = screen.getByTestId('feature-image');
        expect(imageElement).toHaveAttribute('src', '/test-image.png');
        expect(imageElement).toHaveAttribute('alt', 'Test Feature');
        expect(imageElement).toHaveAttribute('width', '48');
        expect(imageElement).toHaveAttribute('height', '48');
    });

    it('should apply background color when provided', () => {
        render(<Feature {...defaultProps} />);

        const cardElement = document.querySelector('[style*="background-color"]');
        expect(cardElement).toHaveStyle('background-color: #ff0000');
    });

    it('should render without color prop', () => {
        const { color: _color, ...propsWithoutColor } = defaultProps;
        render(<Feature {...propsWithoutColor} />);

        expect(screen.getByText('Test Feature')).toBeInTheDocument();
        expect(screen.getByText('This is a test feature description')).toBeInTheDocument();
    });
});
