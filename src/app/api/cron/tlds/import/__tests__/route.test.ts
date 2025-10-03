import axios from 'axios';

import { GET } from '@/app/api/cron/tlds/import/route';
import { tldRepository } from '@/services/tld-repository';
import { getTextDirection, TextDirection } from '@/utils/unicode';

jest.mock('axios');
jest.mock('@/services/tld-repository');
jest.mock('@/utils/unicode');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockTldRepository = tldRepository as jest.Mocked<typeof tldRepository>;
const mockGetTextDirection = getTextDirection as jest.MockedFunction<typeof getTextDirection>;

describe('/api/cron/tlds/import', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET', () => {
        it('should successfully import TLDs from IANA', async () => {
            const mockTldData = ['# This is a comment', 'com', 'io'].join('\n');

            const mockApiResponse = { data: mockTldData };

            mockAxios.get.mockResolvedValue(mockApiResponse);
            mockTldRepository.getTLD.mockResolvedValue(null); // TLD doesn't exist
            mockGetTextDirection.mockReturnValue(TextDirection.LTR);

            const response = await GET();
            const responseData = await response.json();

            expect(response.status).toBe(200);
            expect(responseData).toEqual({ message: 'TLD import completed successfully' });

            // Verify API call
            expect(mockAxios.get).toHaveBeenCalledWith('https://data.iana.org/TLD/tlds-alpha-by-domain.txt');

            // Verify TLD processing
            expect(mockTldRepository.getTLD).toHaveBeenCalledTimes(2); // 2 TLDs after filtering
            expect(mockTldRepository.createTld).toHaveBeenCalledTimes(2);

            // Verify specific TLD calls
            expect(mockTldRepository.getTLD).toHaveBeenCalledWith('com');
            expect(mockTldRepository.getTLD).toHaveBeenCalledWith('io');

            // Verify createTld calls
            const comTLD = { name: 'com', punycodeName: 'com', direction: TextDirection.LTR };
            const ioTLD = { name: 'io', punycodeName: 'io', direction: TextDirection.LTR };
            expect(mockTldRepository.createTld).toHaveBeenCalledWith(comTLD);
            expect(mockTldRepository.createTld).toHaveBeenCalledWith(ioTLD);
        });

        it('should handle Unicode TLDs correctly', async () => {
            const mockTldData = 'xn--bcher-kva';

            const mockApiResponse = { data: mockTldData };
            mockAxios.get.mockResolvedValue(mockApiResponse);
            mockTldRepository.getTLD.mockResolvedValue(null);
            mockGetTextDirection.mockReturnValue(TextDirection.RTL);

            const response = await GET();
            const responseData = await response.json();

            expect(response.status).toBe(200);
            expect(responseData).toEqual({ message: 'TLD import completed successfully' });

            // Verify specific TLD calls
            expect(mockTldRepository.getTLD).toHaveBeenCalledWith('xn--bcher-kva');

            // Verify createTld calls
            const bcherKvaTLD = { name: 'bücher', punycodeName: 'xn--bcher-kva', direction: TextDirection.RTL };
            expect(mockTldRepository.createTld).toHaveBeenCalledWith(bcherKvaTLD);
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
});
