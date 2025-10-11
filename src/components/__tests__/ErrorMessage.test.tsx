import { render, screen } from '@testing-library/react';

import ErrorMessage from '@/components/ErrorMessage';

// Mock the Lottie Player
jest.mock('@lottiefiles/react-lottie-player', () => ({
    Player: ({ src, autoplay, keepLastFrame, style: _style }: any) => (
        <div data-testid="lottie-player" data-src={src} data-autoplay={autoplay} data-keep-last-frame={keepLastFrame}>
            Lottie Player
        </div>
    ),
}));

describe('ErrorMessage', () => {
    it('should render with custom message', () => {
        const customMessage = 'Custom error message';
        render(<ErrorMessage message={customMessage} />);

        expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('should render Lottie player with correct props', () => {
        render(<ErrorMessage />);

        const lottiePlayer = screen.getByTestId('lottie-player');
        expect(lottiePlayer).toBeInTheDocument();
        expect(lottiePlayer).toHaveAttribute('data-src', '/error.json');
        expect(lottiePlayer).toHaveAttribute('data-autoplay', 'true');
        expect(lottiePlayer).toHaveAttribute('data-keep-last-frame', 'true');
    });
});
