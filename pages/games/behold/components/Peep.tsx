
import React from 'react';
import type { Character, GameEvent } from '../types';
import { CharacterType } from '../types';
import { PEEP_SIZE } from '../constants';

interface PeepProps {
  peep: Character;
  peeps: Character[];
}

interface PeepBodyProps {
    type: CharacterType;
    shape: 'circle' | 'square';
    hasHat?: boolean;
    event?: GameEvent | null;
    isAttacking?: boolean;
    isFrozen?: boolean;
}

const PeepBody: React.FC<PeepBodyProps> = React.memo(({ type, shape, hasHat, event, isAttacking, isFrozen }) => {
  const headShapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-md';
  const isFallen = type === CharacterType.FALLEN;
  const isYelling = event?.type === 'hat_hate' || event?.type === 'square_anger';
  const headBG = type === CharacterType.ANGRY ? 'bg-red-400' : 'bg-white';

  const normalFace = <div className="mt-1 w-4 h-0.5 bg-black"></div>;
  const angryFace = (
    <div className="relative w-7 h-4">
      <div className="absolute w-3.5 h-0.5 bg-black transform -rotate-12 top-0 left-0"></div>
      <div className="absolute w-3.5 h-0.5 bg-black transform rotate-12 top-0 right-0"></div>
    </div>
  );
  const scaredFace = <div className="mt-1 w-4 h-4 border-2 border-black rounded-full"></div>;
  const yellingFace = <div className="mt-1 w-6 h-5 bg-black rounded-md border-2 border-black"></div>;
  const fallenFace = null;
  const attackingFace = <div className="mt-1 text-red-500 font-black text-2xl animate-pulse">!!!</div>;


  let face;
  if (isFallen) face = fallenFace;
  else if (isAttacking) face = attackingFace;
  else if (isYelling) face = yellingFace;
  else {
    face = {
      [CharacterType.NORMAL]: normalFace,
      [CharacterType.ANGRY]: angryFace,
      [CharacterType.SCARED]: scaredFace,
    }[type] || normalFace;
  }
  
  const hat = (
    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-4 z-20">
        <div className="absolute bottom-1 left-0 w-full h-1 bg-black rounded-full"></div>
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-4 bg-black rounded-t-md"></div>
    </div>
  );
  
  const animationClass = {
    [CharacterType.ANGRY]: 'animate-shake-angry',
    [CharacterType.SCARED]: 'animate-shake-scared',
  }[type] || '';
  
  let dynamicClass = '';
  if (!isFallen && !isFrozen) {
    dynamicClass = 'animate-walk';
  }

  const fallenClass = isFallen ? 'fallen' : '';

  return (
    <div className={`relative ${animationClass} ${dynamicClass} ${fallenClass}`} style={{width: PEEP_SIZE, height: PEEP_SIZE}}>
        {/* HEAD */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 border-2 border-black ${headBG} flex flex-col items-center justify-start z-10 ${headShapeClass}`}>
          {!isFallen && hasHat && hat}
          {!isFallen && (
            <>
                <div className="flex items-center justify-center space-x-3 absolute top-3">
                    <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                </div>
                <div className="flex items-center justify-center absolute top-5">
                    {face}
                </div>
            </>
          )}
        </div>
        {/* BODY */}
        {!isFallen && (
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-5 bg-white border-b-2 border-l-2 border-r-2 border-black ${shape === 'circle' ? 'rounded-b-xl' : ''}`}>
            </div>
        )}
    </div>
  );
});

const Cricket: React.FC = () => (
    <div className="absolute z-20 animate-pulse" style={{ top: '45px', left: '50%', transform: 'translateX(-50%)' }}>
        <div className="relative w-4 h-2 bg-green-800">
            <div className="absolute -top-1 left-0.5 w-px h-2 bg-black transform -rotate-45"></div>
            <div className="absolute -top-1 right-0.5 w-px h-2 bg-black transform rotate-45"></div>
        </div>
    </div>
);

export const Peep: React.FC<PeepProps> = ({ peep, peeps }) => {
  const { x, y, type, isEventTarget, event, hasHat, shape, isAttackingTimestamp, isFrozen } = peep;

  let specialEffect = null;

  if (isEventTarget && event) {
    switch (event.type) {
      case 'cricket':
        specialEffect = <Cricket />;
        break;
    }
  }
  
  const isAttacking = !!isAttackingTimestamp && Date.now() - isAttackingTimestamp < 1000;

  return (
    <>
      <div
        className="absolute"
        style={{ transform: `translate(${x}px, ${y}px)` }}
      >
        <PeepBody type={type} hasHat={hasHat} shape={shape} event={event} isAttacking={isAttacking} isFrozen={isFrozen} />
        {specialEffect}
      </div>
    </>
  );
};
