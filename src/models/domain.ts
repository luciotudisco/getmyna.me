/**
 * Represents a domain.
 */
export class Domain {
    private _name: string;
    private _status: DomainStatus;
    private _isAvailable: boolean;
    private _tld: string;
    private _level: number;

    public constructor(name: string) {
        this._name = name;
        this._status = DomainStatus.unknown;
        this._isAvailable = false;
        this._tld = this._name.split('.').pop()!;
        this._level = this._name.split('.').length;
    }

    public getName(): string {
        return this._name;
    }

    public getLevel(): number {
        return this._level;
    }

    public getStatus(): DomainStatus {
        return this._status;
    }

    public getTLD(): string {
        return this._tld;
    }

    public setStatus(status: DomainStatus): void {
        this._status = status;
        this._isAvailable = DOMAIN_AVAILABLE_STATUS_VALUES.has(status);
    }

    public isAvailable(): boolean {
        return this._isAvailable;
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
    error = 'error',
}

const DOMAIN_AVAILABLE_STATUS_VALUES = new Set([
    DomainStatus.inactive,
    DomainStatus.premium,
    DomainStatus.transferable,
]);

export const DOMAIN_STATUS_DESCRIPTIONS: Record<DomainStatus, string> = {
    [DomainStatus.active]: 'Domain is currently active and in use.',
    [DomainStatus.claimed]: 'Domain has been claimed and is not available.',
    [DomainStatus.deleting]: 'Domain is in the process of being deleted.',
    [DomainStatus.disallowed]: 'Domain cannot be registered.',
    [DomainStatus.dpml]: 'Domain is blocked by the DPML program.',
    [DomainStatus.expiring]: 'Domain registration is expiring soon.',
    [DomainStatus.inactive]: 'Domain is available for registration.',
    [DomainStatus.invalid]: 'Domain is not valid.',
    [DomainStatus.marketed]: 'Domain is for sale by registry or reseller.',
    [DomainStatus.parked]: 'Domain is registered but not in active use.',
    [DomainStatus.pending]: 'Domain registration is pending.',
    [DomainStatus.premium]: 'Domain is available at a premium price.',
    [DomainStatus.priced]: 'Domain has a listed purchase price.',
    [DomainStatus.reserved]: 'Domain is reserved by the registry.',
    [DomainStatus.suffix]: 'Domain is a known suffix.',
    [DomainStatus.tld]: 'Domain is a top level domain.',
    [DomainStatus.transferable]: 'Domain can be transferred from another registrar.',
    [DomainStatus.undelegated]: 'Domain is registered but lacks DNS delegation.',
    [DomainStatus.unknown]: 'Domain status is unknown.',
    [DomainStatus.zone]: 'Domain is a DNS zone.',
    [DomainStatus.error]: 'An error occurred while fetching domain status.',
};
