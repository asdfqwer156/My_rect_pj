
import React from 'react';

interface HintBoxProps {
  text: string;
}

export const HintBox: React.FC<HintBoxProps> = ({ text }) => {
  if (!text) return null;

  return (
    <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg z-40 max-w-xs text-center font-mono animate-[fadein_0.5s_ease-in-out]">
      <h3 className="text-lg font-bold mb-2">다음 목표:</h3>
      <p>{text}</p>
       <style>{`
        @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};