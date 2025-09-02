import { StorageService } from './storage';
import { TLD } from '@/models/tld';

jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({})),
}));

describe('StorageService', () => {
    let service: StorageService;

    beforeEach(() => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
        service = new StorageService();
    });

    it('returns true when TLD exists', async () => {
        jest.spyOn(service, 'getTLDByName').mockResolvedValue({ name: 'com' } as TLD);
        await expect(service.tldExists('com')).resolves.toBe(true);
    });

    it('returns false when TLD does not exist', async () => {
        jest.spyOn(service, 'getTLDByName').mockResolvedValue(null);
        await expect(service.tldExists('nonexistent')).resolves.toBe(false);
    });
});
