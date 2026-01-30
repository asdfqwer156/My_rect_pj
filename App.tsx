

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WebsiteViewPage from './pages/WebsiteViewPage';
import BrickBreakerPage from './pages/BrickBreakerPage';
import SnakePage from './pages/games/SnakePage';
import MemoryPage from './pages/games/MemoryPage';
import TicTacToePage from './pages/games/TicTacToePage';
import WhackAMolePage from './pages/games/WhackAMolePage';
import ClickSpeedPage from './pages/games/ClickSpeedPage';
import RPSPage from './pages/games/RPSPage';
import NumberGuessPage from './pages/games/NumberGuessPage';
import SimonSaysPage from './pages/games/SimonSaysPage';
import ColorMatchPage from './pages/games/ColorMatchPage';
import MinesweeperPage from './pages/games/MinesweeperPage';
import KeyMasterPage from './pages/games/KeyMasterPage';
import YachtPage from './pages/games/YachtPage';
import BeholdGamePage from './pages/games/behold/BeholdGamePage';
import CalculatorPage from './pages/CalculatorPage';
import ZenGardenPage from './pages/ZenGardenPage';

import AddCategoryModal from './components/AddCategoryModal';
import EditCategoryModal from './components/EditCategoryModal';
import CreateWebsiteModal from './components/CreateWebsiteModal';
import EditWebsiteModal from './components/EditWebsiteModal';
import { Category, Website } from './types';

const App: React.FC = () => {
    const audioContextRef = useRef<AudioContext | null>(null);

    const playSound = useCallback((type: 'add' | 'delete' | 'edit') => {
        try {
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContextClass) {
                    audioContextRef.current = new AudioContextClass();
                }
            }
            const audioContext = audioContextRef.current;
            if (!audioContext) return;
            if (audioContext.state === 'suspended') {
                audioContext.resume().catch(() => {});
            }
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);

            switch (type) {
                case 'add':
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    break;
                case 'delete':
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.01);
                    break;
                case 'edit':
                    oscillator.type = 'triangle';
                    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                    break;
            }
            oscillator.start(audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.1);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.error("Audio playback failed", error);
        }
    }, []);

    const [categories, setCategories] = useState<Category[]>(() => {
        try {
            const saved = localStorage.getItem('categories');
            return saved ? JSON.parse(saved) : [
                { id: '1', name: '일반' },
                { id: '2', name: '게임' }
            ];
        } catch (error) {
            return [{ id: '1', name: '일반' }, { id: '2', name: '게임' }];
        }
    });
    
    const [websites, setWebsites] = useState<Website[]>(() => {
        try {
            const saved = localStorage.getItem('websites');
            const parsed = saved ? JSON.parse(saved) : [];
            return parsed.map((w: any) => ({ ...w, url: w.url || '#' }));
        } catch (error) {
            return [];
        }
    });
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isAddCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
    const [isEditCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isEditWebsiteModalOpen, setEditWebsiteModalOpen] = useState(false);
    const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);

    useEffect(() => {
        localStorage.setItem('categories', JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        localStorage.setItem('websites', JSON.stringify(websites));
    }, [websites]);

    const handleAddCategory = useCallback((name: string) => {
        const newCategory: Category = { id: crypto.randomUUID(), name };
        setCategories(prev => [...prev, newCategory]);
        playSound('add');
    }, [playSound]);

    const handleDeleteCategory = useCallback((id: string) => {
        if (categories.length <= 1) {
            alert('최소 한 개의 카테고리는 유지해야 합니다.');
            return;
        }
        const targetCategory = categories.find(c => c.id !== id);
        if (!targetCategory) return;

        if (window.confirm(`정말로 이 카테고리를 삭제하시겠습니까? 카테고리에 속한 웹사이트들은 '${targetCategory.name}' 카테고리로 이동됩니다.`)) {
            setWebsites(prev => prev.map(w => w.categoryId === id ? { ...w, categoryId: targetCategory.id } : w));
            setCategories(prev => prev.filter(c => c.id !== id));
            if (selectedCategoryId === id) setSelectedCategoryId('all');
            playSound('delete');
        }
    }, [categories, selectedCategoryId, playSound]);

    const handleStartEditCategory = useCallback((category: Category) => {
        setEditingCategory(category);
        setEditCategoryModalOpen(true);
    }, []);

    const handleUpdateCategory = useCallback((id: string, name: string) => {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c));
        playSound('edit');
    }, [playSound]);

    const handleAddWebsite = useCallback((websiteData: Omit<Website, 'id'>) => {
        const newWebsite: Website = { id: crypto.randomUUID(), ...websiteData };
        setWebsites(prev => [...prev, newWebsite]);
        playSound('add');
    }, [playSound]);

    const handleDeleteWebsite = useCallback((id: string) => {
        if (window.confirm('정말로 이 웹사이트를 삭제하시겠습니까?')) {
            setWebsites(prev => prev.filter(w => w.id !== id));
            playSound('delete');
        }
    }, [playSound]);

    const handleStartEditWebsite = useCallback((website: Website) => {
        setEditingWebsite(website);
        setEditWebsiteModalOpen(true);
    }, []);

    const handleUpdateWebsite = useCallback((id: string, websiteData: Partial<Omit<Website, 'id'>>) => {
        setWebsites(prev => prev.map(w => w.id === id ? { ...w, ...websiteData } : w));
        playSound('edit');
    }, [playSound]);

    const handleDropWebsite = (targetCategoryId: string, e: React.DragEvent) => {
        const websiteId = e.dataTransfer.getData("websiteId");
        if (websiteId && targetCategoryId !== 'all') {
            setWebsites(prev => prev.map(w => {
                if (w.id === websiteId) {
                    playSound('edit');
                    return { ...w, categoryId: targetCategoryId };
                }
                return w;
            }));
        }
    };
    
    const handleDragStart = (e: React.DragEvent, websiteId: string) => {
        e.dataTransfer.setData("websiteId", websiteId);
    };

    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={
                    <Layout 
                        onOpenCreateModal={() => setCreateModalOpen(true)}
                        isCreateDisabled={categories.length === 0}
                    />
                }>
                    <Route index element={
                        <Dashboard
                            categories={categories}
                            websites={websites}
                            selectedCategoryId={selectedCategoryId}
                            onSelectCategory={setSelectedCategoryId}
                            onOpenAddCategoryModal={() => setAddCategoryModalOpen(true)}
                            onDeleteCategory={handleDeleteCategory}
                            onStartEditCategory={handleStartEditCategory}
                            onDropWebsite={handleDropWebsite}
                            onDeleteWebsite={handleDeleteWebsite}
                            onStartEditWebsite={handleStartEditWebsite}
                            onDragStartWebsite={handleDragStart}
                        />
                    } />
                    <Route path="brick-breaker" element={<BrickBreakerPage />} />
                    <Route path="snake" element={<SnakePage />} />
                    <Route path="memory" element={<MemoryPage />} />
                    <Route path="tictactoe" element={<TicTacToePage />} />
                    <Route path="mole" element={<WhackAMolePage />} />
                    <Route path="clicker" element={<ClickSpeedPage />} />
                    <Route path="rps" element={<RPSPage />} />
                    <Route path="guess" element={<NumberGuessPage />} />
                    <Route path="simon" element={<SimonSaysPage />} />
                    <Route path="color" element={<ColorMatchPage />} />
                    <Route path="minesweeper" element={<MinesweeperPage />} />
                    <Route path="key-master" element={<KeyMasterPage />} />
                    <Route path="yacht" element={<YachtPage />} />
                    <Route path="behold" element={<BeholdGamePage />} />
                    <Route path="calculator" element={<CalculatorPage />} />
                    <Route path="zen-garden" element={<ZenGardenPage />} />
                    <Route path="view/:id" element={<WebsiteViewPage websites={websites} />} />
                </Route>
            </Routes>

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
        </HashRouter>
    );
};

export default App;