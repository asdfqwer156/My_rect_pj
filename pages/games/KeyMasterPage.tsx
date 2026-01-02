
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../../components/IconComponents';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
// 숫자를 제외한 알파벳만 정의
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const KeyMasterPage: React.FC = () => {
    const navigate = useNavigate();
    const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
    const [score, setScore] = useState(0);
    const [targetChar, setTargetChar] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [highScore, setHighScore] = useState(0);
    const [inputFeedback, setInputFeedback] = useState<'correct' | 'wrong' | null>(null);

    const timerRef = useRef<any>(null);

    const config = {
        EASY: 1500,
        MEDIUM: 1000,
        HARD: 700
    };

    useEffect(() => {
        const saved = localStorage.getItem(`highScore_keymaster_alpha_${difficulty}`);
        setHighScore(saved ? parseInt(saved) : 0);
    }, [difficulty]);

    const getNextChar = useCallback(() => {
        return CHARS[Math.floor(Math.random() * CHARS.length)];
    }, []);

    const startGame = () => {
        setScore(0);
        setGameOver(false);
        setGameStarted(true);
        nextTurn(config[difficulty], 0);
    };

    const nextTurn = (baseTime: number, currentScore: number) => {
        const char = getNextChar();
        setTargetChar(char);
        // 점수가 높을수록 제한 시간 단축 (최소 250ms)
        const nextTime = Math.max(250, baseTime * Math.pow(0.96, currentScore));
        setTimeLeft(nextTime);
        
        if (timerRef.current) clearInterval(timerRef.current);
        
        const startTime = Date.now();
        timerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, nextTime - elapsed);
            setTimeLeft(remaining);
            
            if (remaining <= 0) {
                endGame();
            }
        }, 10);
    };

    const endGame = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setGameStarted(false);
        setGameOver(true);
        // 최고 기록 갱신 로직 (함수형 업데이트 내부의 score를 쓰기 위해 별도 처리 대신 상태값 활용)
    }, []);

    // 스코어 변경 시 하이스코어 체크
    useEffect(() => {
        if (gameOver && score > highScore) {
            setHighScore(score);
            localStorage.setItem(`highScore_keymaster_alpha_${difficulty}`, score.toString());
        }
    }, [gameOver, score, highScore, difficulty]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!gameStarted || gameOver) return;
            
            // e.key는 한영키에 따라 'ㅁ', 'A' 등으로 변하지만 
            // e.code는 물리적 위치인 'KeyA'를 고정적으로 반환합니다.
            let pressed = "";
            if (e.code.startsWith('Key')) {
                pressed = e.code.replace('Key', ''); // 'KeyA' -> 'A'
            }

            if (pressed === targetChar) {
                setInputFeedback('correct');
                const newScore = score + 1;
                setScore(newScore);
                
                // 피드백을 위해 아주 짧은 지연 후 다음 턴 진행
                if (timerRef.current) clearInterval(timerRef.current);
                setTimeout(() => {
                    setInputFeedback(null);
                    nextTurn(config[difficulty], newScore);
                }, 80);
            } else {
                // 알파벳 키를 눌렀는데 틀린 경우만 오답 처리
                if (e.code.startsWith('Key')) {
                    setInputFeedback('wrong');
                    setTimeout(() => {
                        setInputFeedback(null);
                        endGame();
                    }, 200);
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameStarted, gameOver, targetChar, score, difficulty, endGame]);

    return (
        <div className="flex flex-col items-center p-4 bg-gray-950 min-h-screen text-white rounded-xl">
            <div className="flex w-full justify-between items-center max-w-md mb-6">
                <button onClick={() => navigate('/')} className="p-2 bg-gray-800 rounded-full"><ArrowLeftIcon /></button>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-cyan-400 tracking-widest">KEY MASTER</h1>
                    <p className="text-[10px] text-gray-500 font-mono">BEST: {highScore}</p>
                </div>
                <div className="font-mono text-xl font-bold text-cyan-400">{score}</div>
            </div>

            {!gameStarted && !gameOver && (
                <div className="flex gap-2 mb-10">
                    {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map(d => (
                        <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${difficulty === d ? 'bg-cyan-500 text-black scale-110 shadow-lg shadow-cyan-500/30' : 'bg-gray-800 text-gray-500 hover:text-white'}`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            )}

            <div className="relative flex flex-col items-center justify-center w-full max-w-xs aspect-square bg-gray-900 rounded-3xl border-4 border-cyan-900/30 overflow-hidden shadow-2xl">
                {gameStarted ? (
                    <>
                        {/* Progress Bar (Time Indicator) */}
                        <div 
                            className="absolute top-0 left-0 h-2 bg-cyan-400 shadow-[0_0_10px_#22d3ee]" 
                            style={{ 
                                width: `${(timeLeft / (config[difficulty] * Math.pow(0.96, score))) * 100}%`,
                                transition: 'width 10ms linear'
                            }}
                        ></div>
                        
                        <div className={`text-9xl font-black transition-all duration-75 select-none ${inputFeedback === 'correct' ? 'text-green-400 scale-125' : inputFeedback === 'wrong' ? 'text-red-500 shake' : 'text-white'}`}>
                            {targetChar}
                        </div>
                    </>
                ) : (
                    <div className="text-center p-6">
                        {gameOver ? (
                            <div className="animate-in fade-in zoom-in duration-300">
                                <h2 className="text-4xl font-black text-red-500 mb-2">TIME UP!</h2>
                                <p className="text-gray-400 mb-6 font-mono tracking-widest">SCORE: {score}</p>
                                <button onClick={startGame} className="px-10 py-4 bg-cyan-600 text-white font-black text-xl rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cyan-500/20">RETRY</button>
                            </div>
                        ) : (
                            <button onClick={startGame} className="px-10 py-4 bg-cyan-600 text-white font-black text-xl rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cyan-500/20">START GAME</button>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-12 text-center text-gray-500 font-mono text-[10px] uppercase tracking-[0.2em] leading-relaxed">
                한영키 상관없이 알파벳 키를 누르세요 <br/>
                갈수록 시간이 촉박해집니다!
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-8px); }
                    75% { transform: translateX(8px); }
                }
                .shake { animation: shake 0.1s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

export default KeyMasterPage;
