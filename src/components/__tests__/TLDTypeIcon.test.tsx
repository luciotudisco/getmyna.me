import { render } from '@testing-library/react';

import TLDTypeIcon from '@/components/TLDTypeIcon';
import { TLD, TLDType } from '@/models/tld';

describe('TLDTypeIcon', () => {
    describe('Generic TLD Type', () => {
        it('should render the generic icon for generic TLD type', () => {
            const tld: TLD = {
                name: 'com',
                type: TLDType.GENERIC,
            };

            const { container } = render(<TLDTypeIcon tld={tld} />);
            const icon = container.querySelector('svg');

            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('text-primary');
        });
    });

    describe('Country Code TLD Type', () => {
        it('should render country flag for country code TLD', () => {
            const tld: TLD = {
                name: 'us',
                type: TLDType.COUNTRY_CODE,
            };

            const { container } = render(<TLDTypeIcon tld={tld} />);
            const flag = container.querySelector('.fi-us');

            expect(flag).toBeInTheDocument();
            expect(flag).toHaveAttribute('aria-label', 'Flag of us');
        });

        it('should convert UK to GB for country code', () => {
            const tld: TLD = {
                name: 'uk',
                type: TLDType.COUNTRY_CODE,
            };

            const { container } = render(<TLDTypeIcon tld={tld} />);
            const flag = container.querySelector('.fi-gb');

            expect(flag).toBeInTheDocument();
            expect(flag).toHaveAttribute('aria-label', 'Flag of uk');
        });
    });

    describe('Sponsored TLD Type', () => {
        it('should render the sponsored icon for sponsored TLD type', () => {
            const tld: TLD = {
                name: 'edu',
                type: TLDType.SPONSORED,
            };

            const { container } = render(<TLDTypeIcon tld={tld} />);
            const icon = container.querySelector('svg');

            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('text-primary');
        });
    });

    describe('Generic Restricted TLD Type', () => {
        it('should render the generic restricted icon for generic restricted TLD type', () => {
            const tld: TLD = {
                name: 'biz',
                type: TLDType.GENERIC_RESTRICTED,
            };

            const { container } = render(<TLDTypeIcon tld={tld} />);
            const icon = container.querySelector('svg');

            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('text-primary');
        });
    });

    describe('Infrastructure TLD Type', () => {
        it('should render the infrastructure icon for infrastructure TLD type', () => {
            const tld: TLD = {
                name: 'arpa',
                type: TLDType.INFRASTRUCTURE,
            };

            const { container } = render(<TLDTypeIcon tld={tld} />);
            const icon = container.querySelector('svg');

            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('text-primary');
        });
    });

    describe('No TLD Type', () => {
        it('should render default Globe2 icon when no type is provided', () => {
            const tld: TLD = {
                name: 'test',
            };

            const { container } = render(<TLDTypeIcon tld={tld} />);
            const icon = container.querySelector('svg');

            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('text-primary');
        });
    });
});
