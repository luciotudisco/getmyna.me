import { render, screen } from '@testing-library/react';

import NoResultsMessage from '@/components/NoResultsMessage';

// Mock the Lottie Player
jest.mock('@lottiefiles/react-lottie-player', () => ({
    Player: ({ src, autoplay, keepLastFrame, style }: any) => (
        <div data-testid="lottie-player" data-src={src} data-autoplay={autoplay} data-keep-last-frame={keepLastFrame}>
            Lottie Player
        </div>
    ),
}));

describe('NoResultsMessage', () => {
    it('should render with custom message', () => {
        const customMessage = 'No results found for your search';
        render(<NoResultsMessage message={customMessage} />);

        expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('should render Lottie player with correct props', () => {
        render(<NoResultsMessage />);

        const lottiePlayer = screen.getByTestId('lottie-player');
        expect(lottiePlayer).toBeInTheDocument();
        expect(lottiePlayer).toHaveAttribute('data-src', '/sad-empty-box.json');
        expect(lottiePlayer).toHaveAttribute('data-autoplay', 'true');
        expect(lottiePlayer).toHaveAttribute('data-keep-last-frame', 'true');
    });
});
