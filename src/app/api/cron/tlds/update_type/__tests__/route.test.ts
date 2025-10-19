import axios from 'axios';

import { GET } from '@/app/api/cron/tlds/update_type/route';
import { TLDType } from '@/models/tld';
import { tldRepository } from '@/services/tld-repository';

// Mock cheerio
jest.mock('cheerio', () => ({
    load: jest.fn(),
}));

jest.mock('axios');
jest.mock('@/services/tld-repository');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockTldRepository = tldRepository as jest.Mocked<typeof tldRepository>;

describe('/api/cron/tlds/update_type', () => {
    let mockLoad: jest.MockedFunction<any>;

    beforeEach(async () => {
        jest.clearAllMocks();
        const cheerio = jest.mocked(await import('cheerio'));
        mockLoad = cheerio.load;
    });

    it('should successfully enrich TLDs with type', async () => {
        // Mock TLD data
        const mockTlds = [
            {
                name: 'com',
                punycodeName: 'com',
                type: null,
            },
            {
                name: 'uk',
                punycodeName: 'uk',
                type: null,
            },
        ];

        // Mock repository responses
        mockTldRepository.listTLDs.mockResolvedValue(mockTlds as any);
        mockTldRepository.updateTLD.mockResolvedValue();

        // Mock IANA root database HTML response
        const mockIanaHtml = `
            <table>
                <tr>
                    <td><a href="/domains/root/db/com.html">.com</a></td>
                    <td>generic</td>
                </tr>
                <tr>
                    <td><a href="/domains/root/db/uk.html">.uk</a></td>
                    <td>country-code</td>
                </tr>
            </table>
        `;
        mockAxios.get.mockResolvedValue({ data: mockIanaHtml });

        // Mock cheerio behavior
        const mockCheerioInstance = jest.fn((selector: string) => {
            if (selector.includes('com.html')) {
                return {
                    closest: jest.fn(() => ({
                        find: jest.fn(() => ({
                            text: jest.fn(() => 'generic'),
                        })),
                    })),
                };
            } else if (selector.includes('uk.html')) {
                return {
                    closest: jest.fn(() => ({
                        find: jest.fn(() => ({
                            text: jest.fn(() => 'country-code'),
                        })),
                    })),
                };
            }
            return {
                closest: jest.fn().mockReturnThis(),
                find: jest.fn().mockReturnThis(),
                text: jest.fn(() => ''),
            };
        });

        mockLoad.mockReturnValue(mockCheerioInstance as any);

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({ message: 'TLD enrichment with type completed successfully' });

        expect(mockAxios.get).toHaveBeenCalledWith('https://www.iana.org/domains/root/db');

        expect(mockTldRepository.updateTLD).toHaveBeenCalledTimes(2);
        expect(mockTldRepository.updateTLD).toHaveBeenCalledWith('com', { type: TLDType.GENERIC });
        expect(mockTldRepository.updateTLD).toHaveBeenCalledWith('uk', { type: TLDType.COUNTRY_CODE });
    });

    it('should skip TLDs without punycodeName or name', async () => {
        const mockTlds = [
            {
                name: null,
                punycodeName: 'com',
                type: null,
            },
            {
                name: 'uk',
                punycodeName: null,
                type: null,
            },
        ];

        mockTldRepository.listTLDs.mockResolvedValue(mockTlds as any);
        mockAxios.get.mockResolvedValue({ data: '<table></table>' });

        const mockCheerioInstance = jest.fn(() => ({
            closest: jest.fn().mockReturnThis(),
            find: jest.fn().mockReturnThis(),
            text: jest.fn(() => ''),
        }));

        mockLoad.mockReturnValue(mockCheerioInstance as any);

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({ message: 'TLD enrichment with type completed successfully' });

        // Verify no updates were made
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
