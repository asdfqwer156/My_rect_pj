import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import NavigationBar from './components/NavigationBar';
import WebsiteCard from './components/WebsiteCard';
import Footer from './components/Footer';
import AddCategoryModal from './components/AddCategoryModal';
import EditCategoryModal from './components/EditCategoryModal';
import CreateWebsiteModal from './components/CreateWebsiteModal';
import EditWebsiteModal from './components/EditWebsiteModal';
import { EmptyStateIcon } from './components/IconComponents';
import { Category, Website } from './types';

const App: React.FC = () => {
    // State management
    const [categories, setCategories] = useState<Category[]>(() => {
        try {
            const saved = localStorage.getItem('categories');
            return saved ? JSON.parse(saved) : [{ id: '1', name: '일반' }];
        } catch (error) {
            return [{ id: '1', name: '일반' }];
        }
    });
    const [websites, setWebsites] = useState<Website[]>(() => {
        try {
            const saved = localStorage.getItem('websites');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            return [];
        }
    });
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

    // Modal states
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isAddCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
    const [isEditCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isEditWebsiteModalOpen, setEditWebsiteModalOpen] = useState(false);
    const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);

    // Persist data to localStorage
    useEffect(() => {
        localStorage.setItem('categories', JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        localStorage.setItem('websites', JSON.stringify(websites));
    }, [websites]);

    // Category handlers
    const handleAddCategory = (name: string) => {
        const newCategory: Category = { id: crypto.randomUUID(), name };
        setCategories(prev => [...prev, newCategory]);
    };

    const handleDeleteCategory = (id: string) => {
        if (categories.length <= 1) {
            alert('최소 한 개의 카테고리는 유지해야 합니다.');
            return;
        }
        if (window.confirm("정말로 이 카테고리를 삭제하시겠습니까? 카테고리에 속한 웹사이트들은 '일반' 카테고리로 이동됩니다.")) {
            const generalCategory = categories.find(c => c.name === '일반') || categories.find(c => c.id !== id);
            if (!generalCategory) return; // Should not happen if categories.length > 1
            
            setWebsites(prev => prev.map(w => w.categoryId === id ? { ...w, categoryId: generalCategory.id } : w));
            setCategories(prev => prev.filter(c => c.id !== id));
            if (selectedCategoryId === id) {
                setSelectedCategoryId('all');
            }
        }
    };

    const handleStartEditCategory = (category: Category) => {
        setEditingCategory(category);
        setEditCategoryModalOpen(true);
    };

    const handleUpdateCategory = (id: string, name: string) => {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c));
    };

    // Website handlers
    const handleAddWebsite = (websiteData: Omit<Website, 'id'>) => {
        const newWebsite: Website = { id: crypto.randomUUID(), ...websiteData };
        setWebsites(prev => [...prev, newWebsite]);
    };

    const handleDeleteWebsite = (id: string) => {
        if (window.confirm('정말로 이 웹사이트를 삭제하시겠습니까?')) {
            setWebsites(prev => prev.filter(w => w.id !== id));
        }
    };

    const handleStartEditWebsite = (website: Website) => {
        setEditingWebsite(website);
        setEditWebsiteModalOpen(true);
    };

    const handleUpdateWebsite = (id: string, websiteData: Partial<Omit<Website, 'id'>>) => {
        setWebsites(prev => prev.map(w => w.id === id ? { ...w, ...websiteData } : w));
    };
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, websiteId: string) => {
        e.dataTransfer.setData("websiteId", websiteId);
    };
    
    const handleDropWebsite = (targetCategoryId: string, e: React.DragEvent) => {
        const websiteId = e.dataTransfer.getData("websiteId");
        if (websiteId && targetCategoryId !== 'all') {
            setWebsites(prev => prev.map(w => w.id === websiteId ? { ...w, categoryId: targetCategoryId } : w));
        }
    };

    // Filtering logic
    const filteredWebsites = useMemo(() => {
        if (selectedCategoryId === 'all') {
            return websites;
        }
        return websites.filter(website => website.categoryId === selectedCategoryId);
    }, [websites, selectedCategoryId]);

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col font-sans">
            <Header 
                onOpenCreateModal={() => setCreateModalOpen(true)}
                isCreateDisabled={categories.length === 0}
            />
            <NavigationBar
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
                onOpenAddCategoryModal={() => setAddCategoryModalOpen(true)}
                onDeleteCategory={handleDeleteCategory}
                onStartEditCategory={handleStartEditCategory}
                onDropWebsite={handleDropWebsite}
            />
            
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {filteredWebsites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredWebsites.map(website => (
                            <WebsiteCard
                                key={website.id}
                                website={website}
                                onDelete={handleDeleteWebsite}
                                onStartEdit={handleStartEditWebsite}
                                onDragStart={handleDragStart}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <EmptyStateIcon />
                        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">웹사이트 없음</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {selectedCategoryId === 'all' 
                                ? "새 웹사이트를 추가하여 시작하세요." 
                                : "이 카테고리에는 웹사이트가 없습니다."}
                        </p>
                    </div>
                )}
            </main>

            <Footer />

            {/* Modals */}
            <AddCategoryModal
                isOpen={isAddCategoryModalOpen}
                onClose={() => setAddCategoryModalOpen(false)}
                onAdd={handleAddCategory}
            />
            <EditCategoryModal
                isOpen={isEditCategoryModalOpen}
                onClose={() => { setEditCategoryModalOpen(false); setEditingCategory(null); }}
                onUpdate={handleUpdateCategory}
                category={editingCategory}
            />
            <CreateWebsiteModal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onAdd={handleAddWebsite}
                categories={categories}
            />
            <EditWebsiteModal
                isOpen={isEditWebsiteModalOpen}
                onClose={() => { setEditWebsiteModalOpen(false); setEditingWebsite(null); }}
                onUpdate={handleUpdateWebsite}
                website={editingWebsite}
                categories={categories}
            />
        </div>
    );
};

export default App;
