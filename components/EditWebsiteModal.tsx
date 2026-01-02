import React, { useState, useEffect } from 'react';
import { Category, Website } from '../types';
import { CloseIcon } from './IconComponents';

interface EditWebsiteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: string, websiteData: Partial<Omit<Website, 'id'>>) => void;
    website: Website | null;
    categories: Category[];
}

const EditWebsiteModal: React.FC<EditWebsiteModalProps> = ({ isOpen, onClose, onUpdate, website, categories }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [url, setUrl] = useState('');

    useEffect(() => {
        if (website) {
            setTitle(website.title);
            setDescription(website.description);
            setCategoryId(website.categoryId);
            setUrl(website.url);
        }
    }, [website]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim() && title.trim() && categoryId && website) {
            onUpdate(website.id, {
                url: url.trim(),
                title: title.trim(),
                description: description.trim(),
                categoryId,
            });
            onClose();
        }
    };

    if (!isOpen || !website) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 transition-opacity" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg m-4 transform transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">웹사이트 정보 수정</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <CloseIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="edit-website-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            URL
                        </label>
                        <input
                            type="url"
                            id="edit-website-url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="edit-website-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            제목
                        </label>
                        <input
                            type="text"
                            id="edit-website-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-website-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                           설명
                        </label>
                        <textarea
                            id="edit-website-description"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-website-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            카테고리
                        </label>
                        <select
                            id="edit-website-category"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md text-gray-900 dark:text-white"
                            required
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            저장
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditWebsiteModal;