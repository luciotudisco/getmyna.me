'use client';

import { useEffect } from 'react';
import * as amplitude from '@amplitude/analytics-browser';

export const Amplitude = () => {
    const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

    useEffect(() => {
        if (!AMPLITUDE_API_KEY) {
            console.error('NEXT_PUBLIC_AMPLITUDE_API_KEY environment variable is not set');
            return;
        }
        amplitude.init(AMPLITUDE_API_KEY, { autocapture: true });
    }, [AMPLITUDE_API_KEY]);

    return null;
};
