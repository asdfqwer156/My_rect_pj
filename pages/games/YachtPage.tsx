
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../../components/IconComponents';

type ScoreCategory = 
    | 'Aces' | 'Deuces' | 'Threes' | 'Fours' | 'Fives' | 'Sixes' 
    | '3 of a Kind' | '4 of a Kind' | 'Full House' | 'S. Straight' | 'L. Straight' | 'Choice' | 'Yacht';

interface Scores {
    [key: string]: number | null;
}

const DICE_ICONS = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const CATEGORY_DESCRIPTIONS: Record<ScoreCategory, string> = {
    Aces: "1의 눈의 합",
    Deuces: "2의 눈의 합",
    Threes: "3의 눈의 합",
    Fours: "4의 눈의 합",
    Fives: "5의 눈의 합",
    Sixes: "6의 눈의 합",
    '3 of a Kind': "동일한 눈이 3개 이상일 때 주사위 5개의 합",
    '4 of a Kind': "동일한 눈이 4개 이상일 때 주사위 5개의 합",
    'Full House': "동일한 눈 3개와 2개가 모였을 때 주사위 5개의 합",
    'S. Straight': "이어지는 눈이 4개 이상 (15점)",
    'L. Straight': "이어지는 눈이 5개 (30점)",
    Choice: "주사위 5개의 총합",
    Yacht: "동일한 눈이 5개 (50점)"
};

const INITIAL_SCORES: Scores = {
    Aces: null, Deuces: null, Threes: null, Fours: null, Fives: null, Sixes: null,
    '3 of a Kind': null, '4 of a Kind': null, 'Full House': null, 'S. Straight': null, 'L. Straight': null, Choice: null, Yacht: null
};

const YachtPage: React.FC = () => {
    const navigate = useNavigate();
    const [dice, setDice] = useState<number[]>([1, 1, 1, 1, 1]);
    const [keep, setKeep] = useState<boolean[]>([false, false, false, false, false]);
    const [rollsLeft, setRollsLeft] = useState(3);
    const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
    const [p1Scores, setP1Scores] = useState<Scores>({ ...INITIAL_SCORES });
    const [p2Scores, setP2Scores] = useState<Scores>({ ...INITIAL_SCORES });
    const [p1YachtBonus, setP1YachtBonus] = useState(0);
    const [p2YachtBonus, setP2YachtBonus] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<ScoreCategory | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState<number | 'Tie'>(0);
    const [isRolling, setIsRolling] = useState(false);

    const rollDice = () => {
        if (rollsLeft === 0 || isRolling) return;
        setIsRolling(true);
        setSelectedCategory(null);
        let count = 0;
        const interval = setInterval(() => {
            setDice(prev => prev.map((d, i) => keep[i] ? d : Math.floor(Math.random() * 6) + 1));
            count++;
            if (count > 8) {
                clearInterval(interval);
                setIsRolling(false);
                setRollsLeft(prev => prev - 1);
            }
        }, 50);
    };

    const toggleKeep = (index: number) => {
        if (rollsLeft === 3 || gameOver || isRolling) return;
        setKeep(prev => {
            const next = [...prev];
            next[index] = !next[index];
            return next;
        });
    };

    const calculatePoints = (category: ScoreCategory, diceArr: number[]): number => {
        const counts = Array(7).fill(0);
        diceArr.forEach(d => counts[d]++);
        const sum = diceArr.reduce((a, b) => a + b, 0);
        const sortedUnique = Array.from(new Set(diceArr)).sort((a, b) => a - b).join('');

        switch (category) {
            case 'Aces': return counts[1] * 1;
            case 'Deuces': return counts[2] * 2;
            case 'Threes': return counts[3] * 3;
            case 'Fours': return counts[4] * 4;
            case 'Fives': return counts[5] * 5;
            case 'Sixes': return counts[6] * 6;
            case 'Choice': return sum;
            case '3 of a Kind': return counts.some(c => c >= 3) ? sum : 0;
            case '4 of a Kind': return counts.some(c => c >= 4) ? sum : 0;
            case 'Full House':
                const cList = Object.values(counts).filter(c => c > 0).sort();
                return (cList.length === 2 && cList[0] === 2 && cList[1] === 3) || cList.includes(5) ? sum : 0;
            case 'S. Straight':
                return sortedUnique.includes('1234') || sortedUnique.includes('2345') || sortedUnique.includes('3456') ? 15 : 0;
            case 'L. Straight':
                return sortedUnique === '12345' || sortedUnique === '23456' ? 30 : 0;
            case 'Yacht': return counts.some(c => c === 5) ? 50 : 0;
            default: return 0;
        }
    };

    const confirmScore = () => {
        if (!selectedCategory) return;
        const points = calculatePoints(selectedCategory, dice);
        const isCurrentlyYacht = calculatePoints('Yacht', dice) === 50;
        const currentScores = currentPlayer === 1 ? p1Scores : p2Scores;
        if (isCurrentlyYacht && currentScores['Yacht'] === 50) {
            if (currentPlayer === 1) setP1YachtBonus(p => p + 1);
            else setP2YachtBonus(p => p + 1);
        }
        if (currentPlayer === 1) {
            const next = { ...p1Scores, [selectedCategory]: points };
            setP1Scores(next);
            checkNext(next, p2Scores);
        } else {
            const next = { ...p2Scores, [selectedCategory]: points };
            setP2Scores(next);
            checkNext(p1Scores, next);
        }
    };

    const checkNext = (s1: Scores, s2: Scores) => {
        if (Object.values(s1).every(v => v !== null) && Object.values(s2).every(v => v !== null)) {
            const t1 = calculateTotal(s1, 1);
            const t2 = calculateTotal(s2, 2);
            setWinner(t1 > t2 ? 1 : t1 < t2 ? 2 : 'Tie');
            setGameOver(true);
        } else {
            setCurrentPlayer(prev => prev === 1 ? 2 : 1);
            setRollsLeft(3);
            setKeep([false, false, false, false, false]);
            setDice([1, 1, 1, 1, 1]);
            setSelectedCategory(null);
        }
    };

    const calculateSubtotal = (s: Scores) => {
        const subCats: ScoreCategory[] = ['Aces', 'Deuces', 'Threes', 'Fours', 'Fives', 'Sixes'];
        return subCats.reduce((acc, c) => acc + (s[c] || 0), 0);
    };

    const calculateTotal = (s: Scores, p: 1 | 2) => {
        const sub = calculateSubtotal(s);
        const bonus = sub >= 63 ? 35 : 0;
        const yBonus = (p === 1 ? p1YachtBonus : p2YachtBonus) * 100;
        const rest: ScoreCategory[] = ['3 of a Kind', '4 of a Kind', 'Full House', 'S. Straight', 'L. Straight', 'Choice', 'Yacht'];
        return sub + bonus + yBonus + rest.reduce((acc, c) => acc + (s[c] || 0), 0);
    };

    const renderScoreRow = (cat: ScoreCategory, pNum: 1 | 2) => {
        const isTurn = currentPlayer === pNum;
        const scores = pNum === 1 ? p1Scores : p2Scores;
        const filled = scores[cat] !== null;
        const selected = selectedCategory === cat;
        const preview = calculatePoints(cat, dice);
        return (
            <tr key={cat} onClick={() => isTurn && !filled && setSelectedCategory(cat)} title={CATEGORY_DESCRIPTIONS[cat]}
                className={`h-7 border-b border-white/5 cursor-pointer transition-all group/row ${filled ? (pNum === 1 ? 'text-blue-400' : 'text-red-400') : selected ? 'bg-white/20 text-white' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}>
                <td className="px-2 text-left text-[10px] font-bold truncate flex items-center gap-1">
                    {cat} <span className="opacity-0 group-hover/row:opacity-100 text-[8px] bg-gray-700 px-1 rounded text-white">?</span>
                </td>
                <td className="px-2 text-right font-mono text-[11px]">
                    {filled ? scores[cat] : (isTurn && rollsLeft < 3 ? <span className="opacity-30">{preview}</span> : '-')}
                </td>
            </tr>
        );
    };

    return (
        <div className={`flex flex-col items-center p-4 min-h-screen text-white rounded-xl font-sans transition-all duration-700`}
             style={{ background: currentPlayer === 1 ? 'radial-gradient(circle, #1e3a8a 0%, #0a192f 100%)' : 'radial-gradient(circle, #7f1d1d 0%, #1a0b0b 100%)' }}>
            <div className="flex w-full justify-between items-center max-w-5xl mb-6">
                <button onClick={() => navigate('/')} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"><ArrowLeftIcon /></button>
                <div className="text-center">
                    <h1 className="text-4xl font-black italic drop-shadow-2xl">YACHT BATTLE</h1>
                    <div className={`mt-2 px-6 py-1 rounded-full text-[10px] font-black border ${currentPlayer === 1 ? 'border-blue-400 text-blue-400 bg-blue-400/10' : 'border-red-400 text-red-400 bg-red-400/10'}`}>PLAYER {currentPlayer} TURN</div>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl items-start">
                {/* P1 Scoreboard */}
                <div className={`flex-1 transition-all ${currentPlayer === 1 ? 'opacity-100 scale-100' : 'opacity-40 scale-95 blur-[1px]'}`}>
                    <div className="p-4 rounded-3xl border border-white/10 bg-gray-900/90 shadow-2xl">
                        <h3 className="text-center font-black text-sm mb-3 text-blue-400 tracking-tighter">PLAYER 1</h3>
                        <table className="w-full">
                            <tbody>
                                {(['Aces', 'Deuces', 'Threes', 'Fours', 'Fives', 'Sixes'] as ScoreCategory[]).map(c => renderScoreRow(c, 1))}
                                <tr className="bg-white/5 h-8 text-[9px] uppercase"><td className="px-2">Subtotal ({calculateSubtotal(p1Scores)}/63)</td><td className="px-2 text-right font-bold">{calculateSubtotal(p1Scores)} {calculateSubtotal(p1Scores) >= 63 ? '(+35)' : ''}</td></tr>
                                {(['3 of a Kind', '4 of a Kind', 'Full House', 'S. Straight', 'L. Straight', 'Choice', 'Yacht'] as ScoreCategory[]).map(c => renderScoreRow(c, 1))}
                                {p1YachtBonus > 0 && <tr className="text-yellow-400 italic bg-yellow-400/5 h-7"><td className="px-2 text-[9px]">Yacht Bonus</td><td className="px-2 text-right">+{p1YachtBonus * 100}</td></tr>}
                            </tbody>
                        </table>
                        <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-blue-400"><span className="text-[10px] font-black">TOTAL</span><span className="text-2xl font-black">{calculateTotal(p1Scores, 1)}</span></div>
                    </div>
                </div>

                {/* Center Area */}
                <div className="flex-[1.8] w-full flex flex-col items-center justify-center space-y-12">
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex justify-center gap-4">{[0, 1, 2].map(i => (
                            <div key={i} onClick={() => toggleKeep(i)} className={`w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center text-5xl sm:text-6xl font-black transition-all cursor-pointer shadow-xl ${keep[i] ? `ring-4 ${currentPlayer === 1 ? 'ring-blue-500' : 'ring-red-500'} scale-90 translate-y-2` : 'hover:scale-105'} ${isRolling && !keep[i] ? 'animate-bounce' : ''}`}>
                                <span className={keep[i] ? (currentPlayer === 1 ? 'text-blue-700' : 'text-red-700') : 'text-gray-900'}>{DICE_ICONS[dice[i]]}</span>
                            </div>
                        ))}</div>
                        <div className="flex justify-center gap-4">{[3, 4].map(i => (
                            <div key={i} onClick={() => toggleKeep(i)} className={`w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center text-5xl sm:text-6xl font-black transition-all cursor-pointer shadow-xl ${keep[i] ? `ring-4 ${currentPlayer === 1 ? 'ring-blue-500' : 'ring-red-500'} scale-90 translate-y-2` : 'hover:scale-105'} ${isRolling && !keep[i] ? 'animate-bounce' : ''}`}>
                                <span className={keep[i] ? (currentPlayer === 1 ? 'text-blue-700' : 'text-red-700') : 'text-gray-900'}>{DICE_ICONS[dice[i]]}</span>
                            </div>
                        ))}</div>
                    </div>
                    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
                        <div className="text-sm font-mono text-white/50 tracking-widest uppercase">Rolls Left: <span className="text-white font-black">{rollsLeft}</span></div>
                        <div className="flex gap-4 w-full">
                            <button onClick={rollDice} disabled={rollsLeft === 0 || isRolling || gameOver} className={`flex-1 py-5 rounded-3xl font-black text-xl transition-all shadow-xl active:scale-95 border-b-4 ${rollsLeft === 0 || isRolling || gameOver ? 'bg-gray-800 border-gray-900 text-gray-600' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'}`}>{isRolling ? '...' : 'ROLL'}</button>
                            <button onClick={confirmScore} disabled={!selectedCategory || isRolling || gameOver} className={`flex-[1.5] py-5 rounded-3xl font-black text-xl transition-all shadow-2xl active:scale-95 ${!selectedCategory || isRolling || gameOver ? 'bg-gray-800 text-gray-600' : `${currentPlayer === 1 ? 'bg-blue-600 hover:bg-blue-500' : 'bg-red-600 hover:bg-red-500'} text-white animate-pulse`}`}>{selectedCategory ? 'CONFIRM' : 'SELECT SLOT'}</button>
                        </div>
                    </div>
                </div>

                {/* P2 Scoreboard */}
                <div className={`flex-1 transition-all ${currentPlayer === 2 ? 'opacity-100 scale-100' : 'opacity-40 scale-95 blur-[1px]'}`}>
                    <div className="p-4 rounded-3xl border border-white/10 bg-gray-900/90 shadow-2xl">
                        <h3 className="text-center font-black text-sm mb-3 text-red-400 tracking-tighter">PLAYER 2</h3>
                        <table className="w-full">
                            <tbody>
                                {(['Aces', 'Deuces', 'Threes', 'Fours', 'Fives', 'Sixes'] as ScoreCategory[]).map(c => renderScoreRow(c, 2))}
                                <tr className="bg-white/5 h-8 text-[9px] uppercase"><td className="px-2">Subtotal ({calculateSubtotal(p2Scores)}/63)</td><td className="px-2 text-right font-bold">{calculateSubtotal(p2Scores)} {calculateSubtotal(p2Scores) >= 63 ? '(+35)' : ''}</td></tr>
                                {(['3 of a Kind', '4 of a Kind', 'Full House', 'S. Straight', 'L. Straight', 'Choice', 'Yacht'] as ScoreCategory[]).map(c => renderScoreRow(c, 2))}
                                {p2YachtBonus > 0 && <tr className="text-yellow-400 italic bg-yellow-400/5 h-7"><td className="px-2 text-[9px]">Yacht Bonus</td><td className="px-2 text-right">+{p2YachtBonus * 100}</td></tr>}
                            </tbody>
                        </table>
                        <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-red-400"><span className="text-[10px] font-black">TOTAL</span><span className="text-2xl font-black">{calculateTotal(p2Scores, 2)}</span></div>
                    </div>
                </div>
            </div>

            {gameOver && (
                <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 backdrop-blur-xl">
                    <div className={`bg-gray-900 p-12 rounded-[3rem] border-2 ${winner === 1 ? 'border-blue-500' : winner === 2 ? 'border-red-500' : 'border-gray-500'} text-center`}>
                        <h2 className="text-2xl font-black text-gray-500 mb-4 uppercase tracking-[0.5em]">FINISH</h2>
                        <div className={`text-7xl font-black mb-8 ${winner === 1 ? 'text-blue-400' : winner === 2 ? 'text-red-400' : 'text-white'}`}>{winner === 'Tie' ? "DRAW" : `P${winner} WIN`}</div>
                        <div className="flex justify-center gap-12 mb-12 text-3xl font-black font-mono"><div className="text-blue-400">P1: {calculateTotal(p1Scores, 1)}</div><div className="text-red-400">P2: {calculateTotal(p2Scores, 2)}</div></div>
                        <button onClick={() => window.location.reload()} className="w-full py-6 bg-white text-gray-950 font-black text-2xl rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all">REMATCH</button>
                    </div>
                </div>
            )}
            <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px) rotate(5deg); } } .animate-bounce { animation: bounce 0.15s infinite; }`}</style>
        </div>
    );
};
export default YachtPage;
