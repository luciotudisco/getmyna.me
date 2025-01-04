/**
 * Represents a domain returned by the Domainr API.
 */
export class Domain {
    private name: string;
    private status: DomainStatus;
    private isAvailable: boolean;

    public constructor(name: string) {
        this.name = name;
        this.status = DomainStatus.unknown;
        this.isAvailable = false;
    }

    public getName(): string {
        return this.name;
    }

    public getStatus(): DomainStatus {
        return this.status;
    }

    public setStatus(status: DomainStatus): void {
        this.status = status;
        this.isAvailable = [DomainStatus.inactive, DomainStatus.premium, DomainStatus.transferable].includes(
            this.status,
        );
    }

    public getIsAvailable(): boolean {
        return this.isAvailable;
    }
}

/**
 * Possible domain statuses returned by the Domainr API.
 *
 * See https://domainr.com/docs/api/v2/status for more information.
 */
export enum DomainStatus {
    active = 'active',
    claimed = 'claimed',
    deleting = 'deleting',
    disallowed = 'disallowed',
    dpml = 'dpml',
    expiring = 'expiring',
    inactive = 'inactive',
    invalid = 'invalid',
    marketed = 'marketed',
    parked = 'parked',
    pending = 'pending',
    premium = 'premium',
    priced = 'priced',
    reserved = 'reserved',
    suffix = 'suffix',
    tld = 'tld',
    transferable = 'transferable',
    undelegated = 'undelegated',
    unknown = 'unknown',
    zone = 'zone',
}
