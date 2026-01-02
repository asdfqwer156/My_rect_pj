
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    onOpenCreateModal: () => void;
    isCreateDisabled: boolean;
}

const Header: React.FC<HeaderProps> = () => {
    const navigate = useNavigate();

    return (
        <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center items-center py-6">
                    <h1 
                        onClick={() => navigate('/')} 
                        className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white cursor-pointer hover:opacity-80 transition-all tracking-tight select-none"
                    >
                        나만의 웹사이트 빌더
                    </h1>
                </div>
            </div>
        </header>
    );
};

export default Header;
