import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';

import DomainPage from '@/app/domains/[slug]/page';
import { DomainStatus } from '@/models/domain';
import { Registrar, TLD } from '@/models/tld';
import { WhoisInfo } from '@/models/whois';
import { apiClient } from '@/services/api';

jest.mock('@/services/api', () => ({
    apiClient: {
        getDomainStatus: jest.fn(),
        getDomainTLD: jest.fn(),
        getWhoisInfo: jest.fn(),
    },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const createMockParams = (slug: string): Promise<{ slug: string }> => Promise.resolve({ slug });

describe('DomainPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockTLD: TLD = {
        name: 'com',
        punycodeName: 'com',
        description: 'Commercial organizations',
        pricing: { [Registrar.PORKBUN]: { registration: 12.99, currency: 'USD' } },
    };

    const mockWhoisInfo: WhoisInfo = {
        creationDate: '2020-01-01',
        expirationDate: '2025-01-01',
        registrar: 'Example Registrar',
    };

    it('should render domain page with correct title badge', async () => {
        mockApiClient.getDomainStatus.mockResolvedValue(DomainStatus.INACTIVE);
        mockApiClient.getDomainTLD.mockResolvedValue(mockTLD);
        mockApiClient.getWhoisInfo.mockResolvedValue(mockWhoisInfo);

        await act(async () => {
            render(<DomainPage params={createMockParams('example.com')} />);
        });

        await waitFor(() => {
            expect(screen.getByText('DOMAIN')).toBeInTheDocument();
            expect(screen.getByText('example.com')).toBeInTheDocument();
        });
    });

    it('should display domain status badge', async () => {
        mockApiClient.getDomainStatus.mockResolvedValue(DomainStatus.INACTIVE);
        mockApiClient.getDomainTLD.mockResolvedValue(mockTLD);

        await act(async () => {
            render(<DomainPage params={createMockParams('example.com')} />);
        });

        await waitFor(() => {
            expect(screen.getByText('Available')).toBeInTheDocument();
        });
    });

    it('should display registrar buttons for available domains', async () => {
        mockApiClient.getDomainStatus.mockResolvedValue(DomainStatus.INACTIVE);
        mockApiClient.getDomainTLD.mockResolvedValue(mockTLD);

        await act(async () => {
            render(<DomainPage params={createMockParams('example.com')} />);
        });

        await waitFor(() => {
            expect(screen.getByText('Porkbun')).toBeInTheDocument();
            expect(screen.getByText('$12.99')).toBeInTheDocument();
        });
    });

    it('should display WHOIS section for unavailable domains with creation date', async () => {
        mockApiClient.getDomainStatus.mockResolvedValue(DomainStatus.ACTIVE);
        mockApiClient.getDomainTLD.mockResolvedValue(mockTLD);
        mockApiClient.getWhoisInfo.mockResolvedValue(mockWhoisInfo);

        await act(async () => {
            render(<DomainPage params={createMockParams('example.com')} />);
        });

        await waitFor(() => {
            expect(screen.getByTestId('domain-whois-section')).toBeInTheDocument();
            expect(screen.getByText(/Created:/)).toBeInTheDocument();
            expect(screen.getByText(/January 1st, 2020/)).toBeInTheDocument();
            expect(screen.getByText(/Registrar:/)).toBeInTheDocument();
            expect(screen.getByText('Example Registrar')).toBeInTheDocument();
        });
    });

    it('should display TLD section when TLD info is available', async () => {
        mockApiClient.getDomainStatus.mockResolvedValue(DomainStatus.INACTIVE);
        mockApiClient.getDomainTLD.mockResolvedValue(mockTLD);

        await act(async () => {
            render(<DomainPage params={createMockParams('example.com')} />);
        });

        await waitFor(() => {
            expect(screen.getByTestId('tld-section')).toBeInTheDocument();
            expect(screen.getByText('Top Level Domain')).toBeInTheDocument();
            expect(screen.getByText('.com')).toBeInTheDocument();
        });
    });

    it('should show error message when API call fails', async () => {
        mockApiClient.getDomainStatus.mockRejectedValue(new Error('API Error'));

        await act(async () => {
            render(<DomainPage params={createMockParams('example.com')} />);
        });

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
        });
    });
});
