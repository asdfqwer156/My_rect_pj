import React, { useState } from 'react';
import { Category } from '../types';
import { PlusIcon, EditIcon, TrashIcon } from './IconComponents';

interface NavigationBarProps {
    categories: Category[];
    selectedCategoryId: string;
    onSelectCategory: (id: string) => void;
    onOpenAddCategoryModal: () => void;
    onDeleteCategory: (id: string) => void;
    onStartEditCategory: (category: Category) => void;
    onDropWebsite: (targetCategoryId: string, e: React.DragEvent) => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
    categories,
    selectedCategoryId,
    onSelectCategory,
    onOpenAddCategoryModal,
    onDeleteCategory,
    onStartEditCategory,
    onDropWebsite,
}) => {
    const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null);

    const handleDragOver = (e: React.DragEvent, categoryId: string) => {
        e.preventDefault();
        setIsDraggingOver(categoryId);
    };

    const handleDragLeave = () => {
        setIsDraggingOver(null);
    };
    
    const handleDrop = (e: React.DragEvent, categoryId: string) => {
        e.preventDefault();
        onDropWebsite(categoryId, e);
        setIsDraggingOver(null);
    };

    const baseTabClasses = "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900";
    const inactiveTabClasses = "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700";
    const activeTabClasses = "bg-primary-600 text-white shadow-md";

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-[72px] z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2 py-3 overflow-x-auto">
                    <button
                        onClick={() => onSelectCategory('all')}
                        className={`${baseTabClasses} ${selectedCategoryId === 'all' ? activeTabClasses : inactiveTabClasses}`}
                    >
                        전체 보기
                    </button>

                    {categories.map(category => (
                        <div key={category.id} className="relative group flex-shrink-0">
                            <button
                                onClick={() => onSelectCategory(category.id)}
                                onDragOver={(e) => handleDragOver(e, category.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, category.id)}
                                className={`${baseTabClasses} ${selectedCategoryId === category.id ? activeTabClasses : inactiveTabClasses} ${isDraggingOver === category.id ? 'ring-2 ring-primary-500 scale-105' : ''}`}
                            >
                                {category.name}
                            </button>
                            <div className="absolute top-1/2 -translate-y-1/2 right-1 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button onClick={() => onStartEditCategory(category)} className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white"><EditIcon/></button>
                                <button onClick={() => onDeleteCategory(category.id)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon/></button>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={onOpenAddCategoryModal}
                        className="ml-2 flex-shrink-0 flex items-center justify-center h-9 w-9 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-primary-500 hover:text-white transition-colors"
                        aria-label="새 카테고리 추가"
                    >
                       <PlusIcon />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default NavigationBar;