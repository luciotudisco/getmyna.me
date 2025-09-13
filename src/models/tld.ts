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
    PORKBUN = 'PORKBUN',
    DYNADOT = 'DYNADOT',
}

export interface TLDPricing {
    registration: number;
    renewal: number;
    currency: string;
}

export interface TLD {
    name?: string;
    description?: string;
    type?: TLDType;
    pricing?: Partial<Record<Registrar, TLDPricing>>;
}
