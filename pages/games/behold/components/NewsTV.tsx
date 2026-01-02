
import React from 'react';
import type { NewsPost } from '../types';

interface NewsTVProps {
  post: NewsPost | undefined;
  showInstruction: boolean;
}

export const NewsTV: React.FC<NewsTVProps> = ({ post, showInstruction }) => {
  return (
    <div 
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
      style={{width: '240px'}}
    >
      {/* Antennas */}
      <div className="relative w-full h-4">
        <div className="absolute bottom-0 left-1/2 w-0.5 h-6 bg-black transform -translate-x-4 -rotate-45"></div>
        <div className="absolute bottom-0 left-1/2 w-0.5 h-6 bg-black transform translate-x-4 rotate-45"></div>
      </div>

      {/* Screen */}
      <div className="w-full aspect-video bg-gray-800 border-2 border-black p-1 flex items-center justify-center text-center text-white font-bold text-lg leading-tight relative overflow-hidden">
        {showInstruction && !post && (
            <span className="animate-pulse">빈 공간을 촬영하세요</span>
        )}
        {post && (
          <div key={post.id} className="w-full h-full animate-[fadein_0.5s_ease-in-out]">
              <img 
                  src={post.capturedImage || ''} 
                  alt="포착된 순간" 
                  className="w-full h-full object-cover" 
              />
              <div className="absolute bottom-1 left-1 right-1 bg-red-600 p-1 text-white text-center font-mono text-sm z-10">
                  <span>{post.headline}</span>
              </div>
          </div>
        )}
      </div>

      {/* Stand */}
      <div className="w-1 h-12 bg-black"></div>

      <style>{`
        @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};