/**
 * Represents a domain.
 */
export class Domain {
    /**
     * Regular expression for validating domain names.
     * Simple regex: must contain at least one dot and valid characters, no leading/trailing dots.
     * Supports Unicode characters for internationalized domain names.
     */
    private static readonly DOMAIN_REGEX = /^[\p{L}\p{N}][\p{L}\p{N}-]*(\.[\p{L}\p{N}][\p{L}\p{N}-]*)+$/u;

    private _name: string;
    private _status: DomainStatus;
    private _isAvailable: boolean;
    private _tld: string;
    private _level: number;

    public constructor(name: string) {
        const trimmedName = name.trim();
        if (!trimmedName) {
            throw new Error('Domain name cannot be empty');
        }
        if (!Domain.DOMAIN_REGEX.test(trimmedName)) {
            throw new Error(`Invalid domain name: ${trimmedName}`);
        }
        this._name = trimmedName;
        this._status = DomainStatus.UNKNOWN;
        this._isAvailable = false;
        this._tld = this._name.split('.').pop() || '';
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
     * @returns true if the domain name is valid, false otherwise
     */
    public static isValidDomain(name: string): boolean {
        return typeof name === 'string' && !!name.trim() && Domain.DOMAIN_REGEX.test(name);
    }
}

/**
 * Possible domain statuses returned by the Domainr API.
 *
 * See https://domainr.com/docs/api/v2/status for more information.
 */
export enum DomainStatus {
    ACTIVE = 'ACTIVE',
    CLAIMED = 'CLAIMED',
    DELETING = 'DELETING',
    DISALLOWED = 'DISALLOWED',
    DPML = 'DPML',
    EXPIRING = 'EXPIRING',
    INACTIVE = 'INACTIVE',
    INVALID = 'INVALID',
    MARKETED = 'MARKETED',
    PARKED = 'PARKED',
    PENDING = 'PENDING',
    PREMIUM = 'PREMIUM',
    PRICED = 'PRICED',
    RESERVED = 'RESERVED',
    SUFFIX = 'SUFFIX',
    TLD = 'TLD',
    TRANSFERABLE = 'TRANSFERABLE',
    UNDELEGATED = 'UNDELEGATED',
    UNKNOWN = 'UNKNOWN',
    ZONE = 'ZONE',
    ERROR = 'ERROR',
}

const DOMAIN_AVAILABLE_STATUS_VALUES = new Set([
    DomainStatus.INACTIVE,
    DomainStatus.PREMIUM,
    DomainStatus.TRANSFERABLE,
]);
