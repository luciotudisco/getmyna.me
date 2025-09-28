import axios from 'axios';

import { GET } from '@/app/api/domains/[name]/status/route';
import { DomainStatus } from '@/models/domain';

jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('/api/domains/[name]/status', () => {
    const mockDomain = 'example.com';
    const mockCtx = { params: Promise.resolve({ name: mockDomain }) };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET', () => {
        it('should extract last word from status string', async () => {
            const mockApiResponse = { data: { status: [{ status: 'undelegated inactive' }] } };

            mockAxios.get.mockResolvedValue(mockApiResponse);

            const request = new Request('https://example.com/api/domains/example.com/status');
            const response = await GET(request, mockCtx);
            const responseData = await response.json();

            expect(response.status).toBe(200);
            expect(responseData).toEqual({ status: DomainStatus.inactive });
        });

        it('should return error status when status array is empty', async () => {
            const mockApiResponse = { data: { status: [] } };

            mockAxios.get.mockResolvedValue(mockApiResponse);

            const request = new Request('https://example.com/api/domains/example.com/status');
            const response = await GET(request, mockCtx);
            const responseData = await response.json();

            expect(response.status).toBe(200);
            expect(responseData).toEqual({ status: DomainStatus.error });
        });

        it('should return 500 when axios request fails', async () => {
            const mockError = new Error('Network error');
            mockAxios.get.mockRejectedValue(mockError);

            const request = new Request('https://example.com/api/domains/example.com/status');
            const response = await GET(request, mockCtx);
            const responseData = await response.json();

            expect(response.status).toBe(500);
            expect(responseData).toEqual({ error: 'Internal server error' });
        });
    });
});
