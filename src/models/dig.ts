export enum DNSRecordType {
    A = 'A',
    CNAME = 'CNAME',
    MX = 'MX',
}

export interface DigInfo {
    result: {
        domain: string;
        records: Partial<Record<DNSRecordType, string[]>>;
    };
}
