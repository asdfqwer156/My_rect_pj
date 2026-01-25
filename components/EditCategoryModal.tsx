import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { CloseIcon } from './IconComponents';

interface EditCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: string, name: string) => void;
    category: Category | null;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({ isOpen, onClose, onUpdate, category }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        if (category) {
            setName(category.name);
        }
    }, [category]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && category) {
            onUpdate(category.id, name.trim());
            onClose();
        }
    };

    if (!isOpen || !category) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 transition-opacity" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 transform transition-all">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">카테고리 이름 수정</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <CloseIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            카테고리 이름
                        </label>
                        <input
                            type="text"
                            id="category-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                            required
                        />
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

export default EditCategoryModal;