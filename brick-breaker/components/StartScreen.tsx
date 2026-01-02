import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-300/80 text-gray-800 z-10">
      <h2 className="text-3xl font-bold mb-8 animate-pulse">PRESS ENTER TO START</h2>
      <button 
        onClick={onStart}
        className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded shadow-md transition-all"
      >
        START GAME
      </button>
      <div className="mt-8 text-gray-600 text-sm">
        <p>Use LEFT / RIGHT arrows to move</p>
      </div>
    </div>
  );
};

export default StartScreen;