
import React from 'react';
import { CAMERA_SIZE } from '../constants';

interface CameraViewfinderProps {
  mousePos: { x: number; y: number };
}

export const CameraViewfinder: React.FC<CameraViewfinderProps> = ({ mousePos }) => {
  const style = {
    transform: `translate(${mousePos.x - CAMERA_SIZE / 2}px, ${mousePos.y - CAMERA_SIZE / 2}px)`,
    width: `${CAMERA_SIZE}px`,
    height: `${CAMERA_SIZE}px`,
  };

  return (
    <div 
      className="absolute pointer-events-none z-30 transition-transform duration-75 ease-out" 
      style={style}
    >
      <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-black"></div>
      <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-black"></div>
      <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-black"></div>
      <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-black"></div>
    </div>
  );
};
