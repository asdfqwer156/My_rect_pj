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
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('brick_breaker_highscore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setLives(INITIAL_LIVES);
    setLevel(1);
    setGameState(GameState.PLAYING);
  }, []);

  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);
  
  const advanceLevel = useCallback(() => {
    setLevel(prevLevel => prevLevel + 1);
    setGameState(GameState.PLAYING);
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    setGameState(GameState.GAME_OVER);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('brick_breaker_highscore', finalScore.toString());
    }
  }, [highScore]);
  
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
    <div className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-800 min-h-[calc(100vh-100px)] rounded-xl">
        <div className="w-full flex justify-between items-center mb-4 max-w-[800px] text-gray-800 dark:text-gray-200">
            <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm transition-colors border border-gray-300 dark:border-gray-600"
            >
                <ArrowLeftIcon />
                <span>나가기</span>
            </button>
            <h1 className="text-2xl font-bold tracking-wider">
                BRICK BREAKER
            </h1>
            <div className="text-right font-mono w-40">
                <p>HIGH SCORE: {highScore}</p>
                <p>SCORE: {score}</p>
                <p>LIVES: {lives}</p>
            </div>
        </div>

        <div 
          className="relative bg-gray-300 border-2 border-gray-400 rounded-lg overflow-hidden shadow-inner"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        >
          {renderGameScreen()}
        </div>
        
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">엔터(Enter) 키를 눌러 시작하세요</p>
    </div>
  );
};

export default BrickBreakerPage;