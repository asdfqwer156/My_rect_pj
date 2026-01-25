
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

    const baseTabClasses = "px-6 py-2.5 text-xs font-bold rounded-full transition-all duration-300 focus:outline-none relative whitespace-nowrap";
    const inactiveTabClasses = "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white";
    const activeTabClasses = "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl shadow-gray-200 dark:shadow-none scale-105";

    return (
        <nav className="bg-transparent sticky top-[84px] z-20 pointer-events-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center gap-3 py-6 overflow-x-auto no-scrollbar pointer-events-auto">
                    <button
                        onClick={() => onSelectCategory('all')}
                        className={`${baseTabClasses} ${selectedCategoryId === 'all' ? activeTabClasses : inactiveTabClasses} uppercase tracking-widest`}
                    >
                        모든 카드
                    </button>

                    {categories.map(category => (
                        <div key={category.id} className="relative group flex-shrink-0">
                            <button
                                onClick={() => onSelectCategory(category.id)}
                                onDragOver={(e) => handleDragOver(e, category.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, category.id)}
                                className={`${baseTabClasses} ${selectedCategoryId === category.id ? activeTabClasses + " pr-16" : inactiveTabClasses} ${isDraggingOver === category.id ? 'ring-2 ring-primary-500' : ''} uppercase tracking-widest`}
                            >
                                {category.name}
                            </button>
                            {selectedCategoryId === category.id && (
                                <div className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onStartEditCategory(category); }} 
                                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                    >
                                        <EditIcon/>
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDeleteCategory(category.id); }} 
                                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <TrashIcon/>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    <button
                        onClick={onOpenAddCategoryModal}
                        className="flex-shrink-0 flex items-center justify-center h-10 w-10 bg-white dark:bg-gray-800 text-gray-400 rounded-full hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 transition-all shadow-md hover:shadow-lg active:scale-90"
                    >
                       <PlusIcon />
                    </button>
                </div>
            </div>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </nav>
    );
};

export default NavigationBar;
