'use client';

import { createContext, ReactNode, useContext, useEffect } from 'react';
import * as amplitude from '@amplitude/analytics-browser';

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY!;

interface AmplitudeContextType {
    trackEvent: (eventName: string, eventProperties?: Record<string, string>) => void;
}

const AmplitudeContext = createContext<AmplitudeContextType | undefined>(undefined);

interface AmplitudeProviderProps {
    children: ReactNode;
}

export function AmplitudeProvider({ children }: AmplitudeProviderProps) {
    useEffect(() => {
        amplitude.init(AMPLITUDE_API_KEY, {
            autocapture: true,
            defaultTracking: {
                pageViews: true,
                sessions: true,
                formInteractions: true,
                fileDownloads: true,
            },
        });
    }, []);

    const trackEvent = (eventName: string, eventProperties?: Record<string, string>) => {
        amplitude.track(eventName, eventProperties);
    };

    return <AmplitudeContext.Provider value={{ trackEvent }}>{children}</AmplitudeContext.Provider>;
}

export function useAmplitude() {
    const context = useContext(AmplitudeContext);
    if (context === undefined) {
        throw new Error('useAmplitude must be used within an AmplitudeProvider');
    }
    return context;
}
