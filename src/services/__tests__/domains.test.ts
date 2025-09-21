import { DomainsService } from '@/services/domains';

const TEST_TLDS = [
    { name: 'com' },
    { name: 'org' },
    { name: 'net' },
    { name: 'io' },
    { name: 'co' },
    { name: 'es' },
    { name: 'ing' },
    { name: 'ng' },
    { name: 'man' },
    { name: 'gle' },
];

const domainsService = new DomainsService(TEST_TLDS);

describe('getDomainsHacks', () => {
    it('should return correct domains for uppercase input', () => {
        const result = domainsService.getDomainsHacks('bill gates');
        expect(result).toContain('gat.es');
        expect(result).toContain('billgat.es');
        expect(result).toContain('bill.gat.es');
        expect(result).toContain('g.at.es');
        expect(result).toContain('ga.t.es');
        expect(result).toContain('b.illgat.es');
        expect(result).toContain('bi.llgat.es');
        expect(result).toContain('bil.lgat.es');
        expect(result).toContain('billg.at.es');
        expect(result).toContain('billga.t.es');
    });

    it('should allow excluding subdomains when specified', async () => {
        const result = await domainsService.getDomainsHacks('bill gates', false);
        expect(result).toEqual(['gat.es', 'billgat.es']);
    });
});

describe('getMatchingDomains', () => {
    it('should return correct domains for uppercase input', async () => {
        const result = domainsService.getMatchingDomains('NEWMAN');
        expect(result).toContain('new.man');
        expect(result).toContain('n.ew.man');
        expect(result).toContain('ne.w.man');
    });

    it('should return correct domains for lowercase input', async () => {
        const result = domainsService.getMatchingDomains('newman');
        expect(result).toContain('new.man');
        expect(result).toContain('n.ew.man');
        expect(result).toContain('ne.w.man');
    });

    it('should return multiple domains for input with multiple matching TLDs', async () => {
        const result = domainsService.getMatchingDomains('moving');
        expect(result).toContain('mov.ing');
        expect(result).toContain('movi.ng');
        expect(result).toContain('m.ov.ing');
        expect(result).toContain('mo.v.ing');
        expect(result).toContain('m.ovi.ng');
        expect(result).toContain('mo.vi.ng');
        expect(result).toContain('mov.i.ng');
    });
});

describe('getSubdomains', () => {
    it('should return all subdomains for a given domain label', () => {
        const result = domainsService.getSubdomains('lucio');
        expect(result).toEqual(['l.ucio', 'lu.cio', 'luc.io', 'luci.o', 'lucio']);
    });
});

describe('getMatchingTLDs', () => {
    it('should return a single matching TLD', async () => {
        const result = domainsService.getMatchingTLDs('lucio');
        expect(result).toEqual(['io']);
    });

    it('should return multiple matching TLDs, if applicable', async () => {
        const result = domainsService.getMatchingTLDs('moving');
        expect(result.sort()).toEqual(['ing', 'ng'].sort());
    });
});