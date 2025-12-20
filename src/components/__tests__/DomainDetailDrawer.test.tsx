import { render, screen, waitFor } from '@testing-library/react';

import DomainDetailDrawer from '@/components/DomainDetailDrawer';
import { Domain, DomainStatus } from '@/models/domain';
import { apiClient } from '@/services/api';

jest.mock('@/services/api', () => ({
    apiClient: {
        getDomainStatus: jest.fn(),
        getDomainTLD: jest.fn(),
        getWhoisInfo: jest.fn(),
    },
}));

const mockGetDomainTLD = apiClient.getDomainTLD as jest.MockedFunction<typeof apiClient.getDomainTLD>;
const mockGetWhoisInfo = apiClient.getWhoisInfo as jest.MockedFunction<typeof apiClient.getWhoisInfo>;

describe('DomainDetailDrawer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetDomainTLD.mockResolvedValue({});
        mockGetWhoisInfo.mockResolvedValue({} as never);
    });

    it('should show a Share button when the domain is available', async () => {
        const domain = new Domain('bücher.com');
        domain.setStatus(DomainStatus.INACTIVE);

        render(<DomainDetailDrawer domain={domain} open={true} onClose={jest.fn()} />);

        const shareLink = await screen.findByRole('link', { name: /share/i });
        expect(shareLink).toHaveAttribute('href', `/domain/${encodeURIComponent(domain.getName())}`);
    });

    it('should not show a Share button when the domain is not available', async () => {
        const domain = new Domain('example.com');
        domain.setStatus(DomainStatus.ACTIVE);

        render(<DomainDetailDrawer domain={domain} open={true} onClose={jest.fn()} />);

        await waitFor(() => expect(mockGetDomainTLD).toHaveBeenCalled());
        expect(screen.queryByRole('link', { name: /share/i })).not.toBeInTheDocument();
    });
});
