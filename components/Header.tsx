import React from 'react';
import { PlusIcon } from './IconComponents';

interface HeaderProps {
    onOpenCreateModal: () => void;
    isCreateDisabled: boolean;
}

const Header: React.FC<HeaderProps> = ({ onOpenCreateModal, isCreateDisabled }) => {
    return (
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        나만의 웹사이트 빌더
                    </h1>
                    <button
                        onClick={onOpenCreateModal}
                        type="button"
                        disabled={isCreateDisabled}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <PlusIcon />
                        <span>새 웹사이트 만들기</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
