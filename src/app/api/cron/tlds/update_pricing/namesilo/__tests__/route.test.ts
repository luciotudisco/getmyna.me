import axios from 'axios';

import { GET } from '@/app/api/cron/tlds/update_pricing/namesilo/route';
import { Registrar, TLDPricing } from '@/models/tld';
import { tldRepository } from '@/services/tld-repository';

jest.mock('axios');
jest.mock('@/services/tld-repository');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockTldRepository = tldRepository as jest.Mocked<typeof tldRepository>;

const authorizedRequest = () =>
    new Request('http://localhost/api/cron/tlds/update_pricing/namesilo', {
        headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    });

describe('/api/cron/tlds/update_pricing/namesilo', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 when authorization header is missing', async () => {
        const response = await GET(new Request('http://localhost/api/cron/tlds/update_pricing/namesilo'));
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('should successfully update TLD pricing from Namesilo', async () => {
        const mockNamesiloResponse = {
            data: {
                reply: {
                    com: {
                        registration: '12.95',
                        renew: '12.95',
                    },
                },
            },
        };

        const mockComTldInfo = { name: 'com', punycodeName: 'com' };
        mockAxios.get.mockResolvedValue(mockNamesiloResponse);
        mockTldRepository.get.mockResolvedValueOnce(mockComTldInfo as any);
        mockTldRepository.update.mockResolvedValue();

        const response = await GET(authorizedRequest());
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({ message: 'TLD pricing enrichment from Namesilo completed successfully' });

        expect(mockTldRepository.get).toHaveBeenCalledTimes(1);
        expect(mockTldRepository.get).toHaveBeenCalledWith('com');
        expect(mockTldRepository.update).toHaveBeenCalledTimes(1);
        const pricing: TLDPricing = { registration: 12.95, renewal: 12.95, currency: 'USD' };
        expect(mockTldRepository.update).toHaveBeenCalledWith('com', { pricing: { [Registrar.NAMESILO]: pricing } });
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
