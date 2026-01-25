
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../../components/IconComponents';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };

const SnakePage: React.FC = () => {
    const navigate = useNavigate();
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [food, setFood] = useState({ x: 5, y: 5 });
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        const saved = localStorage.getItem('snake_highscore');
        setHighScore(saved ? parseInt(saved) : 0);
    }, []);

    const moveSnake = useCallback(() => {
        setSnake(prev => {
            const head = prev[0];
            const newHead = { x: head.x + direction.x, y: head.y + direction.y };

            if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE || prev.some(s => s.x === newHead.x && s.y === newHead.y)) {
                setGameOver(true);
                return prev;
            }

            const newSnake = [newHead, ...prev];
            if (newHead.x === food.x && newHead.y === food.y) {
                setScore(s => s + 10);
                setFood({
                    x: Math.floor(Math.random() * GRID_SIZE),
                    y: Math.floor(Math.random() * GRID_SIZE)
                });
            } else {
                newSnake.pop();
            }
            return newSnake;
        });
    }, [direction, food]);

    useEffect(() => {
        if (!gameOver) {
            timerRef.current = setInterval(moveSnake, 150);
        } else {
            if (score > highScore) {
                setHighScore(score);
                localStorage.setItem('snake_highscore', score.toString());
            }
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [moveSnake, gameOver, score, highScore]);

    useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp': if (direction.y !== 1) setDirection({ x: 0, y: -1 }); break;
                case 'ArrowDown': if (direction.y !== -1) setDirection({ x: 0, y: 1 }); break;
                case 'ArrowLeft': if (direction.x !== 1) setDirection({ x: -1, y: 0 }); break;
                case 'ArrowRight': if (direction.x !== -1) setDirection({ x: 1, y: 0 }); break;
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [direction]);

    return (
        <div className="flex flex-col items-center p-4 bg-black min-h-screen text-white rounded-xl">
            <div className="flex w-full justify-between items-center max-w-md mb-6">
                <button onClick={() => navigate('/')} className="p-2 bg-gray-800 rounded-full"><ArrowLeftIcon /></button>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-300">SNAKE</h1>
                    <p className="text-[10px] text-gray-600 font-mono">BEST: {highScore}</p>
                </div>
                <span className="text-xl font-mono text-white">{score}</span>
            </div>
            
            <div className="relative border-2 border-gray-700 rounded-lg overflow-hidden bg-black" style={{ width: 300, height: 300 }}>
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                    <div key={i} className="absolute w-[15px] h-[15px] border border-gray-900" style={{ left: (i % GRID_SIZE) * 15, top: Math.floor(i / GRID_SIZE) * 15 }}></div>
                ))}
                {snake.map((p, i) => (
                    <div key={i} className={`absolute w-[15px] h-[15px] ${i === 0 ? 'bg-green-500' : 'bg-green-700'}`} style={{ left: p.x * 15, top: p.y * 15 }}></div>
                ))}
                <div className="absolute w-[15px] h-[15px] bg-red-500" style={{ left: food.x * 15, top: food.y * 15 }}></div>
                
                {gameOver && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                        <h2 className="text-3xl font-bold text-red-500">GAME OVER</h2>
                        <button onClick={() => { setSnake(INITIAL_SNAKE); setDirection(INITIAL_DIRECTION); setGameOver(false); setScore(0); }} className="mt-4 px-6 py-2 bg-gray-200 text-black rounded-lg font-bold">RESTART</button>
                    </div>
                )}
            </div>
            <p className="mt-8 text-gray-700 text-[10px] font-mono">USE ARROW KEYS TO CONTROL</p>
        </div>
    );
};

export default SnakePage;