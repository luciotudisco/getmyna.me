import axios from 'axios';

import { GET } from '@/app/api/cron/tlds/import/route';
import { tldRepository } from '@/services/tld-repository';

jest.mock('axios');
jest.mock('@/services/tld-repository');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockTldRepository = tldRepository as jest.Mocked<typeof tldRepository>;

describe('/api/cron/tlds/import', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully import TLDs from IANA', async () => {
        const mockTldData = ['# This is a comment', 'com', 'io'].join('\n');

        const mockApiResponse = { data: mockTldData };

        mockAxios.get.mockResolvedValue(mockApiResponse);
        mockTldRepository.get.mockResolvedValue(null); // TLD doesn't exist

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({ message: 'TLD import completed successfully' });

        // Verify API call
        expect(mockAxios.get).toHaveBeenCalledWith('https://data.iana.org/TLD/tlds-alpha-by-domain.txt');

        // Verify TLD processing
        expect(mockTldRepository.get).toHaveBeenCalledTimes(2); // 2 TLDs after filtering
        expect(mockTldRepository.create).toHaveBeenCalledTimes(2);

        // Verify specific TLD calls
        expect(mockTldRepository.get).toHaveBeenCalledWith('com');
        expect(mockTldRepository.get).toHaveBeenCalledWith('io');

        // Verify createTld calls
        const comTLD = { name: 'com', punycodeName: 'com' };
        const ioTLD = { name: 'io', punycodeName: 'io' };
        expect(mockTldRepository.create).toHaveBeenCalledWith(comTLD);
        expect(mockTldRepository.create).toHaveBeenCalledWith(ioTLD);
    });

    it('should handle Unicode TLDs correctly', async () => {
        const mockTldData = 'xn--bcher-kva';

        const mockApiResponse = { data: mockTldData };
        mockAxios.get.mockResolvedValue(mockApiResponse);
        mockTldRepository.get.mockResolvedValue(null);

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({ message: 'TLD import completed successfully' });

        // Verify specific TLD calls
        expect(mockTldRepository.get).toHaveBeenCalledWith('xn--bcher-kva');

        // Verify createTld calls
        const bcherKvaTLD = { name: 'bücher', punycodeName: 'xn--bcher-kva' };
        expect(mockTldRepository.create).toHaveBeenCalledWith(bcherKvaTLD);
    });

    it('should return 500 when axios request fails', async () => {
        const mockError = new Error('Network error');
        mockAxios.get.mockRejectedValue(mockError);

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(500);
        expect(responseData).toEqual({ error: 'Internal server error' });
    });
});
