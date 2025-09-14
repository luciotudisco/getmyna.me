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
    [DomainStatus.active]: 'This domain is alive and kicking, fully set up, and doing its job on the internet.',
    [DomainStatus.claimed]: 'Someone already owns this domain, so you’ll need to wait, buy, or trade if you want it.',
    [DomainStatus.deleting]: 'The domain iIS currently being deleted and soon heading back into the wild.',
    [DomainStatus.disallowed]: 'This domain is off-limits by rules or policy, so it can’t be registered by anyone.',
    [DomainStatus.dpml]: 'Locked down by the DPML. IT is shielded to protect trademarks from squatters.',
    [DomainStatus.expiring]: 'The timer is ticking. The registration is almost up, and it may soon be up for grabs.',
    [DomainStatus.inactive]: 'Wide open and ready—this domain isn’t owned yet and can be registered right away.',
    [DomainStatus.invalid]: 'Oops—this one doesn’t even count as a proper domain name, so it’s not usable.',
    [DomainStatus.marketed]: 'This domain is up for sale and being advertised like digital real estate.',
    [DomainStatus.parked]: 'The domain has an owner but is sitting there, usually pointing to ads or placeholders.',
    [DomainStatus.pending]: 'In limbo—this domain is waiting for a registration or transfer to finish processing.',
    [DomainStatus.premium]: 'This domain is considered “special” and comes with a price tag to match.',
    [DomainStatus.priced]: 'This domain has a set sticker price and can be bought directly if you’re willing.',
    [DomainStatus.reserved]: 'The registry has this domain stashed away, so the public can’t grab it.',
    [DomainStatus.suffix]: 'This is a known domain ending rather than a name you can register directly.',
    [DomainStatus.tld]: 'This domain sits at the top of the hierarchy—a top-level domain like .com or .org.',
    [DomainStatus.transferable]: 'This domain can switch hands and registrars if the current owner approves.',
    [DomainStatus.undelegated]: 'The domain exists but hasn’t been hooked up to the internet’s plumbing yet.',
    [DomainStatus.unknown]: 'No one’s quite sure what’s going on with this domain—it is in the mystery box.',
    [DomainStatus.zone]: 'This domain acts as a zone, meaning it can host records and subdomains under its roof.',
    [DomainStatus.error]: 'Something went sideways while checking this domain’s status. Try again later.',
};
