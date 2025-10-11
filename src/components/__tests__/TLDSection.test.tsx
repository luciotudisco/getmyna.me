import { render, screen } from '@testing-library/react';

import TLDSection from '@/components/TLDSection';
import { TLD } from '@/models/tld';

describe('TLDSection', () => {
    describe('description handling', () => {
        it('should render custom description when provided', () => {
            const customDescTLD: TLD = {
                description: 'Custom description for this TLD',
            };

            render(<TLDSection {...customDescTLD} />);

            expect(screen.getByText('Custom description for this TLD')).toBeInTheDocument();
        });

        it('should render default description when description is undefined', () => {
            const noDescTLD: TLD = {
                description: undefined,
            };

            render(<TLDSection {...noDescTLD} />);

            expect(
                screen.getByText('No additional information is available for this TLD, just yet.'),
            ).toBeInTheDocument();
        });

        it('should render description with commercial organizations text', () => {
            const baseTLD: TLD = {
                description: 'Commercial organizations',
            };

            render(<TLDSection {...baseTLD} />);

            expect(screen.getByText('Commercial organizations')).toBeInTheDocument();
        });
    });
});
