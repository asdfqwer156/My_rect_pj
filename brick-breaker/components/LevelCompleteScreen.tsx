import React from 'react';

interface LevelCompleteScreenProps {
  score: number;
  level: number;
  onNextLevel: () => void;
}

const LevelCompleteScreen: React.FC<LevelCompleteScreenProps> = ({ score, level, onNextLevel }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200/80 text-gray-800 z-10">
      <h2 className="text-4xl font-bold mb-4 text-green-600">LEVEL {level} COMPLETE!</h2>
      <p className="text-xl mb-8">SCORE: <span className="text-blue-600">{score}</span></p>
      <button 
        onClick={onNextLevel}
        className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded shadow-md transition-all"
      >
        NEXT LEVEL
      </button>
      <p className="mt-4 text-gray-500 text-sm">Press ENTER for next level</p>
    </div>
  );
};

export default LevelCompleteScreen;