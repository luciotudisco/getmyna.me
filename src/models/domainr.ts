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

/**
 * A dictionary of domain statuses with their corresponding labels.
 */
export const DOMAIN_STATUS_LABELS: Record<DomainStatus, { label: string; color: string }> = {
    [DomainStatus.unknown]: {
        color: '#99C1DE',
        label: 'Unknown status, usually resulting from an error or misconfiguration.',
    },
    [DomainStatus.undelegated]: {
        color: '#BCD4E6',
        label: 'The domain is not present in DNS.',
    },
    [DomainStatus.inactive]: {
        color: '#D6E2E9',
        label: 'The domain is available for a new registration.',
    },
    [DomainStatus.pending]: {
        color: '#FAD2E1',
        label: 'The top level domain is not yet in the root zone file.',
    },
    [DomainStatus.disallowed]: {
        color: '#FDE2E4',
        label: 'Disallowed by the registry, ICANN, or other (wrong script, etc.).',
    },
    [DomainStatus.claimed]: {
        color: '#FFF1E6',
        label: 'Claimed or reserved by some party (not available for new registration).',
    },
    [DomainStatus.reserved]: {
        color: '#c5dedd',
        label: 'Explicitly reserved by ICANN, the registry, or another party.',
    },
    [DomainStatus.dpml]: {
        color: '#fad2e1',
        label: 'Domains Protected Marks List, reserved for trademark holders.',
    },
    [DomainStatus.invalid]: {
        color: '#FAE1DD',
        label: 'A domain longer than 64 characters. Technically invalid, e.g. too long or too short.',
    },
    [DomainStatus.active]: {
        color: '#C5DEDD',
        label: 'Registered, but possibly available via the aftermarket.',
    },
    [DomainStatus.parked]: {
        color: '#fff1e6',
        label: 'Active and parked, possibly available via the aftermarket.',
    },
    [DomainStatus.marketed]: {
        color: '#ffd8be',
        label: 'Explicitly marketed as for sale via the aftermarket.',
    },
    [DomainStatus.expiring]: {
        color: '#f8f7ff',
        label: 'An expiring domain, e.g. in the Redemption Grace Period, and possibly available via a backorder service. Not guaranteed to be present for all expiring domains.',
    },
    [DomainStatus.deleting]: {
        color: '#FEC89A',
        label: 'A expired domain pending removal from the registry. e.g. in the Pending Delete phase, and possibly available via a backorder service. Not guaranteed to be present for all deleting domains.',
    },
    [DomainStatus.priced]: {
        color: '#e5b3fe',
        label: 'An aftermarket domain with an explicit price. e.g. via the BuyDomains service.',
    },
    [DomainStatus.transferable]: {
        color: '#d8e2dc',
        label: 'An aftermarket domain available for fast-transfer. e.g. in the Afternic inventory.',
    },
    [DomainStatus.premium]: {
        color: '#b8c0ff',
        label: 'Premium domain name for sale by the registry.',
    },
    [DomainStatus.suffix]: {
        color: '#ffd6ff',
        label: 'A public suffix according to publicsuffix.org.',
    },
    [DomainStatus.zone]: {
        color: '#e4c1f9',
        label: 'A zone (domain extension) in the Domainr database.',
    },
    [DomainStatus.tld]: { color: '#bdb2ff', label: 'A top-level domain.' },
};
