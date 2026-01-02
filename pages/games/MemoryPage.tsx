
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../../components/IconComponents';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
const EMOJIS = ['🍎', '🍌', '🍇', '🍉', '🍒', '🍓', '🍍', '🥝', '🥑', '🥦', '🥕', '🌽', '🍕', '🍔', '🍟', '🍦', '🍩', '🍪'];

const MemoryPage: React.FC = () => {
    const navigate = useNavigate();
    const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
    const [cards, setCards] = useState<any[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [attempts, setAttempts] = useState(0);
    const [best, setBest] = useState(Infinity);

    const config = {
        EASY: { count: 6, cols: 3 },
        MEDIUM: { count: 8, cols: 4 },
        HARD: { count: 12, cols: 4 }
    };

    useEffect(() => {
        const saved = localStorage.getItem(`best_memory_${difficulty}`);
        setBest(saved ? parseInt(saved) : Infinity);
        initGame(difficulty);
    }, [difficulty]);

    const initGame = (d: Difficulty) => {
        const { count } = config[d];
        const selectedEmojis = EMOJIS.slice(0, count);
        const gameCards = [...selectedEmojis, ...selectedEmojis]
            .sort(() => Math.random() - 0.5)
            .map(emoji => ({ emoji, flipped: false, solved: false }));
        setCards(gameCards);
        setSelected([]);
        setAttempts(0);
    };

    useEffect(() => {
        if (selected.length === 2) {
            setAttempts(a => a + 1);
            const [first, second] = selected;
            if (cards[first].emoji === cards[second].emoji) {
                setCards(prev => prev.map((c, i) => i === first || i === second ? { ...c, solved: true } : c));
                setSelected([]);
            } else {
                setTimeout(() => {
                    setCards(prev => prev.map((c, i) => i === first || i === second ? { ...c, flipped: false } : c));
                    setSelected([]);
                }, 800);
            }
        }
    }, [selected, cards]);

    useEffect(() => {
        if (cards.length > 0 && cards.every(c => c.solved)) {
            if (attempts < best) {
                setBest(attempts);
                localStorage.setItem(`best_memory_${difficulty}`, attempts.toString());
            }
        }
    }, [cards, attempts, best, difficulty]);

    const handleCardClick = (index: number) => {
        if (selected.length < 2 && !cards[index].flipped && !cards[index].solved) {
            setCards(prev => prev.map((c, i) => i === index ? { ...c, flipped: true } : c));
            setSelected(prev => [...prev, index]);
        }
    };

    return (
        <div className="flex flex-col items-center p-4 bg-gray-950 min-h-screen text-white rounded-xl">
            <div className="flex w-full justify-between items-center max-w-md mb-6">
                <button onClick={() => navigate('/')} className="p-2 bg-gray-800 rounded-full"><ArrowLeftIcon /></button>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-pink-400">MEMORY MATCH</h1>
                    <p className="text-[10px] text-gray-500 font-mono">BEST ATTEMPTS: {best === Infinity ? '-' : best}</p>
                </div>
                <span className="text-xl font-mono text-pink-400">{attempts}</span>
            </div>

            <div className="flex gap-2 mb-8">
                {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map(d => (
                    <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${difficulty === d ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-gray-800 text-gray-500'}`}
                    >
                        {d}
                    </button>
                ))}
            </div>
            
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${config[difficulty].cols}, minmax(0, 1fr))` }}>
                {cards.map((card, i) => (
                    <div
                        key={i}
                        onClick={() => handleCardClick(i)}
                        className={`w-20 h-24 flex items-center justify-center text-3xl cursor-pointer rounded-2xl transition-all duration-300 transform preserve-3d ${card.flipped || card.solved ? 'bg-white rotate-y-0' : 'bg-pink-600 rotate-y-180 shadow-lg shadow-pink-500/30 border-b-4 border-pink-900'}`}
                    >
                        {(card.flipped || card.solved) ? card.emoji : '❓'}
                    </div>
                ))}
            </div>

            {cards.length > 0 && cards.every(c => c.solved) && (
                <button onClick={() => initGame(difficulty)} className="mt-10 px-10 py-4 bg-pink-600 rounded-2xl font-black text-xl animate-bounce shadow-xl">PLAY AGAIN</button>
            )}
        </div>
    );
};

export default MemoryPage;
