import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Website } from '../types';
import { ArrowLeftIcon } from '../components/IconComponents';

interface WebsiteViewPageProps {
    websites: Website[];
}

const WebsiteViewPage: React.FC<WebsiteViewPageProps> = ({ websites }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [website, setWebsite] = useState<Website | null>(null);

    useEffect(() => {
        const found = websites.find(w => w.id === id);
        setWebsite(found || null);
    }, [id, websites]);

    if (!website) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <p className="text-gray-500 dark:text-gray-400 mb-4">웹사이트를 찾을 수 없습니다.</p>
                <button
                    onClick={() => navigate('/')}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                >
                    대시보드로 돌아가기
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    {website.title}
                </h2>
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeftIcon />
                    <span>목록으로</span>
                </button>
            </div>
            <div className="flex-grow relative bg-white">
                <iframe
                    src={website.url}
                    title={website.title}
                    className="absolute inset-0 w-full h-full border-0"
                    sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts"
                />
            </div>
        </div>
    );
};

export default WebsiteViewPage;