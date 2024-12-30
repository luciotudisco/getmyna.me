import { getDomainsHacks, getMatchingDomains, getMatchingTLDs, getSubdomains } from '@/services/domains';

describe('getDomainsHacks', () => {
    it('should return correct domains for uppercase input', () => {
        const result = getDomainsHacks('bill gates');
        expect(result).toEqual(['GAT.ES', 'BILLGAT.ES', 'BILL.GAT.ES']);
    });

    it('should handle input with extra whitespace and return correct domains', () => {
        const result = getDomainsHacks(' bill   gates ');
        expect(result).toEqual(['GAT.ES', 'BILLGAT.ES', 'BILL.GAT.ES']);
    });

    it('should handle single-word input and return correct domains', () => {
        const result = getDomainsHacks('google');
        expect(result).toEqual(['GOO.GLE']);
    });

    it('should handle input with more than three words and combine middle words', () => {
        const result = getDomainsHacks('lucio foo bar tudisco');
        expect(result).toContain('LUC.IO');
        expect(result).toContain('TUDIS.CO');
        expect(result).toContain('LUCIOTUDIS.CO');
        expect(result).toContain('TUDISCOLUC.IO');
    });

    it('should return an empty array for an empty input', () => {
        const result = getDomainsHacks('');
        expect(result).toEqual([]);
    });
});

describe('getMatchingDomains', () => {
    it('should return correct domains for uppercase input', () => {
        const result = getMatchingDomains('NEWMAN');
        expect(result).toEqual(['NEW.MAN']);
    });

    it('should return correct domains for lowercase input', () => {
        const result = getMatchingDomains('newman');
        expect(result).toEqual(['NEW.MAN']);
    });

    it('should return an empty array when there are no matching domains', () => {
        const result = getMatchingDomains('jon');
        expect(result).toEqual([]);
    });

    it('should return multiple domains for input with multiple matching TLDs', () => {
        const result = getMatchingDomains('moving');
        expect(result).toEqual(['MOV.ING', 'MOVI.NG']);
    });

    it('should handle numeric input correctly', () => {
        const result = getMatchingDomains('124newman');
        expect(result).toEqual(['124NEW.MAN']);
    });

    it('should return an empty array for input with invalid characters', () => {
        const result = getMatchingDomains('^*&124newman');
        expect(result).toEqual([]);
    });
});

describe('getSubdomains', () => {
    it('should return an empty array if the domain is empty', () => {
        const result = getSubdomains('');
        expect(result).toEqual([]);
    });

    it('should return all subdomains for a given domain label', () => {
        const result = getSubdomains('lucio');
        expect(result).toEqual(["l.ucio", "lu.cio", "luc.io", "luci.o", "lucio"]);
    });

});

describe('getMatchingTLDs', () => {
    it('should return an empty array if no TLD matches', () => {
        const result = getMatchingTLDs('example');
        expect(result).toEqual([]);
    });

    it('should return a single matching TLD', () => {
        const result = getMatchingTLDs('lucio');
        expect(result).toEqual(['IO']);
    });

    it('should return multiple matching TLDs, if applicable', () => {
        const result = getMatchingTLDs('moving');
        expect(result.sort()).toEqual(['ING', 'NG'].sort());
    });

    it('should be case-insensitive', () => {
        const result = getMatchingTLDs('LuCiO');
        expect(result).toEqual(['IO']);
    });

    it('should handle an empty string as input', () => {
        const result = getMatchingTLDs('');
        expect(result).toEqual([]);
    });
});
