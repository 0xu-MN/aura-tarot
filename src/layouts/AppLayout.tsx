import { ReactNode } from 'react';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Header } from '@/components/Header';

interface AppLayoutProps {
    children: ReactNode;
    showHeader?: boolean;
}

export const AppLayout = ({ children, showHeader = true }: AppLayoutProps) => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {showHeader && <Header />}

            {/* Main content with padding for header and bottom nav */}
            <main className={`flex-1 pb-20 ${showHeader ? 'pt-16' : ''}`}>
                {children}
            </main>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
};
