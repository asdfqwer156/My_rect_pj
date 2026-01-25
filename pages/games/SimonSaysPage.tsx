
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../../components/IconComponents';

const COLORS = ['green', 'red', 'yellow', 'blue'];

const SimonSaysPage: React.FC = () => {
    const navigate = useNavigate();
    const [sequence, setSequence] = useState<string[]>([]);
    const [userSequence, setUserSequence] = useState<string[]>([]);
    const [activeColor, setActiveColor] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [message, setMessage] = useState('READY?');
    const [highScore, setHighScore] = useState(0);

    useEffect(() => {
        const saved = localStorage.getItem('simon_highscore');
        setHighScore(saved ? parseInt(saved) : 0);
    }, []);

    const startNewRound = (currentSequence: string[]) => {
        const nextSequence = [...currentSequence, COLORS[Math.floor(Math.random() * 4)]];
        setSequence(nextSequence);
        setUserSequence([]);
        playSequence(nextSequence);
    };

    const playSequence = async (seq: string[]) => {
        setIsPlaying(true);
        setMessage('WATCH...');
        
        const baseSpeed = 600;
        const currentSpeed = Math.max(150, baseSpeed * Math.pow(0.95, seq.length - 1));

        for (let color of seq) {
            await new Promise(r => setTimeout(r, currentSpeed / 2));
            setActiveColor(color);
            await new Promise(r => setTimeout(r, currentSpeed));
            setActiveColor(null);
        }
        setIsPlaying(false);
        setMessage('GO!');
    };

    const handleColorClick = (color: string) => {
        if (isPlaying || sequence.length === 0) return;
        
        setActiveColor(color);
        setTimeout(() => setActiveColor(null), 150);

        const nextUserSeq = [...userSequence, color];
        const currentIdx = nextUserSeq.length - 1;

        if (color !== sequence[currentIdx]) {
            setMessage('GAME OVER');
            const score = sequence.length - 1;
            if (score > highScore) {
                setHighScore(score);
                localStorage.setItem('simon_highscore', score.toString());
            }
            setSequence([]);
            return;
        }

        setUserSequence(nextUserSeq);
        if (nextUserSeq.length === sequence.length) {
            setMessage('GREAT!');
            setTimeout(() => startNewRound(sequence), 800);
        }
    };

    return (
        <div className="flex flex-col items-center p-4 bg-black min-h-screen text-white rounded-xl">
            <div className="flex w-full justify-between items-center max-w-md mb-6">
                <button onClick={() => navigate('/')} className="p-2 bg-gray-800 rounded-full"><ArrowLeftIcon /></button>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-300">SIMON</h1>
                    <p className="text-[10px] text-gray-600 font-mono tracking-tighter">BEST: {highScore}</p>
                </div>
                <span className="font-mono text-2xl text-white font-black">{Math.max(0, sequence.length - 1)}</span>
            </div>

            <div className="text-xl mb-10 font-black text-gray-500 tracking-widest">{message}</div>

            <div className="relative p-8 bg-gray-900 rounded-full border-8 border-black shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => handleColorClick('green')} 
                        className={`w-32 h-32 rounded-tl-full transition-all duration-75 ${activeColor === 'green' ? 'bg-green-400 brightness-125' : 'bg-green-700 hover:bg-green-600'}`}
                        aria-label="green"
                    ></button>
                    <button 
                        onClick={() => handleColorClick('red')} 
                        className={`w-32 h-32 rounded-tr-full transition-all duration-75 ${activeColor === 'red' ? 'bg-red-500 brightness-125' : 'bg-red-800 hover:bg-red-700'}`}
                        aria-label="red"
                    ></button>
                    <button 
                        onClick={() => handleColorClick('yellow')} 
                        className={`w-32 h-32 rounded-bl-full transition-all duration-75 ${activeColor === 'yellow' ? 'bg-yellow-400 brightness-125' : 'bg-yellow-700 hover:bg-yellow-600'}`}
                        aria-label="yellow"
                    ></button>
                    <button 
                        onClick={() => handleColorClick('blue')} 
                        className={`w-32 h-32 rounded-br-full transition-all duration-75 ${activeColor === 'blue' ? 'bg-blue-500 brightness-125' : 'bg-blue-800 hover:bg-blue-700'}`}
                        aria-label="blue"
                    ></button>
                </div>
                {/* Center Pulse Indicator */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className={`w-16 h-16 rounded-full border-8 border-black bg-gray-800 ${isPlaying ? 'animate-pulse' : ''}`}></div>
                </div>
            </div>

            {sequence.length === 0 && (
                <button onClick={() => startNewRound([])} className="mt-12 px-14 py-4 bg-gray-700 rounded-2xl font-black text-xl shadow-xl hover:bg-gray-600 active:scale-95 transition-all">START</button>
            )}
            
            <p className="mt-8 text-[10px] text-gray-700 font-mono">WATCH THE PATTERN AND REPEAT IT</p>
        </div>
    );
};

export default SimonSaysPage;