import { render, screen } from '@testing-library/react';

import { AmplitudeProvider, useAmplitude } from '@/contexts/AmplitudeContext';

jest.mock('@amplitude/analytics-browser', () => ({
    init: jest.fn(),
    track: jest.fn(),
}));

function TestComponent() {
    const { trackEvent } = useAmplitude();
    return (
        <div>
            <button onClick={() => trackEvent('test_event', { test: 'data' })} data-testid="track-event">
                Track Event
            </button>
        </div>
    );
}

describe('AmplitudeContext', () => {
    it('should provide context values', () => {
        render(
            <AmplitudeProvider>
                <TestComponent />
            </AmplitudeProvider>,
        );

        expect(screen.getByTestId('track-event')).toBeInTheDocument();
    });
});
