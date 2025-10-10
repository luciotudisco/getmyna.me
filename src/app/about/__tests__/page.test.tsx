import { render, screen } from '@testing-library/react';

import AboutPage from '@/app/about/page';

// Mock the TLDCounter component
jest.mock('@/components/TLDCounter', () => {
    return function MockTLDCounter() {
        return <div data-testid="tld-counter">TLD Counter</div>;
    };
});

describe('AboutPage', () => {
    it('should render the main heading', () => {
        render(<AboutPage />);

        const badge = screen.getByText('ABOUT');
        expect(badge).toBeInTheDocument();

        const heading = screen.getByText('Domain Hacks');
        expect(heading).toBeInTheDocument();
        expect(heading.tagName).toBe('H1');
    });

    it('should render all FAQ items with questions', () => {
        render(<AboutPage />);

        // Check all questions are rendered
        expect(screen.getByText("What's a domain hack?")).toBeInTheDocument();
        expect(screen.getByText('Why are domain hacks so effective?')).toBeInTheDocument();
        expect(screen.getByText('Can I build my brand around a domain hack?')).toBeInTheDocument();
        expect(screen.getByText('What are some popular examples of domain hacks?')).toBeInTheDocument();
        expect(screen.getByText('How do I find the perfect domain hack?')).toBeInTheDocument();
    });

    it('should render the TLDCounter component', () => {
        render(<AboutPage />);

        const tldCounter = screen.getByTestId('tld-counter');
        expect(tldCounter).toBeInTheDocument();
    });
});
