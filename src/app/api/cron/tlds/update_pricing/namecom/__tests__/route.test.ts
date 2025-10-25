import axios from 'axios';

import { GET } from '@/app/api/cron/tlds/update_pricing/namecom/route';
import { Registrar, TLDPricing } from '@/models/tld';
import { tldRepository } from '@/services/tld-repository';

jest.mock('axios');
jest.mock('@/services/tld-repository');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockTldRepository = tldRepository as jest.Mocked<typeof tldRepository>;

describe('/api/cron/tlds/update_pricing/namecom', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully update TLD pricing from Name.com', async () => {
        const mockNameComResponse = {
            data: {
                nextPage: null,
                pricing: [
                    {
                        tld: 'com',
                        registrationPrice: '12.95',
                        renewalPrice: '12.95',
                    },
                ],
            },
        };

        const mockComTldInfo = { name: 'com', punycodeName: 'com' };
        mockAxios.get.mockResolvedValue(mockNameComResponse);
        mockTldRepository.get.mockResolvedValueOnce(mockComTldInfo as any);
        mockTldRepository.update.mockResolvedValue();

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({ message: 'TLD pricing enrichment from Name.com completed successfully' });

        expect(mockTldRepository.get).toHaveBeenCalledTimes(1);
        expect(mockTldRepository.get).toHaveBeenCalledWith('com');
        expect(mockTldRepository.update).toHaveBeenCalledTimes(1);
        const pricing: TLDPricing = { registration: 12.95, renewal: 12.95, currency: 'USD' };
        expect(mockTldRepository.update).toHaveBeenCalledWith('com', { pricing: { [Registrar.NAMECOM]: pricing } });
    });

    it('should throw 500 when request fails', async () => {
        const mockError = new Error('Network error');
        mockAxios.get.mockRejectedValue(mockError);

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(500);
        expect(responseData).toEqual({ error: 'Internal server error' });
    });
});
