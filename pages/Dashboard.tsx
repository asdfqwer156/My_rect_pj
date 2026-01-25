

import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import WebsiteCard from '../components/WebsiteCard';
import { EmptyStateIcon, GameControllerIcon, SparklesIcon } from '../components/IconComponents';
import { Category, Website } from '../types';

interface DashboardProps {
    categories: Category[];
    websites: Website[];
    selectedCategoryId: string;
    onSelectCategory: (id: string) => void;
    onOpenAddCategoryModal: () => void;
    onDeleteCategory: (id: string) => void;
    onStartEditCategory: (category: Category) => void;
    onDropWebsite: (targetCategoryId: string, e: React.DragEvent) => void;
    onDeleteWebsite: (id: string) => void;
    onStartEditWebsite: (website: Website) => void;
    onDragStartWebsite: (e: React.DragEvent, websiteId: string) => void;
}

const BUILT_IN_GAMES = [
    { id: 'yacht', title: 'Yacht Dice', path: '/yacht', gradient: 'from-indigo-600 to-purple-700', iconColor: 'text-indigo-200', label: 'Classic', scoreKey: 'yacht_highscore' },
    { id: 'brick-breaker', title: 'Brick Master', path: '/brick-breaker', gradient: 'from-cyan-500 to-blue-600', iconColor: 'text-cyan-100', label: 'Arcade', scoreKey: 'brick_breaker_highscore' },
    { id: 'snake', title: 'Classic Snake', path: '/snake', gradient: 'from-gray-700 to-gray-900', iconColor: 'text-gray-200', label: 'Retro', scoreKey: 'snake_highscore' },
    { id: 'memory', title: 'Memory Cards', path: '/memory', gradient: 'from-rose-500 to-pink-600', iconColor: 'text-rose-100', label: 'Puzzle', scoreKey: 'best_memory_EASY', unit: '회' },
    { id: 'tictactoe', title: 'Tic Tac Toe', path: '/tictactoe', gradient: 'from-gray-200 to-gray-400', iconColor: 'text-gray-600', label: 'Strategy', scoreKey: 'tictactoe_wins', unit: '승' },
    { id: 'mole', title: 'Whack A Mole', path: '/mole', gradient: 'from-amber-400 to-orange-600', iconColor: 'text-amber-100', label: 'Action', scoreKey: 'highScore_mole_MEDIUM' },
    { id: 'clicker', title: 'Hyper Clicker', path: '/clicker', gradient: 'from-red-500 to-rose-700', iconColor: 'text-red-100', label: 'Speed', scoreKey: 'clicker_highscore' },
    { id: 'rps', title: 'Rock Paper Scissors', path: '/rps', gradient: 'from-violet-500 to-fuchsia-700', iconColor: 'text-violet-100', label: 'Luck', scoreKey: 'rps_wins', unit: '승' },
    { id: 'guess', title: 'Number Guess', path: '/guess', gradient: 'from-orange-500 to-red-600', iconColor: 'text-orange-100', label: 'Logic', scoreKey: 'best_guess_MEDIUM', unit: '회' },
    { id: 'simon', title: 'Simon Echo', path: '/simon', gradient: 'from-gray-800 to-black', iconColor: 'text-gray-100', label: 'Memory', scoreKey: 'simon_highscore' },
    { id: 'color', title: 'Color Match', path: '/color', gradient: 'from-pink-500 to-rose-800', iconColor: 'text-pink-100', label: 'Reflex', scoreKey: 'color_match_highscore' },
    { id: 'minesweeper', title: 'Mine Sweeper', path: '/minesweeper', gradient: 'from-gray-400 to-gray-600', iconColor: 'text-gray-100', label: 'Brain', scoreKey: 'mines_wins_EASY', unit: '승' },
    { id: 'key-master', title: 'Key Master', path: '/key-master', gradient: 'from-slate-600 to-gray-900', iconColor: 'text-slate-100', label: 'Typing', scoreKey: 'highScore_keymaster_alpha_MEDIUM' },
    { id: 'behold', title: '우리가 보는 것', path: '/behold', gradient: 'from-stone-700 to-neutral-900', iconColor: 'text-stone-200', label: '사회 실험' },
    { id: 'calculator', title: '공룡 달리기', path: '/calculator', gradient: 'from-gray-700 to-gray-900', iconColor: 'text-gray-200', label: '아케이드', scoreKey: 'dino_highscore' },
];

const Dashboard: React.FC<DashboardProps> = (props) => {
    const navigate = useNavigate();
    const [highScores, setHighScores] = useState<Record<string, string>>({});

    useEffect(() => {
        const scores: Record<string, string> = {};
        BUILT_IN_GAMES.forEach(game => {
            if (game.scoreKey) {
                const val = localStorage.getItem(game.scoreKey);
                scores[game.id] = val || '0';
            }
        });
        setHighScores(scores);
    }, []);

    const filteredWebsites = useMemo(() => {
        if (props.selectedCategoryId === 'all') return props.websites;
        return props.websites.filter(w => w.categoryId === props.selectedCategoryId);
    }, [props.websites, props.selectedCategoryId]);

    const activeCategoryName = useMemo(() => {
        if (props.selectedCategoryId === 'all') return '모든 카드';
        const cat = props.categories.find(c => c.id === props.selectedCategoryId);
        if (!cat) return '선택된 항목';
        // '게임' 카테고리일 경우 영어인 'GAME'으로 변경
        if (cat.name === '게임') return 'GAME';
        return cat.name;
    }, [props.selectedCategoryId, props.categories]);

    // 게임 섹션을 보여줄 조건
    const showGames = props.selectedCategoryId === 'all' || 
                      props.categories.find(c => c.id === props.selectedCategoryId)?.name === '일반' ||
                      props.categories.find(c => c.id === props.selectedCategoryId)?.name === '게임';

    return (
        <div className="space-y-20 pb-20">
            <NavigationBar
                categories={props.categories}
                selectedCategoryId={props.selectedCategoryId}
                onSelectCategory={props.onSelectCategory}
                onOpenAddCategoryModal={props.onOpenAddCategoryModal}
                onDeleteCategory={props.onDeleteCategory}
                onStartEditCategory={props.onStartEditCategory}
                onDropWebsite={props.onDropWebsite}
            />

            {/* Built-in Games Section */}
            {showGames && (
                <section key={`games-${props.selectedCategoryId}`} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex flex-col items-center mb-12">
                        <div className="flex items-center gap-3 text-gray-900 dark:text-white mb-2">
                            <GameControllerIcon />
                            <h2 className="text-3xl font-black tracking-tight uppercase">
                                {activeCategoryName}
                            </h2>
                        </div>
                        <div className="h-1 w-20 bg-gray-900 dark:bg-white rounded-full"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {BUILT_IN_GAMES.map(game => (
                            <div 
                                key={game.id} 
                                onClick={() => navigate(game.path)} 
                                className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer flex flex-col h-full border border-gray-100 dark:border-gray-700"
                            >
                                <div className={`h-48 bg-gradient-to-br ${game.gradient} flex items-center justify-center relative`}>
                                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.5),transparent)]"></div>
                                    <div className={`${game.iconColor} transform group-hover:scale-125 group-hover:rotate-6 transition-all duration-700 ease-out z-10 drop-shadow-2xl`}>
                                        <GameControllerIcon />
                                    </div>
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/20">
                                        {game.label}
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
                                </div>

                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 tracking-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors h-14 flex items-center">
                                        {game.title}
                                    </h3>
                                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50 dark:border-gray-700">
                                        {game.scoreKey ? (
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">High Score</span>
                                                <span className="text-sm font-black text-gray-700 dark:text-gray-300 font-mono">
                                                    {highScores[game.id] === 'Infinity' ? '-' : highScores[game.id]}{game.unit || ''}
                                                </span>
                                            </div>
                                        ) : <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest">플레이하기</div> }
                                        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center group-hover:bg-gray-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-gray-900 transition-all duration-300 shadow-sm">
                                            <SparklesIcon />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Personal Website Blocks Section */}
            {props.selectedCategoryId !== 'all' && (
                <section key={`blocks-${props.selectedCategoryId}`} className="pt-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="flex flex-col items-center mb-12">
                        <div className="flex items-center gap-3 text-gray-900 dark:text-white mb-2">
                            <SparklesIcon />
                            <h2 className="text-3xl font-black tracking-tight uppercase">
                                {activeCategoryName}
                            </h2>
                        </div>
                        <div className="h-1 w-20 bg-gray-900 dark:bg-white rounded-full"></div>
                    </div>
                    
                    {filteredWebsites.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredWebsites.map(website => (
                                <div key={website.id} className="hover:scale-[1.02] transition-transform duration-500">
                                    <WebsiteCard
                                        website={website}
                                        onDelete={props.onDeleteWebsite}
                                        onStartEdit={props.onStartEditWebsite}
                                        onDragStart={props.onDragStartWebsite}
                                        onView={() => navigate(`/view/${website.id}`)}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        !showGames && (
                            <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-inner">
                                <EmptyStateIcon />
                                <h3 className="mt-6 text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">No Content Found</h3>
                                <p className="text-gray-500 mt-2 text-sm font-medium">Create your first block to start your journey.</p>
                            </div>
                        )
                    )}
                </section>
            )}
        </div>
    );
};
export default Dashboard;