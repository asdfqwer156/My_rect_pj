import React from 'react';

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/90 text-white z-10">
      <h2 className="text-5xl font-bold mb-4 text-red-500">GAME OVER</h2>
      <p className="text-2xl mb-8">FINAL SCORE: <span className="text-yellow-400">{score}</span></p>
      <button 
        onClick={onRestart}
        className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded shadow-md transition-all"
      >
        TRY AGAIN
      </button>
      <p className="mt-4 text-gray-400 text-sm">Press ENTER to restart</p>
    </div>
  );
};

export default GameOverScreen;