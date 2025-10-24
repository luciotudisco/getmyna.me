'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import * as amplitude from '@amplitude/analytics-browser';

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY!;

interface AmplitudeContextType {
    trackEvent: (eventName: string, eventProperties?: Record<string, any>) => void;
    identify: (userId: string, userProperties?: Record<string, any>) => void;
    setUserId: (userId: string) => void;
    setUserProperties: (userProperties: Record<string, any>) => void;
}

const AmplitudeContext = createContext<AmplitudeContextType | undefined>(undefined);

interface AmplitudeProviderProps {
    children: ReactNode;
}

export function AmplitudeProvider({ children }: AmplitudeProviderProps) {
    useEffect(() => {
        if (AMPLITUDE_API_KEY) {
            amplitude.init(AMPLITUDE_API_KEY, { 
                autocapture: true,
                defaultTracking: {
                    pageViews: true,
                    sessions: true,
                    formInteractions: true,
                    fileDownloads: true,
                }
            });
        }
    }, []);

    const trackEvent = (eventName: string, eventProperties?: Record<string, any>) => {
        if (AMPLITUDE_API_KEY) {
            amplitude.track(eventName, eventProperties);
        }
    };

    const identify = (userId: string, userProperties?: Record<string, any>) => {
        if (AMPLITUDE_API_KEY) {
            amplitude.identify(userId, userProperties);
        }
    };

    const setUserId = (userId: string) => {
        if (AMPLITUDE_API_KEY) {
            amplitude.setUserId(userId);
        }
    };

    const setUserProperties = (userProperties: Record<string, any>) => {
        if (AMPLITUDE_API_KEY) {
            amplitude.setUserProperties(userProperties);
        }
    };

    const value: AmplitudeContextType = {
        trackEvent,
        identify,
        setUserId,
        setUserProperties,
    };

    return (
        <AmplitudeContext.Provider value={value}>
            {children}
        </AmplitudeContext.Provider>
    );
}

export function useAmplitude() {
    const context = useContext(AmplitudeContext);
    if (context === undefined) {
        throw new Error('useAmplitude must be used within an AmplitudeProvider');
    }
    return context;
}