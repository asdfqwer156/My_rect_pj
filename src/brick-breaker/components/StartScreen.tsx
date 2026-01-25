import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white z-10">
      <h2 className="text-4xl font-bold mb-8 text-cyan-400 animate-pulse">PRESS ENTER TO START</h2>
      <button 
        onClick={onStart}
        className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded shadow-[0_0_15px_#06b6d4] transition-all"
      >
        START GAME
      </button>
      <div className="mt-8 text-gray-400 text-sm">
        <p>Use LEFT / RIGHT arrows to move</p>
      </div>
    </div>
  );
};

export default StartScreen;