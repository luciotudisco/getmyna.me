import axios from 'axios';

import { GET } from '@/app/api/cron/tlds/update_pricing/gandi/route';
import { Registrar } from '@/models/tld';
import { tldRepository } from '@/services/tld-repository';

jest.mock('axios');
jest.mock('@/services/tld-repository');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockTldRepository = tldRepository as jest.Mocked<typeof tldRepository>;

const authorizedRequest = () =>
    new Request('http://localhost/api/cron/tlds/update_pricing/gandi', {
        headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    });

describe('/api/cron/tlds/update_pricing/gandi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 when authorization header is missing', async () => {
        const response = await GET(new Request('http://localhost/api/cron/tlds/update_pricing/gandi'));
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('should successfully update TLD pricing from Gandi', async () => {
        const mockGandiResponse = {
            data: [{ name: 'com', href: 'https://api.gandi.net/v5/domain/tlds/com' }],
        };

        const mockTldInfo = { name: 'com', punycodeName: 'com' };
        mockAxios.get.mockResolvedValue(mockGandiResponse);
        mockTldRepository.get.mockResolvedValueOnce(mockTldInfo as any);
        mockTldRepository.update.mockResolvedValue();

        const response = await GET(authorizedRequest());
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({ message: 'TLD pricing enrichment from Gandi completed successfully' });
        expect(mockTldRepository.get).toHaveBeenCalledTimes(1);
        expect(mockTldRepository.get).toHaveBeenCalledWith('com');
        expect(mockTldRepository.update).toHaveBeenCalledTimes(1);
        expect(mockTldRepository.update).toHaveBeenCalledWith('com', { pricing: { [Registrar.GANDI]: {} } });
    });

    it('should throw 500 when request fails', async () => {
        const mockError = new Error('Network error');
        mockAxios.get.mockRejectedValue(mockError);

        const response = await GET(authorizedRequest());
        const responseData = await response.json();

        expect(response.status).toBe(500);
        expect(responseData).toEqual({ error: 'Internal server error' });
    });
});
