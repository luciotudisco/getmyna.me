import { GET } from '@/app/api/tlds/[name]/route';
import { TLDType } from '@/models/tld';
import { tldRepository } from '@/services/tld-repository';

jest.mock('@/services/tld-repository');
const mockTldRepository = tldRepository as jest.Mocked<typeof tldRepository>;

describe('/api/tlds/[name]', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return TLD when found', async () => {
        const mockTld = {
            name: 'com',
            description: 'Commercial',
            type: TLDType.GENERIC,
            yearEstablished: 1985,
        };

        mockTldRepository.get.mockResolvedValue(mockTld);

        const response = await GET({} as any, { params: Promise.resolve({ name: 'com' }) });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual(mockTld);
        expect(mockTldRepository.get).toHaveBeenCalledWith('com');
    });

    it('should return 404 when TLD not found', async () => {
        mockTldRepository.get.mockResolvedValue(null);

        const response = await GET({} as any, { params: Promise.resolve({ name: 'nonexistent' }) });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: 'TLD not found' });
        expect(mockTldRepository.get).toHaveBeenCalledWith('nonexistent');
    });

    it('should return 400 when name is empty', async () => {
        const response = await GET({} as any, { params: Promise.resolve({ name: '' }) });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: 'TLD name is required' });
        expect(mockTldRepository.get).not.toHaveBeenCalled();
    });

    it('should return 500 when repository throws error', async () => {
        mockTldRepository.get.mockRejectedValue(new Error('Database error'));

        const response = await GET({} as any, { params: Promise.resolve({ name: 'com' }) });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Internal server error' });
    });

    it('should handle punycode TLD names', async () => {
        const mockTld = {
            name: '测试',
            punycodeName: 'xn--0zwm56d',
            description: 'Chinese test domain',
            type: TLDType.GENERIC,
        };

        mockTldRepository.get.mockResolvedValue(mockTld);

        const response = await GET({} as any, { params: Promise.resolve({ name: 'xn--0zwm56d' }) });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual(mockTld);
        expect(mockTldRepository.get).toHaveBeenCalledWith('xn--0zwm56d');
    });

    it('should remove leading dot from TLD name', async () => {
        const mockTld = {
            name: 'com',
            description: 'Commercial',
            type: TLDType.GENERIC,
            yearEstablished: 1985,
        };

        mockTldRepository.get.mockResolvedValue(mockTld);

        const response = await GET({} as any, { params: Promise.resolve({ name: '.com' }) });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual(mockTld);
        expect(mockTldRepository.get).toHaveBeenCalledWith('com');
    });
});
