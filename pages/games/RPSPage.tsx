
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../../components/IconComponents';

const CHOICES = [
    { name: 'Rock', icon: '✊' },
    { name: 'Paper', icon: '✋' },
    { name: 'Scissors', icon: '✌️' }
];

const RPSPage: React.FC = () => {
    const navigate = useNavigate();
    const [userChoice, setUserChoice] = useState<any>(null);
    const [aiChoice, setAiChoice] = useState<any>(null);
    const [result, setResult] = useState<string>('');
    const [scores, setScores] = useState({ user: 0, ai: 0 });
    const [totalWins, setTotalWins] = useState(0);

    useEffect(() => {
        const saved = localStorage.getItem('rps_wins');
        if (saved) setTotalWins(parseInt(saved));
    }, []);

    const play = (choice: any) => {
        const random = CHOICES[Math.floor(Math.random() * 3)];
        setUserChoice(choice);
        setAiChoice(random);

        if (choice.name === random.name) {
            setResult("IT'S A TIE!");
        } else if (
            (choice.name === 'Rock' && random.name === 'Scissors') ||
            (choice.name === 'Paper' && random.name === 'Rock') ||
            (choice.name === 'Scissors' && random.name === 'Paper')
        ) {
            setResult('YOU WIN!');
            const nextUserScore = scores.user + 1;
            setScores(s => ({ ...s, user: nextUserScore }));
            
            // 누적 승리 횟수 업데이트
            const nextTotalWins = totalWins + 1;
            setTotalWins(nextTotalWins);
            localStorage.setItem('rps_wins', nextTotalWins.toString());
        } else {
            setResult('YOU LOSE!');
            setScores(s => ({ ...s, ai: s.ai + 1 }));
        }
    };

    return (
        <div className="flex flex-col items-center p-4 bg-gray-950 min-h-screen text-white rounded-xl">
            <div className="flex w-full justify-between items-center max-w-md mb-10">
                <button onClick={() => navigate('/')} className="p-2 bg-gray-800 rounded-full"><ArrowLeftIcon /></button>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-purple-400">R-P-S</h1>
                    <p className="text-[10px] text-gray-500 font-mono">TOTAL WINS: {totalWins}</p>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="flex gap-20 text-center mb-10">
                <div><div className="text-[10px] text-gray-500 mb-1 uppercase tracking-tighter">YOU</div><div className="text-4xl font-black text-purple-400">{scores.user}</div></div>
                <div className="text-xl flex items-center text-gray-700 font-mono font-black italic">VS</div>
                <div><div className="text-[10px] text-gray-500 mb-1 uppercase tracking-tighter">AI</div><div className="text-4xl font-black text-pink-500">{scores.ai}</div></div>
            </div>

            <div className="flex justify-around w-full max-w-sm mb-12 bg-white/5 p-6 rounded-3xl border border-white/10">
                <div className="flex flex-col items-center">
                    <div className="text-6xl h-20 flex items-center transition-transform hover:scale-110">{userChoice?.icon || '❓'}</div>
                    <span className="text-[10px] text-gray-500 font-mono uppercase mt-2">Player</span>
                </div>
                <div className="flex flex-col items-center">
                    <div className="text-6xl h-20 flex items-center transition-transform hover:scale-110">{aiChoice?.icon || '❓'}</div>
                    <span className="text-[10px] text-gray-500 font-mono uppercase mt-2">Computer</span>
                </div>
            </div>

            <div className={`text-3xl font-black mb-10 h-10 tracking-tighter ${result.includes('WIN') ? 'text-green-400 animate-bounce' : result.includes('LOSE') ? 'text-red-400 animate-pulse' : 'text-gray-400'}`}>
                {result}
            </div>

            <div className="flex gap-4">
                {CHOICES.map(c => (
                    <button
                        key={c.name}
                        onClick={() => play(c)}
                        className="w-24 h-24 bg-purple-600/20 border-2 border-purple-500/50 rounded-2xl flex items-center justify-center text-4xl hover:bg-purple-600 hover:scale-110 active:scale-95 transition-all shadow-lg shadow-purple-500/10"
                    >
                        {c.icon}
                    </button>
                ))}
            </div>
            
            <p className="mt-12 text-[10px] text-gray-600 font-mono uppercase tracking-[0.2em]">Make your choice to begin</p>
        </div>
    );
};

export default RPSPage;
