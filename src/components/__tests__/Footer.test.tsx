import { render, screen } from '@testing-library/react';

import Footer from '@/components/Footer';

describe('Footer', () => {
    it('should render the footer with correct text', () => {
        render(<Footer />);
        
        const footerText = screen.getByText('Made with ❤️ in Dublin');
        expect(footerText).toBeInTheDocument();
    });

    it('should have the correct footer element with proper styling classes', () => {
        render(<Footer />);
        
        const footerElement = screen.getByRole('contentinfo');
        expect(footerElement).toBeInTheDocument();
        expect(footerElement).toHaveClass('border-grid', 'sticky', 'bottom-0', 'z-40', 'border-t', 'bg-background/40', 'p-2', 'backdrop-blur-lg');
    });
});