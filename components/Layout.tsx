import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
    onOpenCreateModal: () => void;
    isCreateDisabled: boolean;
}

const Layout: React.FC<LayoutProps> = ({ onOpenCreateModal, isCreateDisabled }) => {
    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col font-sans">
            <Header 
                onOpenCreateModal={onOpenCreateModal}
                isCreateDisabled={isCreateDisabled}
            />
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;