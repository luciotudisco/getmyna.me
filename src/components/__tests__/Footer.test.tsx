import { render, screen } from '@testing-library/react';

import Footer from '@/components/Footer';

describe('Footer', () => {
    it('should render the footer with correct text', () => {
        render(<Footer />);

        const footerText = screen.getByText('Made with ❤️ in Dublin');
        expect(footerText).toBeInTheDocument();
    });
});
