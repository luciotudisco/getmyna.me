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
        const trimmedName = name.trim();
        this._validateDomainName(trimmedName);
        this._name = trimmedName;
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

    public getRootDomain(): string {
        return this._name.split('.').slice(0, -1).join('.');
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

    /**
     * Validates a domain name.
     * @param name The domain name to validate
     * @throws Error if the domain name is invalid
     */
    private _validateDomainName(name: string): void {
        if (typeof name !== 'string') {
            throw new Error('Domain name must be a string');
        }

        if (!name) {
            throw new Error('Domain name cannot be empty');
        }

        // Simple regex: must contain at least one dot and valid characters, no leading/trailing dots
        // Supports Unicode characters for internationalized domain names
        const domainRegex = /^[\p{L}\p{N}][\p{L}\p{N}-]*(\.[\p{L}\p{N}][\p{L}\p{N}-]*)+$/u;
        if (!domainRegex.test(name)) {
            throw new Error('Invalid domain name format. Must contain at least one dot (e.g., example.com)');
        }
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
