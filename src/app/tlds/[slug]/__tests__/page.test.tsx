import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';

import TLDPage from '@/app/tlds/[slug]/page';
import { Registrar, TLD, TLDType } from '@/models/tld';
import { apiClient } from '@/services/api';

// Mock the TLDDictionary component
jest.mock('@/components/TLDDictionary', () => {
    return function MockTLDDictionary({ tld }: { tld: string }) {
        return <div data-testid="tld-dictionary">TLD Dictionary for {tld}</div>;
    };
});

// Mock the API client
jest.mock('@/services/api', () => ({
    apiClient: {
        getTLD: jest.fn(),
    },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Helper to create a mock params promise
const createMockParams = (slug: string): Promise<{ slug: string }> => Promise.resolve({ slug });

describe('TLDPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockTLD: TLD = {
        name: 'com',
        punycodeName: 'com',
        description: 'Commercial organizations',
        organization: 'VeriSign',
        type: TLDType.GENERIC,
        tagline: 'The most popular TLD',
        yearEstablished: 1985,
    };

    it('should render TLD page with correct title, badge and tag line', async () => {
        mockApiClient.getTLD.mockResolvedValue(mockTLD);

        await act(async () => {
            render(<TLDPage params={createMockParams('com')} />);
        });

        await waitFor(
            () => {
                expect(screen.getByText('TLD')).toBeInTheDocument();
                expect(screen.getByText('.com')).toBeInTheDocument();
                expect(screen.getByText('The most popular TLD')).toBeInTheDocument();
            },
            { timeout: 3000 },
        );
    });

    it('should display year established', async () => {
        mockApiClient.getTLD.mockResolvedValue(mockTLD);

        await act(async () => {
            render(<TLDPage params={createMockParams('com')} />);
        });

        await waitFor(
            () => {
                expect(screen.getByText('Introduced')).toBeInTheDocument();
                expect(screen.getByText('1985')).toBeInTheDocument();
            },
            { timeout: 3000 },
        );
    });

    it('should display TLD type', async () => {
        mockApiClient.getTLD.mockResolvedValue(mockTLD);

        await act(async () => {
            render(<TLDPage params={createMockParams('com')} />);
        });

        await waitFor(
            () => {
                expect(screen.getByText('Type')).toBeInTheDocument();
                expect(screen.getByText('Generic')).toBeInTheDocument();
            },
            { timeout: 3000 },
        );
    });

    it('should display organization', async () => {
        mockApiClient.getTLD.mockResolvedValue(mockTLD);

        await act(async () => {
            render(<TLDPage params={createMockParams('com')} />);
        });

        await waitFor(
            () => {
                expect(screen.getByText('Organization')).toBeInTheDocument();
                expect(screen.getByText('VeriSign')).toBeInTheDocument();
            },
            { timeout: 3000 },
        );
    });

    it('should display IANA link', async () => {
        mockApiClient.getTLD.mockResolvedValue(mockTLD);

        await act(async () => {
            render(<TLDPage params={createMockParams('com')} />);
        });

        await waitFor(
            () => {
                expect(screen.getByText('More information')).toBeInTheDocument();
                const ianaLink = screen.getByText('IANA Delegation Details');
                expect(ianaLink).toBeInTheDocument();
                expect(ianaLink.closest('a')).toHaveAttribute('href', 'https://www.iana.org/domains/root/db/com.html');
                expect(ianaLink.closest('a')).toHaveAttribute('target', '_blank');
                expect(ianaLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
            },
            { timeout: 3000 },
        );
    });

    it('should display description when available', async () => {
        mockApiClient.getTLD.mockResolvedValue(mockTLD);

        await act(async () => {
            render(<TLDPage params={createMockParams('com')} />);
        });

        await waitFor(
            () => {
                expect(screen.getByText('About')).toBeInTheDocument();
                expect(screen.getByText('Commercial organizations')).toBeInTheDocument();
            },
            { timeout: 3000 },
        );
    });

    it('should render TLDDictionary component with TLD name', async () => {
        mockApiClient.getTLD.mockResolvedValue(mockTLD);

        await act(async () => {
            render(<TLDPage params={createMockParams('com')} />);
        });

        await waitFor(
            () => {
                expect(screen.getByTestId('tld-dictionary')).toBeInTheDocument();
                expect(screen.getByText('TLD Dictionary for com')).toBeInTheDocument();
            },
            { timeout: 3000 },
        );
    });

    it('should render pricing section', async () => {
        const tldWithPricing: TLD = {
            ...mockTLD,
            pricing: {
                [Registrar.NAMECOM]: {
                    registration: 12.99,
                    renewal: 14.99,
                    currency: 'USD',
                },
            },
        };
        mockApiClient.getTLD.mockResolvedValue(tldWithPricing);

        await act(async () => {
            render(<TLDPage params={createMockParams('com')} />);
        });

        await waitFor(
            () => {
                expect(screen.getByText('Pricing')).toBeInTheDocument();
                expect(screen.getByText('Name.com')).toBeInTheDocument();
                expect(screen.getByText('USD')).toBeInTheDocument();
                expect(screen.getByText('12.99')).toBeInTheDocument();
                expect(screen.getByText('14.99')).toBeInTheDocument();
                expect(screen.getByText('Registration')).toBeInTheDocument();
                expect(screen.getByText('Renewal')).toBeInTheDocument();
            },
            { timeout: 3000 },
        );
    });
});
