import { render, screen } from '@testing-library/react';

import { AmplitudeProvider, useAmplitude } from '@/contexts/AmplitudeContext';

// Mock Amplitude
jest.mock('@amplitude/analytics-browser', () => ({
    init: jest.fn(),
    track: jest.fn(),
    identify: jest.fn(),
    setUserId: jest.fn(),
    setUserProperties: jest.fn(),
}));

// Mock environment variable
const originalEnv = process.env;
beforeAll(() => {
    process.env = {
        ...originalEnv,
        NEXT_PUBLIC_AMPLITUDE_API_KEY: 'test-api-key',
    };
});

afterAll(() => {
    process.env = originalEnv;
});

// Test component that uses the context
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

    it('should throw error when used outside provider', () => {
        // Suppress console.error for this test
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        function TestComponentOutsideProvider() {
            useAmplitude();
            return <div>Test</div>;
        }

        expect(() => {
            render(<TestComponentOutsideProvider />);
        }).toThrow('useAmplitude must be used within an AmplitudeProvider');

        consoleSpy.mockRestore();
    });
});
