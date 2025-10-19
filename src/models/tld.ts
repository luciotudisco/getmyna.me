export enum TLDType {
    // Two-letter country codes (e.g., .uk).
    COUNTRY_CODE = 'COUNTRY_CODE',
    // Generic top-level domains not tied to a specific community or country (e.g., .com, .app).
    GENERIC = 'GENERIC',
    // Generic domains with registration restrictions (e.g., .biz, .name).
    GENERIC_RESTRICTED = 'GENERIC_RESTRICTED',
    // .arpa for technical network infrastructure.
    INFRASTRUCTURE = 'INFRASTRUCTURE',
    // Community-specific domains run by sponsors (e.g., .edu, .gov).
    SPONSORED = 'SPONSORED',
}

export enum Registrar {
    DYNADOT = 'DYNADOT',
    GANDI = 'GANDI',
    NAMECOM = 'NAMECOM',
    NAMESILO = 'NAMESILO',
    PORKBUN = 'PORKBUN',
}

export const REGISTRAR_DISPLAY_NAMES: Record<Registrar, string> = {
    [Registrar.DYNADOT]: 'Dynadot',
    [Registrar.GANDI]: 'Gandi',
    [Registrar.NAMECOM]: 'Name.com',
    [Registrar.NAMESILO]: 'NameSilo',
    [Registrar.PORKBUN]: 'Porkbun',
};

export const REGISTRAR_TLD_SEARCH_URLS: Record<Registrar, (tld: string) => string> = {
    [Registrar.DYNADOT]: (tld: string) => `https://www.dynadot.com/domain/${tld}`,
    [Registrar.GANDI]: (tld: string) => `https://www.gandi.net/en/domain/tld/${tld}`,
    [Registrar.NAMECOM]: (tld: string) => `https://www.name.com/domains/${tld}`,
    [Registrar.NAMESILO]: (tld: string) => `https://www.namesilo.com/tld/${tld}`,
    [Registrar.PORKBUN]: (tld: string) => `https://porkbun.com/tld/${tld}`,
};

export const REGISTRAR_DOMAIN_SEARCH_URLS: Record<Registrar, (domain: string) => string> = {
    [Registrar.DYNADOT]: (domain: string) => `https://www.dynadot.com/domain/search?domain=${domain}`,
    [Registrar.GANDI]: (domain: string) => `https://shop.gandi.net/domain/suggest?search=${domain}`,
    [Registrar.NAMECOM]: (domain: string) => `https://www.name.com/domain/search/${domain}`,
    [Registrar.NAMESILO]: (domain: string) => `https://www.namesilo.com/domain/search-domains?query=${domain}`,
    [Registrar.PORKBUN]: (domain: string) => `https://porkbun.com/checkout/search?q=${domain}`,
};

export interface TLDPricing {
    registration?: number;
    renewal?: number;
    currency?: string;
}

export interface TLD {
    countryCode?: string;
    description?: string;
    name?: string;
    organization?: string;
    pricing?: Partial<Record<Registrar, TLDPricing>>;
    punycodeName?: string;
    tagline?: string;
    type?: TLDType;
    yearEstablished?: number;
}

export const TLD_TYPE_DISPLAY_NAMES: Record<TLDType, string> = {
    [TLDType.COUNTRY_CODE]: 'Country Code',
    [TLDType.GENERIC]: 'Generic',
    [TLDType.GENERIC_RESTRICTED]: 'Generic Restricted',
    [TLDType.INFRASTRUCTURE]: 'Infrastructure',
    [TLDType.SPONSORED]: 'Sponsored',
};
