import { render, screen } from '@testing-library/react';

import TLDDrawer from '@/components/TLDDrawer';
import { TLD, TLDType } from '@/models/tld';

describe('TLDDrawer', () => {
    const baseTLD: TLD = {
        name: 'com',
        punycodeName: 'com',
        description: 'Commercial organizations',
        type: TLDType.GENERIC,
        yearEstablished: 1985,
    };

    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render the TLD name, type, description, and learn more link', () => {
            render(<TLDDrawer tld={baseTLD} open={true} onClose={mockOnClose} />);

            expect(screen.getByText('.com')).toBeInTheDocument();
            expect(screen.getByText('Generic')).toBeInTheDocument();
            expect(screen.getByText('Commercial organizations')).toBeInTheDocument();
            expect(screen.getByText('1985')).toBeInTheDocument();

            const learnMoreLink = screen.getByRole('link', { name: /learn more/i });
            expect(learnMoreLink).toBeInTheDocument();
            expect(learnMoreLink).toHaveAttribute('href', '/tlds/com');
        });
    });
});
