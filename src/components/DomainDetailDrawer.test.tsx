import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Domain, DomainStatus } from '@/models/domain';
import DomainDetailDrawer from './DomainDetailDrawer';

jest.mock('@/components/ui/drawer', () => ({
    Drawer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DrawerContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DrawerHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DrawerTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/separator', () => ({
    Separator: () => <div />,
}));

jest.mock('@/services/tld-info', () => ({
    getTldInfo: jest.fn().mockResolvedValue(null),
}));

describe('DomainDetailDrawer', () => {
    it('renders link to domain when status is active', () => {
        const domain = new Domain('example.com');
        render(
            <DomainDetailDrawer
                domain={domain}
                status={DomainStatus.active}
                open={true}
                onClose={() => {}}
            />,
        );
        const link = screen.getByRole('link', { name: 'example.com' });
        expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('does not render link when status is not active', () => {
        const domain = new Domain('example.com');
        render(
            <DomainDetailDrawer
                domain={domain}
                status={DomainStatus.claimed}
                open={true}
                onClose={() => {}}
            />,
        );
        const link = screen.queryByRole('link', { name: 'example.com' });
        expect(link).toBeNull();
    });
});

