import axios from 'axios';

import { GET } from '@/app/api/cron/tlds/update_type/route';
import { TLDType } from '@/models/tld';
import { tldRepository } from '@/services/tld-repository';

jest.mock('axios');
jest.mock('cheerio', () => ({ load: jest.fn().mockReturnValue({ text: jest.fn() }) }));
jest.mock('@/services/tld-repository');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockTldRepository = tldRepository as jest.Mocked<typeof tldRepository>;

describe('/api/cron/tlds/update_type', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully enrich TLDs with type and organization', async () => {
        // Mock TLD data
        const mockTlds = [
            {
                name: 'com',
                punycodeName: 'com',
                type: null,
            },
        ];

        // Mock repository responses
        mockTldRepository.listTLDs.mockResolvedValue(mockTlds as any);
        mockTldRepository.updateTLD.mockResolvedValue();

        // Mock IANA root database HTML response
        const mockIanaResponse = { data: '<html><body>IANA content for .com</body></html>' };
        mockAxios.get.mockResolvedValue(mockIanaResponse);

        // Mock cheerio behavior
        const mockCheerioInstance = jest.fn((selector: string) => {
            if (selector.includes('com.html')) {
                return {
                    closest: jest.fn(() => ({
                        find: jest.fn((cellSelector: string) => {
                            if (cellSelector === 'td:nth-child(2)') {
                                return { text: jest.fn(() => 'generic') };
                            }
                            if (cellSelector === 'td:nth-child(3)') {
                                return { text: jest.fn(() => 'VeriSign, Inc.') };
                            }
                            return { text: jest.fn(() => '') };
                        }),
                    })),
                };
            }
            return {
                closest: jest.fn().mockReturnThis(),
                find: jest.fn().mockReturnThis(),
                text: jest.fn(() => ''),
            };
        });

        const cheerio = jest.mocked(await import('cheerio'));
        cheerio.load.mockReturnValue(mockCheerioInstance as any);

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({ message: 'TLD enrichment with type and organization completed successfully' });

        // Verify repository calls
        expect(mockTldRepository.listTLDs).toHaveBeenCalledTimes(1);
        expect(mockTldRepository.updateTLD).toHaveBeenCalledTimes(1);

        // Verify axios call
        expect(mockAxios.get).toHaveBeenCalledWith('https://www.iana.org/domains/root/db');

        // Verify updateTLD was called with correct type and organization
        expect(mockTldRepository.updateTLD).toHaveBeenCalledWith('com', {
            type: TLDType.GENERIC,
            organization: 'VeriSign, Inc.',
        });
    });

    it('should skip TLDs without punycodeName or name', async () => {
        const mockTlds = [
            {
                name: null,
                punycodeName: 'com',
                type: null,
            },
        ];

        mockTldRepository.listTLDs.mockResolvedValue(mockTlds as any);
        mockAxios.get.mockResolvedValue({ data: '<table></table>' });

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({ message: 'TLD enrichment with type and organization completed successfully' });

        // Verify axios call was made but no updates
        expect(mockAxios.get).toHaveBeenCalledWith('https://www.iana.org/domains/root/db');
        expect(mockTldRepository.updateTLD).not.toHaveBeenCalled();
    });

    it('should return 500 when request fails', async () => {
        const mockTlds = [
            {
                name: 'com',
                punycodeName: 'com',
                type: null,
            },
        ];

        mockTldRepository.listTLDs.mockResolvedValue(mockTlds as any);
        mockAxios.get.mockRejectedValue(new Error('Network error'));

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(500);
        expect(responseData).toEqual({ error: 'Internal server error' });
    });
});
