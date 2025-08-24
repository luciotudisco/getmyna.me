export enum DNSRecordType {
    A = 'A',
    AAAA = 'AAAA',
    CNAME = 'CNAME',
    MX = 'MX',
    NS = 'NS',
    TXT = 'TXT',
}

export interface DigInfo {
    result: {
        domain: string;
        records: Partial<Record<DNSRecordType, string[]>>;
    };
}
