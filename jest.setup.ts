import '@testing-library/jest-dom';

// Mock the TLD repository
jest.mock('@/services/tld-repository', () => ({
    tldRepository: {
        async listTLDs() {
            return [
                { name: 'com', punycodeName: 'com', type: 'gTLD', description: 'Commercial', pricing: null },
                { name: 'org', punycodeName: 'org', type: 'gTLD', description: 'Organization', pricing: null },
                { name: 'net', punycodeName: 'net', type: 'gTLD', description: 'Network', pricing: null },
                {
                    name: 'io',
                    punycodeName: 'io',
                    type: 'ccTLD',
                    description: 'British Indian Ocean Territory',
                    pricing: null,
                },
                { name: 'co', punycodeName: 'co', type: 'ccTLD', description: 'Colombia', pricing: null },
                { name: 'es', punycodeName: 'es', type: 'ccTLD', description: 'Spain', pricing: null },
                { name: 'ing', punycodeName: 'ing', type: 'gTLD', description: 'ING Group', pricing: null },
                { name: 'ng', punycodeName: 'ng', type: 'ccTLD', description: 'Nigeria', pricing: null },
                { name: 'man', punycodeName: 'man', type: 'gTLD', description: 'Manchester', pricing: null },
                { name: 'gle', punycodeName: 'gle', type: 'gTLD', description: 'Google', pricing: null },
            ];
        },
        async getTLD(name: string) {
            const tlds = await this.listTLDs();
            return tlds.find((t) => t.name === name) || null;
        },
        async createTld() {},
        async updateTLD() {},
    },
}));
