import React from 'react';

interface LevelCompleteScreenProps {
  score: number;
  level: number;
  onNextLevel: () => void;
}

const LevelCompleteScreen: React.FC<LevelCompleteScreenProps> = ({ score, level, onNextLevel }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white z-10">
      <h2 className="text-4xl font-bold mb-4 text-green-400">LEVEL {level} COMPLETE!</h2>
      <p className="text-xl mb-8">SCORE: <span className="text-yellow-400">{score}</span></p>
      <button 
        onClick={onNextLevel}
        className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded shadow-[0_0_15px_#06b6d4] transition-all"
      >
        NEXT LEVEL
      </button>
      <p className="mt-4 text-gray-500 text-sm">Press ENTER for next level</p>
    </div>
  );
};

export default LevelCompleteScreen;