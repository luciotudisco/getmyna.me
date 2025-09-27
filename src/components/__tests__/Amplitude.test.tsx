import * as amplitude from '@amplitude/analytics-browser';
import { render } from '@testing-library/react';

import { Amplitude } from '@/components/Amplitude';

// Mock Amplitude
jest.mock('@amplitude/analytics-browser', () => ({
    init: jest.fn(),
}));

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
    });
});
