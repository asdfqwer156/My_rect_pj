
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../../components/IconComponents';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

const WhackAMolePage: React.FC = () => {
    const navigate = useNavigate();
    const [score, setScore] = useState(0);
    const [moleIndex, setMoleIndex] = useState(-1);
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameStarted, setGameStarted] = useState(false);
    const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
    const [highScore, setHighScore] = useState(0);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        const saved = localStorage.getItem(`highScore_mole_${difficulty}`);
        setHighScore(saved ? parseInt(saved) : 0);
    }, [difficulty]);

    const startGame = () => {
        setScore(0);
        setTimeLeft(30);
        setGameStarted(true);
    };

    useEffect(() => {
        if (gameStarted && timeLeft > 0) {
            const interval = difficulty === 'EASY' ? 1000 : difficulty === 'MEDIUM' ? 700 : 450;
            timerRef.current = setInterval(() => {
                setMoleIndex(Math.floor(Math.random() * 9));
            }, interval);
            const countdown = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => { clearInterval(timerRef.current!); clearInterval(countdown); };
        } else if (timeLeft === 0) {
            setGameStarted(false);
            setMoleIndex(-1);
            if (score > highScore) {
                setHighScore(score);
                localStorage.setItem(`highScore_mole_${difficulty}`, score.toString());
            }
        }
    }, [gameStarted, timeLeft, difficulty, score, highScore]);

    const whack = (i: number) => {
        if (i === moleIndex) {
            setScore(s => s + 10);
            setMoleIndex(-1);
        }
    };

    return (
        <div className="flex flex-col items-center p-4 bg-gray-950 min-h-screen text-white rounded-xl">
            <div className="flex w-full justify-between items-center max-w-md mb-6">
                <button onClick={() => navigate('/')} className="p-2 bg-gray-800 rounded-full"><ArrowLeftIcon /></button>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-yellow-400">WHACK-A-MOLE</h1>
                    <p className="text-[10px] text-gray-500">BEST: {highScore}</p>
                </div>
                <div className="flex flex-col items-end">
                     <span className="font-mono text-sm">Time: {timeLeft}s</span>
                     <span className="font-mono text-lg font-bold">Score: {score}</span>
                </div>
            </div>

            {!gameStarted && (
                <div className="flex gap-2 mb-6">
                    {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map(d => (
                        <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${difficulty === d ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400'}`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-900 rounded-3xl border-4 border-yellow-900/30">
                {Array.from({ length: 9 }).map((_, i) => (
                    <div
                        key={i}
                        onClick={() => whack(i)}
                        className="w-24 h-24 bg-yellow-900/20 rounded-full border-b-8 border-yellow-950 relative overflow-hidden flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                    >
                        {moleIndex === i && (
                            <div className="w-16 h-20 bg-yellow-600 rounded-t-full absolute bottom-0 transition-transform flex flex-col items-center pt-2 animate-bounce">
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 bg-black rounded-full"></div>
                                    <div className="w-2 h-2 bg-black rounded-full"></div>
                                </div>
                                <div className="w-4 h-2 bg-pink-400 rounded-full mt-2"></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {!gameStarted && (
                <button onClick={startGame} className="mt-10 px-10 py-4 bg-yellow-500 text-black font-black text-xl rounded-2xl shadow-xl hover:scale-105 transition-transform">
                    {timeLeft === 0 ? 'RETRY' : 'START'}
                </button>
            )}
        </div>
    );
};

export default WhackAMolePage;
