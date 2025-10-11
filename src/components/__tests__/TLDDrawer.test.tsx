import { render, screen } from '@testing-library/react';

import TLDDrawer from '@/components/TLDDrawer';
import { TLD, TLDType } from '@/models/tld';

describe('TLDDrawer', () => {
    const baseTLD: TLD = {
        name: 'com',
        punycodeName: 'com',
        description: 'Commercial organizations',
        type: TLDType.GENERIC,
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

            const learnMoreLink = screen.getByText('Learn more');
            expect(learnMoreLink).toBeInTheDocument();
            expect(learnMoreLink).toHaveAttribute('href', 'https://www.iana.org/domains/root/db/com.html');
            expect(learnMoreLink).toHaveAttribute('target', '_blank');
            expect(learnMoreLink).toHaveAttribute('rel', 'noopener noreferrer');
        });
    });
});
