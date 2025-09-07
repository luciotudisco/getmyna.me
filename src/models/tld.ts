export enum TLDType {
    // .arpa for technical network infrastructure.
    INFRASTRUCTURE = 'INFRASTRUCTURE',
    // Generic top-level domains not tied to a specific community or country (e.g., .com, .app).
    GENERIC = 'GENERIC',
    // Generic domains with registration restrictions (e.g., .biz, .name).
    GENERIC_RESTRICTED = 'GENERIC_RESTRICTED',
    // Community-specific domains run by sponsors (e.g., .edu, .gov).
    SPONSORED = 'SPONSORED',
    // Two-letter country codes (e.g., .uk).
    COUNTRY_CODE = 'COUNTRY_CODE',
    // Reserved or special-use domains for testing (e.g., .test).
    TEST = 'TEST',
}

export interface TLD {
    name?: string;
    description?: string;
    type?: TLDType;
}
