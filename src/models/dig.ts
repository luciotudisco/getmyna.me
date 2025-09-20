export enum DNSRecordType {
    A = 'A',
    AAAA = 'AAAA',
    CNAME = 'CNAME',
    MX = 'MX',
    NS = 'NS',
    TXT = 'TXT',
}

export interface DigInfo {
    records: Partial<Record<DNSRecordType, string[]>>;
    errors?: Partial<Record<DNSRecordType, string>>;
}
