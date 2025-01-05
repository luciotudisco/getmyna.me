'use client';

import * as amplitude from '@amplitude/analytics-browser';
import { useEffect } from 'react';

const API_KEY = 'f1b695fea4cc959d53f5bdc1a031e1ba';

export const initializeAmplitude = () => {
    amplitude.init(API_KEY, undefined, {
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
