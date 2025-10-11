import { Flag, FlaskConical, Globe2, Handshake, type LucideIcon, Server, ShieldCheck } from 'lucide-react';

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

export enum Registrar {
    DYNADOT = 'DYNADOT',
    GANDI = 'GANDI',
    NAMECOM = 'NAMECOM',
    NAMESILO = 'NAMESILO',
    PORKBUN = 'PORKBUN',
}

export interface TLDPricing {
    registration?: number;
    renewal?: number;
    currency?: string;
}

export interface TLD {
    description?: string;
    name?: string;
    pricing?: Partial<Record<Registrar, TLDPricing>>;
    punycodeName?: string;
    type?: TLDType;
    yearEstablished?: number;
}

export const TLD_TYPE_ICONS: Record<TLDType, LucideIcon> = {
    [TLDType.COUNTRY_CODE]: Flag,
    [TLDType.GENERIC]: Globe2,
    [TLDType.GENERIC_RESTRICTED]: ShieldCheck,
    [TLDType.INFRASTRUCTURE]: Server,
    [TLDType.SPONSORED]: Handshake,
    [TLDType.TEST]: FlaskConical,
};

export const TLD_TYPE_DISPLAY_NAMES: Record<TLDType, string> = {
    [TLDType.COUNTRY_CODE]: 'Country Code',
    [TLDType.GENERIC]: 'Generic',
    [TLDType.GENERIC_RESTRICTED]: 'Generic Restricted',
    [TLDType.INFRASTRUCTURE]: 'Infrastructure',
    [TLDType.SPONSORED]: 'Sponsored',
    [TLDType.TEST]: 'Test',
};
