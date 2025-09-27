// Mock Next.js environment
global.Request = global.Request || class MockRequest {};
global.Response = global.Response || class MockResponse {};

// Mock the dependencies before importing
jest.mock('@/services/tld-repository', () => ({
    tldRepository: {
        countTLDs: jest.fn(),
    },
}));

jest.mock('@/utils/logger', () => ({
    error: jest.fn(),
}));

import { NextResponse } from 'next/server';

import { GET } from '../route';
import { tldRepository } from '@/services/tld-repository';
import logger from '@/utils/logger';

const mockTldRepository = tldRepository as jest.Mocked<typeof tldRepository>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('/api/tlds/count', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET', () => {
        it('should return TLD count when repository succeeds', async () => {
            const mockCount = 1500;
            mockTldRepository.countTLDs.mockResolvedValue(mockCount);

            const response = await GET();
            const responseData = await response.json();

            expect(response.status).toBe(200);
            expect(responseData).toEqual({ count: mockCount });
            expect(mockTldRepository.countTLDs).toHaveBeenCalledTimes(1);
        });

        it('should return 500 error when repository throws', async () => {
            const mockError = new Error('Database connection failed');
            mockTldRepository.countTLDs.mockRejectedValue(mockError);

            const response = await GET();
            const responseData = await response.json();

            expect(response.status).toBe(500);
            expect(responseData).toEqual({ error: 'Failed to count TLDs' });
            expect(mockLogger.error).toHaveBeenCalledWith(
                { error: mockError },
                'Error counting TLDs'
            );
        });

        it('should handle repository returning zero count', async () => {
            const mockCount = 0;
            mockTldRepository.countTLDs.mockResolvedValue(mockCount);

            const response = await GET();
            const responseData = await response.json();

            expect(response.status).toBe(200);
            expect(responseData).toEqual({ count: 0 });
            expect(mockTldRepository.countTLDs).toHaveBeenCalledTimes(1);
        });

        it('should handle large count values', async () => {
            const mockCount = 999999;
            mockTldRepository.countTLDs.mockResolvedValue(mockCount);

            const response = await GET();
            const responseData = await response.json();

            expect(response.status).toBe(200);
            expect(responseData).toEqual({ count: mockCount });
            expect(mockTldRepository.countTLDs).toHaveBeenCalledTimes(1);
        });

        it('should handle repository timeout error', async () => {
            const timeoutError = new Error('Query timeout');
            timeoutError.name = 'TimeoutError';
            mockTldRepository.countTLDs.mockRejectedValue(timeoutError);

            const response = await GET();
            const responseData = await response.json();

            expect(response.status).toBe(500);
            expect(responseData).toEqual({ error: 'Failed to count TLDs' });
            expect(mockLogger.error).toHaveBeenCalledWith(
                { error: timeoutError },
                'Error counting TLDs'
            );
        });

        it('should handle database connection error', async () => {
            const connectionError = new Error('Connection refused');
            connectionError.name = 'ConnectionError';
            mockTldRepository.countTLDs.mockRejectedValue(connectionError);

            const response = await GET();
            const responseData = await response.json();

            expect(response.status).toBe(500);
            expect(responseData).toEqual({ error: 'Failed to count TLDs' });
            expect(mockLogger.error).toHaveBeenCalledWith(
                { error: connectionError },
                'Error counting TLDs'
            );
        });
    });
});