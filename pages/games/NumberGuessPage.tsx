
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../../components/IconComponents';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

const NumberGuessPage: React.FC = () => {
    const navigate = useNavigate();
    const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
    const [target, setTarget] = useState(0);
    const [guess, setGuess] = useState<string>('');
    const [message, setMessage] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [best, setBest] = useState(Infinity);

    const config = {
        EASY: 50,
        MEDIUM: 100,
        HARD: 500
    };

    useEffect(() => {
        const saved = localStorage.getItem(`best_guess_${difficulty}`);
        setBest(saved ? parseInt(saved) : Infinity);
        resetGame(difficulty);
    }, [difficulty]);

    const resetGame = (d: Difficulty) => {
        setTarget(Math.floor(Math.random() * config[d]) + 1);
        setGuess('');
        setMessage(`Guess 1 to ${config[d]}`);
        setAttempts(0);
        setGameOver(false);
    };

    const handleGuess = (e: React.FormEvent) => {
        e.preventDefault();
        const num = parseInt(guess);
        if (isNaN(num)) return;

        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        
        if (num === target) {
            setMessage(`JACKPOT! It was ${target}`);
            setGameOver(true);
            if (nextAttempts < best) {
                setBest(nextAttempts);
                localStorage.setItem(`best_guess_${difficulty}`, nextAttempts.toString());
            }
        } else if (num < target) {
            setMessage('Higher ⬆️');
        } else {
            setMessage('Lower ⬇️');
        }
        setGuess('');
    };

    return (
        <div className="flex flex-col items-center p-4 bg-gray-950 min-h-screen text-white rounded-xl">
            <div className="flex w-full justify-between items-center max-w-md mb-10">
                <button onClick={() => navigate('/')} className="p-2 bg-gray-800 rounded-full"><ArrowLeftIcon /></button>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-orange-400">NUMBER GUESS</h1>
                    <p className="text-[10px] text-gray-500 font-mono">BEST ATTEMPT: {best === Infinity ? '-' : best}</p>
                </div>
                <span className="font-mono text-xl text-orange-400">{attempts}</span>
            </div>

            <div className="flex gap-2 mb-10">
                {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map(d => (
                    <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${difficulty === d ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-gray-800 text-gray-500 hover:text-white'}`}
                    >
                        {d}
                    </button>
                ))}
            </div>

            <div className={`text-2xl font-bold mb-8 text-center px-10 py-10 bg-white/5 w-full max-w-xs rounded-3xl border-4 border-orange-500/20 ${gameOver ? 'text-green-400 animate-pulse' : 'text-orange-400'}`}>
                {message}
            </div>

            {!gameOver ? (
                <form onSubmit={handleGuess} className="flex flex-col items-center gap-6">
                    <input
                        type="number"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        className="w-40 text-5xl bg-black border-b-4 border-orange-500 p-3 text-center focus:outline-none focus:border-white transition-colors"
                        autoFocus
                    />
                    <button type="submit" className="px-14 py-4 bg-orange-600 rounded-2xl font-black text-xl hover:scale-110 active:scale-95 transition-all">GUESS</button>
                </form>
            ) : (
                <button onClick={() => resetGame(difficulty)} className="px-14 py-4 bg-green-600 rounded-2xl font-black text-xl animate-bounce">PLAY AGAIN</button>
            )}
        </div>
    );
};

export default NumberGuessPage;
