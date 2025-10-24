import * as amplitude from '@amplitude/analytics-browser';
import { render } from '@testing-library/react';

import { Amplitude } from '@/components/Amplitude';

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

describe('Amplitude', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render without visible output', () => {
        const { container } = render(<Amplitude />);
        expect(container.firstChild).toBeNull();
    });

    it('should initialize Amplitude on mount', () => {
        const mockedAmplitude = jest.mocked(amplitude);

        render(<Amplitude />);

        expect(mockedAmplitude.init).toHaveBeenCalledTimes(1);
        expect(mockedAmplitude.init).toHaveBeenCalledWith('test-api-key', {
            autocapture: true,
            defaultTracking: {
                pageViews: true,
                sessions: true,
                formInteractions: true,
                fileDownloads: true,
            }
        });
    });
});
