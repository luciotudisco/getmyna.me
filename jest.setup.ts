import '@testing-library/jest-dom';

// Mock environment variables for Supabase
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock-supabase-url.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn(() => ({
                        data: null,
                        error: { code: 'PGRST116', message: 'No rows returned' },
                    })),
                })),
                order: jest.fn(() => ({
                    limit: jest.fn(() => ({
                        data: [
                            { name: 'es', punycode_name: 'es', type: 'generic', description: 'Spain', pricing: null },
                            {
                                name: 'io',
                                punycode_name: 'io',
                                type: 'generic',
                                description: 'British Indian Ocean Territory',
                                pricing: null,
                            },
                            {
                                name: 'ing',
                                punycode_name: 'ing',
                                type: 'generic',
                                description: 'Google',
                                pricing: null,
                            },
                            {
                                name: 'ng',
                                punycode_name: 'ng',
                                type: 'country-code',
                                description: 'Nigeria',
                                pricing: null,
                            },
                            {
                                name: 'man',
                                punycode_name: 'man',
                                type: 'generic',
                                description: 'Manchester',
                                pricing: null,
                            },
                            {
                                name: 'gle',
                                punycode_name: 'gle',
                                type: 'generic',
                                description: 'Google',
                                pricing: null,
                            },
                            {
                                name: 'co',
                                punycode_name: 'co',
                                type: 'country-code',
                                description: 'Colombia',
                                pricing: null,
                            },
                        ],
                        error: null,
                    })),
                })),
            })),
            upsert: jest.fn(() => ({ error: null })),
            update: jest.fn(() => ({
                eq: jest.fn(() => ({ error: null })),
            })),
        })),
    })),
}));
