export enum TLDType {
    // .arpa for technical network infrastructure.
    INFRASTRUCTURE = 'INFRASTRUCTURE',
    // Generic domains not tied to a country (e.g., .com, .app).
    GENERIC = 'GENERIC',
    // Community-specific domains run by sponsors (e.g., .edu, .gov).
    SPONSORED = 'SPONSORED',
    // Two-letter country codes (e.g., .uk).
    COUNTRY_CODE = 'COUNTRY_CODE',
    // Country codes in local scripts (e.g., .中国).
    IDN_COUNTRY_CODE = 'IDN_COUNTRY_CODE',
    // Generic domains in non-Latin scripts (e.g., .みんな).
    IDN_GENERIC = 'IDN_GENERIC',
    // Reserved or special-use domains for testing (e.g., .test).
    TEST = 'TEST',
}

export interface TLD {
    name?: string;
    description?: string;
    type?: TLDType;
}
