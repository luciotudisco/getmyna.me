'use client';

import * as amplitude from '@amplitude/analytics-browser';
import { useEffect } from 'react';

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY!;

export const Amplitude = () => {
    useEffect(() => {
        amplitude.init(AMPLITUDE_API_KEY, { autocapture: true });
    }, []);

    return null;
};
