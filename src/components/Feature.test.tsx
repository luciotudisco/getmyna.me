import { render, screen } from '@testing-library/react';
import Feature from '@/components/Feature';

describe('Feature Component', () => {
    test('renders Feature component with given props', () => {
        const title = 'Sample Title';
        const description = 'Sample Description';
        const image = 'sample-image.png';

        render(<Feature title={title} description={description} image={image} />);

        const imageElement = screen.getByAltText(title);
        expect(imageElement).toBeInTheDocument();
        expect(imageElement).toHaveAttribute('src', '/sample-image.png');

        const titleElement = screen.getByText(title);
        expect(titleElement).toBeInTheDocument();

        const descriptionElement = screen.getByText(description);
        expect(descriptionElement).toBeInTheDocument();
    });
});
