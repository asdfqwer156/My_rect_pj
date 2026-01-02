import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../components/IconComponents';

// Import game components from the brick-breaker directory
import { GameState } from '../brick-breaker/types';
import GameBoard from '../brick-breaker/components/GameBoard';
import StartScreen from '../brick-breaker/components/StartScreen';
import GameOverScreen from '../brick-breaker/components/GameOverScreen';
import LevelCompleteScreen from '../brick-breaker/components/LevelCompleteScreen';
import { GAME_WIDTH, GAME_HEIGHT, INITIAL_LIVES } from '../brick-breaker/constants';

const BrickBreakerPage: React.FC = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [level, setLevel] = useState(1);

  const startGame = useCallback(() => {
    setScore(0);
    setLives(INITIAL_LIVES);
    setLevel(1);
    setGameState(GameState.PLAYING);
  }, []);

  const restartGame = useCallback(() => {
    setScore(0);
    setLives(INITIAL_LIVES);
    setLevel(1);
    setGameState(GameState.PLAYING);
  }, []);
  
  const advanceLevel = useCallback(() => {
    setLevel(prevLevel => prevLevel + 1);
    setGameState(GameState.PLAYING);
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    setGameState(GameState.GAME_OVER);
  }, []);
  
  const handleLevelComplete = useCallback((currentScore: number) => {
    setScore(currentScore);
    setGameState(GameState.LEVEL_COMPLETE);
  }, []);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === GameState.START || gameState === GameState.GAME_OVER || gameState === GameState.LEVEL_COMPLETE) {
        if (e.key === 'Enter') {
          if (gameState === GameState.LEVEL_COMPLETE) {
            advanceLevel();
          } else {
            restartGame();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, restartGame, advanceLevel]);

  const renderGameScreen = () => {
    switch (gameState) {
      case GameState.START:
        return <StartScreen onStart={startGame} />;
      case GameState.PLAYING:
        return (
          <GameBoard
            score={score}
            setScore={setScore}
            lives={lives}
            setLives={setLives}
            level={level}
            onGameOver={handleGameOver}
            onLevelComplete={handleLevelComplete}
          />
        );
      case GameState.LEVEL_COMPLETE:
        return <LevelCompleteScreen score={score} level={level} onNextLevel={advanceLevel} />;
      case GameState.GAME_OVER:
        return <GameOverScreen score={score} onRestart={restartGame} />;
      default:
        return <StartScreen onStart={startGame} />;
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-100px)] bg-gray-900 text-white p-4 rounded-xl shadow-2xl">
        <div className="w-full flex justify-between items-center mb-6 max-w-[800px]">
            <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
            >
                <ArrowLeftIcon />
                <span>나가기</span>
            </button>
            <h1 className="text-3xl font-bold text-cyan-400 tracking-widest" style={{ textShadow: '0 0 10px #0ff' }}>
                BRICK BREAKER
            </h1>
            <div className="w-[88px]"></div> {/* Spacer for alignment */}
        </div>

        <div 
          className="relative bg-black border-4 border-cyan-400 shadow-[0_0_20px_#0ff,inset_0_0_10px_#0ff] rounded-lg overflow-hidden"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        >
          {renderGameScreen()}
        </div>
        
        <p className="mt-6 text-sm text-pink-500">엔터(Enter) 키를 눌러 시작하세요</p>
    </div>
  );
};

export default BrickBreakerPage;