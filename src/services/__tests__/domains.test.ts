import { DomainHacksGenerator } from '@/services/domain-hacks';

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

const domainHacksGenerator = new DomainHacksGenerator(TEST_TLDS);

describe('getDomainsHacks', () => {
    it('should return correct domains for uppercase input', () => {
        const result = domainHacksGenerator.getDomainsHacks('bill gates');
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

    it('should handle input with extra whitespace and return correct domains', () => {
        const result = domainHacksGenerator.getDomainsHacks(' bill   gates ');
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

    it('should handle single-word input and return correct domains', async () => {
        const result = domainHacksGenerator.getDomainsHacks('google');
        expect(result).toContain('goo.gle');
        expect(result).toContain('g.oo.gle');
        expect(result).toContain('go.o.gle');
    });

    it('should handle input with more than three words and combine middle words', async () => {
        const result = domainHacksGenerator.getDomainsHacks('lucio foo bar tudisco');
        expect(result).toContain('luc.io');
        expect(result).toContain('tudis.co');
        expect(result).toContain('luciotudis.co');
        expect(result).toContain('tudiscoluc.io');
    });

    it('should return an empty array for an empty input', async () => {
        const result = domainHacksGenerator.getDomainsHacks('');
        expect(result).toEqual([]);
    });

    it('should remove duplicate domains from the result', async () => {
        const result = domainHacksGenerator.getDomainsHacks('gates gates');
        expect(result).toEqual([...new Set(result)]);
    });

    it('should allow excluding subdomains when specified', async () => {
        const result = await domainHacksGenerator.getDomainsHacks('bill gates', false);
        expect(result).toEqual(['gat.es', 'billgat.es']);
    });
});

describe('getMatchingDomains', () => {
    it('should return correct domains for uppercase input', async () => {
        const result = domainHacksGenerator.getMatchingDomains('NEWMAN');
        expect(result).toContain('new.man');
        expect(result).toContain('n.ew.man');
        expect(result).toContain('ne.w.man');
    });

    it('should return correct domains for lowercase input', async () => {
        const result = domainHacksGenerator.getMatchingDomains('newman');
        expect(result).toContain('new.man');
        expect(result).toContain('n.ew.man');
        expect(result).toContain('ne.w.man');
    });

    it('should return an empty array when there are no matching domains', async () => {
        const result = domainHacksGenerator.getMatchingDomains('jon');
        expect(result).toEqual([]);
    });

    it('should return multiple domains for input with multiple matching TLDs', async () => {
        const result = domainHacksGenerator.getMatchingDomains('moving');
        expect(result).toContain('mov.ing');
        expect(result).toContain('movi.ng');
        expect(result).toContain('m.ov.ing');
        expect(result).toContain('mo.v.ing');
        expect(result).toContain('m.ovi.ng');
        expect(result).toContain('mo.vi.ng');
        expect(result).toContain('mov.i.ng');
    });

    it('should handle numeric input correctly', async () => {
        const result = domainHacksGenerator.getMatchingDomains('124newman');
        expect(result).toContain('124new.man');
        expect(result).toContain('1.24new.man');
        expect(result).toContain('12.4new.man');
        expect(result).toContain('124.new.man');
        expect(result).toContain('124n.ew.man');
        expect(result).toContain('124ne.w.man');
    });

    it('should return an empty array for input with invalid characters', async () => {
        const result = domainHacksGenerator.getMatchingDomains('^*&124newman');
        expect(result).toEqual([]);
    });
});

describe('getSubdomains', () => {
    it('should return an empty array if the domain is empty', () => {
        const result = domainHacksGenerator.getSubdomains('');
        expect(result).toEqual([]);
    });

    it('should return all subdomains for a given domain label', () => {
        const result = domainHacksGenerator.getSubdomains('lucio');
        expect(result).toEqual(['l.ucio', 'lu.cio', 'luc.io', 'luci.o', 'lucio']);
    });
});

describe('getMatchingTLDs', () => {
    it('should return an empty array if no TLD matches', async () => {
        const result = domainHacksGenerator.getMatchingTLDs('example');
        expect(result).toEqual([]);
    });

    it('should return a single matching TLD', async () => {
        const result = domainHacksGenerator.getMatchingTLDs('lucio');
        expect(result).toEqual(['io']);
    });

    it('should return multiple matching TLDs, if applicable', async () => {
        const result = domainHacksGenerator.getMatchingTLDs('moving');
        expect(result.sort()).toEqual(['ing', 'ng'].sort());
    });

    it('should be case-insensitive', async () => {
        const result = domainHacksGenerator.getMatchingTLDs('LuCiO');
        expect(result).toEqual(['io']);
    });

    it('should handle an empty string as input', async () => {
        const result = domainHacksGenerator.getMatchingTLDs('');
        expect(result).toEqual([]);
    });
});
