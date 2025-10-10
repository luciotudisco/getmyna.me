import '@testing-library/jest-dom';

// Set up environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.RAPID_API_KEY = 'test-rapid-api-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

// Mock Web APIs for Next.js server environment
global.Request =
    global.Request ||
    class MockRequest {
        constructor(input: any, init?: any) {
            this.url = typeof input === 'string' ? input : input.url;
            this.method = init?.method || 'GET';
            this.headers = new Map(Object.entries(init?.headers || {}));
        }
        url: string;
        method: string;
        headers: Map<string, string>;
    };

global.Response =
    global.Response ||
    class MockResponse {
        constructor(body?: any, init?: any) {
            this.status = init?.status || 200;
            this.statusText = init?.statusText || 'OK';
            this.headers = new Map(Object.entries(init?.headers || {}));
            this.body = body;
        }
        status: number;
        statusText: string;
        headers: Map<string, string>;
        body: any;

        async json() {
            return this.body;
        }

        static json(data: any, init?: any) {
            return new MockResponse(data, init);
        }
    };

// Mock IntersectionObserver for framer-motion
global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
        return [];
    }
    unobserve() {}
} as any;

// Mock ResizeObserver for UI components
global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
} as any;
