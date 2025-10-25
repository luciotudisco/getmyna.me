import axios from 'axios';
import OpenAI from 'openai';

import { GET } from '@/app/api/cron/tlds/update_description/route';
import { tldRepository } from '@/services/tld-repository';

jest.mock('axios');
jest.mock('cheerio', () => ({ load: jest.fn().mockReturnValue({ text: jest.fn() }) }));
jest.mock('openai');
jest.mock('@/services/tld-repository');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockTldRepository = tldRepository as jest.Mocked<typeof tldRepository>;
const mockOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;

describe('/api/cron/tlds/update_description', () => {
    const mockOpenAIClient = {
        chat: {
            completions: {
                create: jest.fn(),
            },
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockOpenAI.mockImplementation(() => mockOpenAIClient as any);
    });

    it('should successfully enrich TLDs with description', async () => {
        // Mock TLD data
        const mockTlds = [
            {
                name: 'com',
                punycodeName: 'com',
                description: null,
                tagline: null,
                yearEstablished: null,
            },
        ];

        // Mock repository responses
        mockTldRepository.list.mockResolvedValue(mockTlds as any);
        mockTldRepository.update.mockResolvedValue();

        // Mock axios responses for ICANN and IANA
        const mockIcannResponse = { data: '<html><body>ICANN content for .com</body></html>' };
        const mockIanaResponse = { data: '<html><body>IANA content for .com</body></html>' };

        mockAxios.get.mockResolvedValueOnce(mockIcannResponse);
        mockAxios.get.mockResolvedValueOnce(mockIanaResponse);

        // Mock OpenAI response
        const mockAIResponse = {
            choices: [
                {
                    message: {
                        content: JSON.stringify({
                            description: 'Generic top-level domain for commercial use',
                            tagline: 'The original domain for commerce',
                            year_established: 1985,
                        }),
                    },
                },
            ],
        };
        mockOpenAIClient.chat.completions.create.mockResolvedValue(mockAIResponse);

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({ message: 'TLD enrichment with description completed successfully' });

        // Verify repository calls
        expect(mockTldRepository.list).toHaveBeenCalledTimes(1);
        expect(mockTldRepository.update).toHaveBeenCalledTimes(1);

        // Verify axios calls for both TLDs
        expect(mockAxios.get).toHaveBeenCalledWith('https://icannwiki.org/.com');
        expect(mockAxios.get).toHaveBeenCalledWith('https://www.iana.org/domains/root/db/com.html');

        // Verify OpenAI calls
        expect(mockOpenAIClient.chat.completions.create).toHaveBeenCalledTimes(1);

        // Verify updateTLD calls with tagline
        expect(mockTldRepository.update).toHaveBeenCalledWith('com', {
            description: 'Generic top-level domain for commercial use',
            tagline: 'The original domain for commerce',
            yearEstablished: 1985,
        });
    });

    it('should skip TLDs that already have descriptions', async () => {
        const mockTlds = [
            {
                name: 'com',
                punycodeName: 'com',
                description: 'Already has description',
                tagline: 'Already has tagline',
                yearEstablished: 1985,
            },
        ];

        mockTldRepository.list.mockResolvedValue(mockTlds as any);

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData).toEqual({ message: 'TLD enrichment with description completed successfully' });

        // Verify no API calls were made
        expect(mockAxios.get).not.toHaveBeenCalled();
        expect(mockOpenAIClient.chat.completions.create).not.toHaveBeenCalled();
        expect(mockTldRepository.update).not.toHaveBeenCalled();
    });

    it('should throw 500 when request fails', async () => {
        const mockTlds = [
            {
                name: 'com',
                punycodeName: 'com',
                description: null,
                tagline: null,
                yearEstablished: null,
            },
        ];

        mockTldRepository.list.mockResolvedValue(mockTlds as any);
        mockAxios.get.mockRejectedValue(new Error('Network error'));

        const response = await GET();
        const responseData = await response.json();

        expect(response.status).toBe(500);
        expect(responseData).toEqual({ error: 'Internal server error' });
    });
});
