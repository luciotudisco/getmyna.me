import { render, screen } from '@testing-library/react';
import { useContext } from 'react';

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
    const { trackEvent, identify, setUserId, setUserProperties } = useAmplitude();
    
    return (
        <div>
            <button 
                onClick={() => trackEvent('test_event', { test: 'data' })}
                data-testid="track-event"
            >
                Track Event
            </button>
            <button 
                onClick={() => identify('user123', { name: 'Test User' })}
                data-testid="identify"
            >
                Identify
            </button>
            <button 
                onClick={() => setUserId('user123')}
                data-testid="set-user-id"
            >
                Set User ID
            </button>
            <button 
                onClick={() => setUserProperties({ plan: 'premium' })}
                data-testid="set-user-properties"
            >
                Set User Properties
            </button>
        </div>
    );
}

describe('AmplitudeContext', () => {
    it('should provide context values', () => {
        render(
            <AmplitudeProvider>
                <TestComponent />
            </AmplitudeProvider>
        );

        expect(screen.getByTestId('track-event')).toBeInTheDocument();
        expect(screen.getByTestId('identify')).toBeInTheDocument();
        expect(screen.getByTestId('set-user-id')).toBeInTheDocument();
        expect(screen.getByTestId('set-user-properties')).toBeInTheDocument();
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