
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../../components/IconComponents';

const COLORS = [
    { name: 'RED', value: '#ef4444' },
    { name: 'BLUE', value: '#3b82f6' },
    { name: 'GREEN', value: '#22c55e' },
    { name: 'YELLOW', value: '#eab308' },
    { name: 'PINK', value: '#ec4899' }
];

const ColorMatchPage: React.FC = () => {
    const navigate = useNavigate();
    const [score, setScore] = useState(0);
    const [displayText, setDisplayText] = useState('');
    const [displayColor, setDisplayColor] = useState('');
    const [isMatch, setIsMatch] = useState(false);
    const [timeLeft, setTimeLeft] = useState(20);
    const [active, setActive] = useState(false);
    const [highScore, setHighScore] = useState(0);

    useEffect(() => {
        const saved = localStorage.getItem('color_match_highscore');
        if (saved) setHighScore(parseInt(saved));
    }, []);

    const nextRound = () => {
        const textIdx = Math.floor(Math.random() * COLORS.length);
        const match = Math.random() > 0.5;
        const colorIdx = match ? textIdx : Math.floor(Math.random() * COLORS.length);
        
        setDisplayText(COLORS[textIdx].name);
        setDisplayColor(COLORS[colorIdx].value);
        setIsMatch(textIdx === colorIdx);
    };

    useEffect(() => {
        if (active && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            setActive(false);
            if (score > highScore) {
                setHighScore(score);
                localStorage.setItem('color_match_highscore', score.toString());
            }
        }
    }, [active, timeLeft, score, highScore]);

    const handleAnswer = (answer: boolean) => {
        if (!active) return;
        if (answer === isMatch) {
            setScore(s => s + 10);
            nextRound();
        } else {
            setScore(s => Math.max(0, s - 5));
            nextRound();
        }
    };

    const start = () => {
        setScore(0);
        setTimeLeft(20);
        setActive(true);
        nextRound();
    };

    return (
        <div className="flex flex-col items-center p-4 bg-gray-950 min-h-screen text-white rounded-xl">
            <div className="flex w-full justify-between items-center max-w-md mb-10">
                <button onClick={() => navigate('/')} className="p-2 bg-gray-800 rounded-full"><ArrowLeftIcon /></button>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-rose-400">COLOR MATCH</h1>
                    <p className="text-[10px] text-gray-500 font-mono">BEST: {highScore}</p>
                </div>
                <div className="flex flex-col items-end">
                     <span className="font-mono text-xs">Time: {timeLeft}s</span>
                     <span className="font-mono text-lg font-bold text-rose-400">{score}</span>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center h-48 mb-10 bg-white/5 w-full max-w-sm rounded-3xl border-2 border-rose-500/20 shadow-inner">
                {active ? (
                    <div className="text-6xl font-black transition-all" style={{ color: displayColor }}>
                        {displayText}
                    </div>
                ) : (
                    <div className="text-xl text-gray-500 italic text-center px-4">Does the color match the word?</div>
                )}
            </div>

            {active ? (
                <div className="flex gap-6">
                    <button onClick={() => handleAnswer(false)} className="px-10 py-4 bg-red-600 rounded-2xl font-bold text-xl shadow-lg active:scale-95 transition-transform">NO ❌</button>
                    <button onClick={() => handleAnswer(true)} className="px-10 py-4 bg-green-600 rounded-2xl font-bold text-xl shadow-lg active:scale-95 transition-transform">YES ✅</button>
                </div>
            ) : (
                <button onClick={start} className="px-12 py-4 bg-rose-600 rounded-2xl font-black text-2xl shadow-xl shadow-rose-500/30 hover:scale-105 active:scale-95 transition-transform">
                    {timeLeft === 0 ? 'PLAY AGAIN' : 'START CHALLENGE'}
                </button>
            )}
            
            <p className="mt-12 text-[10px] text-gray-600 text-center font-mono uppercase tracking-widest">Fast decision: Don't let the word distract you!</p>
        </div>
    );
};

export default ColorMatchPage;
