import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../components/IconComponents';

// --- Game Constants ---
const GAME_WIDTH = 700;
const GAME_HEIGHT = 200;
const GROUND_Y = GAME_HEIGHT - 20;

const DINO_WIDTH = 20;
const DINO_HEIGHT = 30;
const DINO_X = 50;
const DINO_JUMP_FORCE = 10;
const GRAVITY = 0.5;

const OBSTACLE_MIN_GAP = 250;
const OBSTACLE_MAX_GAP = 600;
const INITIAL_SPEED = 4;
const SPEED_INCREASE = 0.001;

type GameState = 'waiting' | 'playing' | 'gameOver';

const CalculatorPage: React.FC = () => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<GameState>('waiting');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);

    const gameStateRef = useRef(gameState);
    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    const dinoY = useRef(GROUND_Y - DINO_HEIGHT);
    const dinoVelocityY = useRef(0);
    const obstacles = useRef<{ x: number, width: number, height: number }[]>([]);
    const gameSpeed = useRef(INITIAL_SPEED);
    const nextObstacleThreshold = useRef(GAME_WIDTH);
    const scoreCounter = useRef(0);

    useEffect(() => {
        const savedHighScore = localStorage.getItem('dino_highscore');
        if (savedHighScore) {
            setHighScore(parseInt(savedHighScore, 10));
        }
    }, []);

    const updateHighScore = useCallback((currentScore: number) => {
        if (currentScore > highScore) {
            setHighScore(currentScore);
            localStorage.setItem('dino_highscore', String(currentScore));
        }
    }, [highScore]);

    const resetGame = useCallback(() => {
        dinoY.current = GROUND_Y - DINO_HEIGHT;
        dinoVelocityY.current = 0;
        obstacles.current = [];
        gameSpeed.current = INITIAL_SPEED;
        nextObstacleThreshold.current = GAME_WIDTH;
        scoreCounter.current = 0;
        setScore(0);
        setGameState('playing');
    }, []);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const isDarkMode = document.documentElement.classList.contains('dark');
        const bgColor = isDarkMode ? '#1f2937' : '#ffffff'; // gray-800 or white
        const fgColor = isDarkMode ? '#f9fafb' : '#1f2937'; // gray-50 or gray-800
        
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        ctx.fillStyle = fgColor;
        ctx.fillRect(0, GROUND_Y, GAME_WIDTH, 2);

        ctx.fillStyle = fgColor;
        ctx.fillRect(DINO_X, dinoY.current, DINO_WIDTH, DINO_HEIGHT);

        obstacles.current.forEach(obstacle => {
            ctx.fillStyle = fgColor;
            ctx.fillRect(obstacle.x, GROUND_Y - obstacle.height, obstacle.width, obstacle.height);
        });

    }, []);

    const update = useCallback(() => {
        dinoVelocityY.current += GRAVITY;
        dinoY.current += dinoVelocityY.current;

        if (dinoY.current > GROUND_Y - DINO_HEIGHT) {
            dinoY.current = GROUND_Y - DINO_HEIGHT;
            dinoVelocityY.current = 0;
        }

        obstacles.current.forEach(obstacle => {
            obstacle.x -= gameSpeed.current;
        });
        
        obstacles.current = obstacles.current.filter(obstacle => obstacle.x > -obstacle.width);

        if (obstacles.current.length === 0 || obstacles.current[obstacles.current.length - 1].x < GAME_WIDTH - nextObstacleThreshold.current) {
             const newObstacle = {
                x: GAME_WIDTH,
                width: 15 + Math.random() * 15,
                height: 20 + Math.random() * 25
            };
            obstacles.current.push(newObstacle);
            nextObstacleThreshold.current = OBSTACLE_MIN_GAP + Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP);
        }

        const dinoRect = { x: DINO_X, y: dinoY.current, width: DINO_WIDTH, height: DINO_HEIGHT };
        for (const obstacle of obstacles.current) {
            const obstacleRect = { x: obstacle.x, y: GROUND_Y - obstacle.height, width: obstacle.width, height: obstacle.height };
            if (
                dinoRect.x < obstacleRect.x + obstacleRect.width &&
                dinoRect.x + dinoRect.width > obstacleRect.x &&
                dinoRect.y < obstacleRect.y + obstacleRect.height &&
                dinoRect.y + dinoRect.height > obstacleRect.y
            ) {
                updateHighScore(Math.floor(scoreCounter.current));
                setGameState('gameOver');
                return;
            }
        }
        
        scoreCounter.current += 0.1;
        setScore(Math.floor(scoreCounter.current));
        gameSpeed.current += SPEED_INCREASE;

    }, [updateHighScore]);
    
    const gameLoop = useCallback(() => {
        if (gameStateRef.current !== 'playing') return;
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }, [update, draw]);

    useEffect(() => {
        if (gameState === 'playing') {
            const animationFrameId = requestAnimationFrame(gameLoop);
            return () => cancelAnimationFrame(animationFrameId);
        }
    }, [gameState, gameLoop]);

    useEffect(() => {
        draw();
    }, [draw]);

    const handleJump = useCallback(() => {
        if (dinoY.current >= GROUND_Y - DINO_HEIGHT - 1) { // -1 for floating point tolerance
            dinoVelocityY.current = -DINO_JUMP_FORCE;
        }
    }, []);

    const handleUserInput = useCallback(() => {
        switch (gameState) {
            case 'waiting':
                resetGame();
                break;
            case 'playing':
                handleJump();
                break;
            case 'gameOver':
                resetGame();
                break;
        }
    }, [gameState, resetGame, handleJump]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                handleUserInput();
            }
        };

        const handleTouch = (e: Event) => {
            e.preventDefault();
            handleUserInput();
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('mousedown', handleTouch);
        window.addEventListener('touchstart', handleTouch);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousedown', handleTouch);
            window.removeEventListener('touchstart', handleTouch);
        };
    }, [handleUserInput]);


    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8 max-w-4xl mx-auto mt-4 sm:mt-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    공룡 달리기
                </h2>
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    <ArrowLeftIcon />
                    <span>돌아가기</span>
                </button>
            </div>
            
            <div className="text-right font-mono text-base sm:text-lg text-gray-500 dark:text-gray-400 mb-2 tracking-widest">
                HI: {String(highScore).padStart(5, '0')} SCORE: {String(score).padStart(5, '0')}
            </div>

            <div className="relative overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                <canvas
                    ref={canvasRef}
                    width={GAME_WIDTH}
                    height={GAME_HEIGHT}
                />
                 {(gameState === 'waiting' || gameState === 'gameOver') && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        {gameState === 'gameOver' && (
                             <h3 className="text-3xl sm:text-4xl font-bold text-gray-700 dark:text-gray-200 mb-4 tracking-widest">GAME OVER</h3>
                        )}
                        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 animate-pulse">
                            {gameState === 'waiting' ? 'PRESS SPACE TO START' : 'PRESS SPACE TO RESTART'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalculatorPage;