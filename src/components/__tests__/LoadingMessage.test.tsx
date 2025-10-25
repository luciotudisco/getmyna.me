import { act, render, screen } from '@testing-library/react';

import LoadingMessage from '@/components/LoadingMessage';

// Mock the Lottie Player
jest.mock('@lottiefiles/react-lottie-player', () => ({
    Player: ({ src, autoplay, loop, style: _style }: any) => (
        <div data-testid="lottie-player" data-src={src} data-autoplay={autoplay} data-loop={loop}>
            Lottie Player
        </div>
    ),
}));

describe('LoadingMessage', () => {
    it('should render with custom message', async () => {
        const customMessage = 'Loading custom content...';
        await act(async () => {
            render(<LoadingMessage message={customMessage} />);
        });

        expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('should render Lottie player with correct props', async () => {
        await act(async () => {
            render(<LoadingMessage />);
        });

        const lottiePlayer = screen.getByTestId('lottie-player');
        expect(lottiePlayer).toBeInTheDocument();
        expect(lottiePlayer).toHaveAttribute('data-src', '/loading.json');
        expect(lottiePlayer).toHaveAttribute('data-autoplay', 'true');
        expect(lottiePlayer).toHaveAttribute('data-loop', 'true');
    });
});
