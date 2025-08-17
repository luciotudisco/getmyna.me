import { render, screen } from '@testing-library/react';
import TldSection from './TldSection';

describe('TldSection', () => {
    it('displays provided description', () => {
        render(<TldSection tld="com" description="Commercial" />);
        expect(screen.getByText(/Commercial/)).toBeInTheDocument();
    });

    it('uses default description when none is provided', () => {
        render(<TldSection tld="xyz" />);
        expect(
            screen.getByText('No additional information is available for this TLD.'),
        ).toBeInTheDocument();
    });
});
