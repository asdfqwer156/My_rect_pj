import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} 아이어. All rights reserved.
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    주소: 안성시 삼죽면 밤고개안길95-19
                </p>
            </div>
        </footer>
    );
};

export default Footer;