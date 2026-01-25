import React from 'react';
import { ArrowLeftIcon } from './IconComponents';
import Footer from './Footer';

interface WebsiteViewerModalProps {
    url: string;
    title: string;
    onClose: () => void;
}

const WebsiteViewerModal: React.FC<WebsiteViewerModalProps> = ({ url, title, onClose }) => {
    return (
        <div
            className="fixed inset-0 z-40 flex flex-col bg-gray-100 dark:bg-gray-900"
            role="dialog"
            aria-modal="true"
            aria-labelledby="website-viewer-title"
        >
            <header className="flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-3">
                        <h2 id="website-viewer-title" className="text-lg font-bold text-gray-900 dark:text-white truncate">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
                            aria-label="Close website view"
                        >
                            <ArrowLeftIcon />
                            <span>목록으로 돌아가기</span>
                        </button>
                    </div>
                </div>
            </header>
            <main className="flex-grow relative min-h-0">
                <iframe
                    src={url}
                    title={title}
                    className="absolute inset-0 w-full h-full border-0"
                    sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts"
                ></iframe>
            </main>
            <Footer />
        </div>
    );
};

export default WebsiteViewerModal;