import axios from 'axios';
import { ApiService } from '@/services/api';
import { DomainStatus as DomainStatusEnum } from '@/models/domain';
import { DNSRecordType, DigInfo } from '@/models/dig';
import { WhoisInfo } from '@/models/whois';
import { TLD } from '@/models/tld';

jest.mock('axios');

describe('ApiService', () => {
    let apiService: ApiService;
    let getMock: jest.Mock;
    const mockedAxios = axios as jest.Mocked<typeof axios>;

    beforeEach(() => {
        getMock = jest.fn();
        mockedAxios.create.mockReturnValue({ get: getMock } as any);
        apiService = new ApiService();
    });

    it('digDomain fetches dig info', async () => {
        const digInfo: DigInfo = { records: { [DNSRecordType.A]: ['1.1.1.1'] } };
        getMock.mockResolvedValue({ data: digInfo });

        const result = await apiService.digDomain('example.com', DNSRecordType.A);

        expect(getMock).toHaveBeenCalledWith('/api/domains/example.com/dig', {
            params: { type: DNSRecordType.A },
        });
        expect(result).toEqual(digInfo);
    });

    it('getDomainStatus fetches domain status', async () => {
        getMock.mockResolvedValue({
            data: { status: [{ summary: DomainStatusEnum.active }] },
        });

        const result = await apiService.getDomainStatus('example.com');

        expect(getMock).toHaveBeenCalledWith('/api/domains/example.com/status');
        expect(result).toBe(DomainStatusEnum.active);
    });

    it('getDomainStatus returns error when summary missing', async () => {
        getMock.mockResolvedValue({ data: { status: [{}] } });

        const result = await apiService.getDomainStatus('example.com');

        expect(result).toBe(DomainStatusEnum.error);
    });

    it('getDomainWhois fetches whois info', async () => {
        const whoisInfo: WhoisInfo = {
            creationDate: '2020-01-01',
            expirationDate: '2025-01-01',
            registrar: 'Example',
            registrarUrl: 'http://example.com',
        };
        getMock.mockResolvedValue({ data: whoisInfo });

        const result = await apiService.getDomainWhois('example.com');

        expect(getMock).toHaveBeenCalledWith('/api/domains/example.com/whois');
        expect(result).toEqual(whoisInfo);
    });

    it('getTldInfo fetches tld info', async () => {
        const tldInfo: TLD = { description: 'desc' };
        getMock.mockResolvedValue({ data: tldInfo });

        const result = await apiService.getTldInfo('example.com');

        expect(getMock).toHaveBeenCalledWith('/api/domains/example.com/tld');
        expect(result).toEqual(tldInfo);
    });

    it('searchDomains fetches matching domains', async () => {
        getMock.mockResolvedValue({ data: { domains: ['example.com'] } });

        const result = await apiService.searchDomains('example');

        expect(getMock).toHaveBeenCalledWith('/api/domains/search', {
            params: { term: 'example' },
        });
        expect(result).toEqual(['example.com']);
    });
});
