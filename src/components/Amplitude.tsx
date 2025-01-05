'use client';

import * as amplitude from '@amplitude/analytics-browser';
import { useEffect } from 'react';

export const initializeAmplitude = () => {
    amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY!, undefined, {
        defaultTracking: {
            sessions: true,
            pageViews: true,
            formInteractions: true,
        },
    });

    return amplitude;
};

export const Amplitude = () => {
    useEffect(() => {
        initializeAmplitude();
    }, []);

    return null;
};
