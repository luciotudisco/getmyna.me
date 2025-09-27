import { render, screen } from '@testing-library/react';

import TLDSection from '@/components/TLDSection';
import { TLD, TLDType } from '@/models/tld';

describe('TLDSection', () => {
    const baseTLD: TLD = {
        name: 'com',
        punycodeName: 'com',
        description: 'Commercial organizations',
        type: TLDType.GENERIC,
    };

    describe('rendering', () => {
        it('should render the TLD name in a badge', () => {
            render(<TLDSection {...baseTLD} />);

            expect(screen.getByText('.com')).toBeInTheDocument();
        });

        it('should render the section title', () => {
            render(<TLDSection {...baseTLD} />);

            expect(screen.getByText('Top Level Domain')).toBeInTheDocument();
        });

        it('should render the description', () => {
            render(<TLDSection {...baseTLD} />);

            expect(screen.getByText('Commercial organizations')).toBeInTheDocument();
        });

        it('should render the "Learn more" link with correct URL', () => {
            render(<TLDSection {...baseTLD} />);

            const learnMoreLink = screen.getByText('Learn more');
            expect(learnMoreLink).toBeInTheDocument();
            expect(learnMoreLink).toHaveAttribute('href', 'https://www.iana.org/domains/root/db/com.html');
            expect(learnMoreLink).toHaveAttribute('target', '_blank');
            expect(learnMoreLink).toHaveAttribute('rel', 'noopener noreferrer');
        });
    });

    describe('TLD type', () => {
        it('should render the TLD type when type is GENERIC', () => {
            const genericTLD: TLD = {
                ...baseTLD,
                type: TLDType.GENERIC,
            };

            render(<TLDSection {...genericTLD} />);

            expect(screen.queryByText('Generic')).toBeInTheDocument();
        });

        it('should render the TLD type when type is COUNTRY_CODE', () => {
            const countryCodeTLD: TLD = {
                ...baseTLD,
                type: TLDType.COUNTRY_CODE,
            };

            render(<TLDSection {...countryCodeTLD} />);

            expect(screen.queryByText('Country Code')).toBeInTheDocument();
        });

        it('should render the TLD type when type is GENERIC', () => {
            const genericTLD: TLD = {
                ...baseTLD,
                type: TLDType.GENERIC,
            };

            render(<TLDSection {...genericTLD} />);

            expect(screen.queryByText('Generic')).toBeInTheDocument();
        });

        it('should render the TLD type when type is GENERIC_RESTRICTED', () => {
            const genericRestrictedTLD: TLD = {
                ...baseTLD,
                type: TLDType.GENERIC_RESTRICTED,
            };

            render(<TLDSection {...genericRestrictedTLD} />);

            expect(screen.queryByText('Generic Restricted')).toBeInTheDocument();
        });

        it('should render the TLD type when type is INFRASTRUCTURE', () => {
            const infrastructureTLD: TLD = {
                ...baseTLD,
                type: TLDType.INFRASTRUCTURE,
            };

            render(<TLDSection {...infrastructureTLD} />);

            expect(screen.queryByText('Infrastructure')).toBeInTheDocument();
        });

        it('should render the TLD type when type is SPONSORED', () => {
            const sponsoredTLD: TLD = {
                ...baseTLD,
                type: TLDType.SPONSORED,
            };

            render(<TLDSection {...sponsoredTLD} />);

            expect(screen.queryByText('Sponsored')).toBeInTheDocument();
        });

        it('should render the TLD type when type is TEST', () => {
            const testTLD: TLD = {
                ...baseTLD,
                type: TLDType.TEST,
            };

            render(<TLDSection {...testTLD} />);

            expect(screen.queryByText('Test')).toBeInTheDocument();
        });
    });

    describe('punycode handling', () => {
        it('should use punycodeName for IANA URL when provided', () => {
            const punycodeTLD: TLD = {
                name: 'москва',
                punycodeName: 'xn--80adxhks',
                description: 'Moscow',
                type: TLDType.COUNTRY_CODE,
            };

            render(<TLDSection {...punycodeTLD} />);

            const learnMoreLink = screen.getByText('Learn more');
            expect(learnMoreLink).toHaveAttribute('href', 'https://www.iana.org/domains/root/db/xn--80adxhks.html');
        });

        it('should display the original name in the badge even with punycode', () => {
            const punycodeTLD: TLD = {
                name: 'москва',
                punycodeName: 'xn--80adxhks',
                description: 'Moscow',
                type: TLDType.COUNTRY_CODE,
            };

            render(<TLDSection {...punycodeTLD} />);

            expect(screen.getByText('.москва')).toBeInTheDocument();
            expect(screen.queryByText('.xn--80adxhks')).not.toBeInTheDocument();
        });
    });

    describe('description handling', () => {
        it('should render custom description when provided', () => {
            const customDescTLD: TLD = {
                ...baseTLD,
                description: 'Custom description for this TLD',
            };

            render(<TLDSection {...customDescTLD} />);

            expect(screen.getByText('Custom description for this TLD')).toBeInTheDocument();
        });

        it('should render default description when description is undefined', () => {
            const noDescTLD: TLD = {
                ...baseTLD,
                description: undefined,
            };

            render(<TLDSection {...noDescTLD} />);

            expect(
                screen.getByText('No additional information is available for this TLD, just yet.'),
            ).toBeInTheDocument();
        });
    });
});
