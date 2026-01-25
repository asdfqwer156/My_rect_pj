
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../../components/IconComponents';

const ClickSpeedPage: React.FC = () => {
    const navigate = useNavigate();
    const [clicks, setClicks] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [isActive, setIsActive] = useState(false);
    const [best, setBest] = useState(0);

    useEffect(() => {
        const saved = localStorage.getItem('clicker_highscore');
        if (saved) setBest(parseInt(saved));
    }, []);

    useEffect(() => {
        let timer: any;
        if (isActive && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (clicks > best) {
                setBest(clicks);
                localStorage.setItem('clicker_highscore', clicks.toString());
            }
        }
        return () => clearInterval(timer);
    }, [isActive, timeLeft, clicks, best]);

    const handleAction = () => {
        if (timeLeft === 0) return;
        if (!isActive) {
            setIsActive(true);
            setClicks(1);
        } else {
            setClicks(c => c + 1);
        }
    };

    return (
        <div className="flex flex-col items-center p-4 bg-gray-950 min-h-screen text-white rounded-xl">
            <div className="flex w-full justify-between items-center max-w-md mb-10">
                <button onClick={() => navigate('/')} className="p-2 bg-gray-800 rounded-full"><ArrowLeftIcon /></button>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500">CLICK SPEED</h1>
                    <p className="text-[10px] text-gray-500 font-mono">BEST: {best}</p>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="text-center mb-8">
                <div className="text-6xl font-black text-red-500 mb-2">{clicks}</div>
                <div className="text-xl text-gray-400">Time Left: {timeLeft}s</div>
            </div>

            <button
                onMouseDown={handleAction}
                className="w-48 h-48 bg-red-600 rounded-full border-b-8 border-red-900 active:translate-y-1 active:border-b-0 flex items-center justify-center text-4xl font-bold shadow-2xl shadow-red-500/20 transition-transform active:scale-95"
            >
                CLICK!
            </button>

            {timeLeft === 0 && (
                <button onClick={() => { setClicks(0); setTimeLeft(10); setIsActive(false); }} className="mt-10 px-8 py-3 bg-white text-black font-bold rounded-xl shadow-lg">TRY AGAIN</button>
            )}
            <p className="mt-10 text-gray-500 font-mono text-[10px] uppercase tracking-widest">Start clicking as fast as you can!</p>
        </div>
    );
};

export default ClickSpeedPage;
