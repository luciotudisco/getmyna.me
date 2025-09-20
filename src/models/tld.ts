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
    // Reserved or special-use domains for testing (e.g., .test).
    TEST = 'TEST',
}

export enum TextDirection {
    LEFT_TO_RIGHT = 'LTR',
    RIGHT_TO_LEFT = 'RTL',
}

export enum Registrar {
    DYNADOT = 'DYNADOT',
    GANDI = 'GANDI',
    NAMECOM = 'NAMECOM',
    NAMESILO = 'NAMESILO',
    PORKBUN = 'PORKBUN',
}

export const REGISTRARS_DOMAIN_SEARCH_URLS = {
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
    name?: string;
    punycodeName?: string;
    description?: string;
    type?: TLDType;
    direction?: TextDirection;
    pricing?: Partial<Record<Registrar, TLDPricing>>;
}
