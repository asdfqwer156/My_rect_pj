import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Character, NewsPost, GameStage } from '../types';
import { CharacterType } from '../types';
import { Peep } from './Peep';
import { CameraViewfinder } from './CameraView';
import { NewsTV } from './NewsTV';
import { HintBox } from './HintBox';
import { GAME_WIDTH, GAME_HEIGHT, PEEP_SIZE, CAMERA_SIZE, PEEP_SPEED, ANGRY_PEEP_SPEED, TV_COLLISION_BOX } from '../constants';
import { drawPeepOnCanvas } from '../services/drawingService';


type AnimationPhase = 'IDLE' | 'SHUTTER' | 'ZOOM_IN' | 'SHOWING_NEWS' | 'ZOOM_OUT';

interface GameScreenProps {
  peeps: Character[];
  setPeeps: React.Dispatch<React.SetStateAction<Character[]>>;
  onCapture: (capturedPeeps: Character[], imageDataUrl: string) => void;
  latestPost: NewsPost | undefined;
  showInstruction: boolean;
  animationPhase: AnimationPhase;
  currentStage: GameStage;
}

const getHintText = (stage: GameStage): string => {
    switch (stage) {
        case 'START':
            return "아무것도 없는 곳을 촬영해 보세요.";
        case 'AWAIT_CRICKET':
            return "귀뚜라미 소리에 짜증 내는 사람을 찾아 촬영하세요.";
        case 'AWAIT_HAT_HATE':
            return "증오가 퍼졌습니다. 모자를 둘러싼 갈등을 촬영하세요.";
        case 'AWAIT_VIOLENCE':
            return "폭력의 순간을 촬영하여 증오를 퍼뜨리세요.";
        case 'AWAIT_SQUARE_ANGER':
            return "네모의 분노를 촬영하여 갈등을 심화시키세요.";
        case 'AWAIT_MASS_VIOLENCE':
            return "이 광기를 촬영하여 이야기를 마무리하세요.";
        default:
            return '';
    }
};

export const GameScreen: React.FC<GameScreenProps> = ({ peeps, setPeeps, onCapture, latestPost, showInstruction, animationPhase, currentStage }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const gameAreaRef = useRef<HTMLDivElement>(null);
  // FIX: Explicitly provide `undefined` as the initial value for `useRef` to fix the "Expected 1 arguments, but got 0" error.
  const animationFrameId = useRef<number | undefined>(undefined);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const scaleX = GAME_WIDTH / rect.width;
      const scaleY = GAME_HEIGHT / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      setMousePos({ x, y });
    }
  };

  // FIX: The handleClick function was refactored to be asynchronous. This ensures that the image loading and canvas drawing operations complete before the onCapture callback is invoked, resolving a race condition where the capture might occur before the image is fully rendered.
  const handleClick = async () => {
    if (animationPhase !== 'IDLE') return;

    const cameraX = mousePos.x - CAMERA_SIZE / 2;
    const cameraY = mousePos.y - CAMERA_SIZE / 2;
    
    const captured = peeps.filter(peep => {
      const peepCenterX = peep.x + PEEP_SIZE / 2;
      const peepCenterY = peep.y + PEEP_SIZE / 2;
      return peepCenterX > cameraX && peepCenterX < cameraX + CAMERA_SIZE &&
             peepCenterY > cameraY && peepCenterY < cameraY + CAMERA_SIZE;
    });

    const canvas = document.createElement('canvas');
    canvas.width = CAMERA_SIZE;
    canvas.height = CAMERA_SIZE;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;
    
    ctx.fillStyle = '#EAEAEA';
    ctx.fillRect(0, 0, CAMERA_SIZE, CAMERA_SIZE);

    const backgroundSvg = `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><g fill="#d8d8d8" fill-opacity="0.4" fill-rule="evenodd"><path d="M0 40L40 0H20L0 20M40 40V20L20 40"/></g></svg>`;
    const img = new Image();

    const loadImage = new Promise<HTMLImageElement | null>((resolve) => {
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = `data:image/svg+xml,${encodeURIComponent(backgroundSvg)}`;
    });

    const loadedImg = await loadImage;

    if (loadedImg) {
      const pattern = ctx.createPattern(loadedImg, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, CAMERA_SIZE, CAMERA_SIZE);
      }
    }

    captured.forEach(peep => {
        ctx.save();
        ctx.translate(peep.x - cameraX, peep.y - cameraY);
        drawPeepOnCanvas(ctx, peep);
        ctx.restore();
    });
    
    onCapture(captured, canvas.toDataURL('image/png'));
  };

  const gameLoop = useCallback(() => {
    setPeeps(prevPeeps => {
      let nextPeeps = [...prevPeeps];
      
      nextPeeps = JSON.parse(JSON.stringify(nextPeeps));

      for (const peep of nextPeeps) {
        if (peep.isFrozen) continue;

        const isViolentEvent = peep.event?.type === 'violence' || peep.event?.type === 'square_anger' || peep.event?.type === 'mass_violence';
        if (isViolentEvent && peep.event.payload?.targetId) {
          const target = nextPeeps.find(p => p.id === peep.event.payload.targetId);
          if (target && target.type !== CharacterType.FALLEN) {
            const dist = Math.hypot(target.x - peep.x, target.y - peep.y);
            if (dist < PEEP_SIZE * 0.75) {
              target.type = CharacterType.FALLEN;
              target.fallenTimestamp = Date.now();
              target.isFrozen = true;

              peep.isAttackingTimestamp = Date.now();
              peep.isFrozen = true;

              if (peep.event.type !== 'mass_violence') peep.event = null;
              else delete peep.event.payload.targetId;

              for (const bystander of nextPeeps) {
                if (bystander.type === CharacterType.NORMAL || bystander.type === CharacterType.ANGRY) {
                  const bystanderDist = Math.hypot(bystander.x - target.x, bystander.y - target.y);
                  if (bystanderDist < CAMERA_SIZE * 1.5 && bystander.id !== peep.id && bystander.id !== target.id) {
                    bystander.type = CharacterType.SCARED;
                    bystander.isFrozen = true;
                  }
                }
              }
            }
          }
        }
      }

      nextPeeps = nextPeeps.map(peep => {
        if (peep.isFrozen) return peep;

        if (peep.isAttackingTimestamp) {
          if (Date.now() - peep.isAttackingTimestamp < 1000) {
            return peep;
          } else {
            peep.isAttackingTimestamp = undefined;
          }
        }
        
        if (peep.type === CharacterType.FALLEN) return peep;

        let { x, y, direction, type } = peep;
        let speed = type === CharacterType.ANGRY ? ANGRY_PEEP_SPEED : PEEP_SPEED;
        if (type === CharacterType.SCARED) speed *= 1.5;

        if (peep.event?.type === 'mass_violence') {
             if (!peep.event.payload?.targetId && Math.random() < 0.02) {
                const potentialTargets = nextPeeps.filter(t => t.id !== peep.id && t.type !== CharacterType.FALLEN);
                if (potentialTargets.length > 0) {
                    const target = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
                    peep.event.payload = { ...peep.event.payload, targetId: target.id };
                }
            }
            if(peep.event.payload?.targetId) {
                const target = nextPeeps.find(p => p.id === peep.event.payload.targetId);
                if(target) direction = { x: target.x - x, y: target.y - y };
            }
        } else if (peep.event?.type === 'violence' || peep.event?.type === 'square_anger' || peep.event?.type === 'hat_hate') {
            const target = nextPeeps.find(p => p.id === peep.event.payload.targetId);
            if(target) direction = { x: target.x - x, y: target.y - y };
        } else if (Math.random() < 0.01) {
            direction = { x: (Math.random() - 0.5), y: (Math.random() - 0.5) };
        }
        
        const mag = Math.hypot(direction.x, direction.y) || 1;
        let nextX = x + (direction.x / mag) * speed;
        let nextY = y + (direction.y / mag) * speed;
        
        if (nextX < 0) { nextX = 0; direction.x *= -1; }
        else if (nextX > GAME_WIDTH - PEEP_SIZE) { nextX = GAME_WIDTH - PEEP_SIZE; direction.x *= -1; }

        if (nextY < 0) { nextY = 0; direction.y *= -1; }
        else if (nextY > GAME_HEIGHT - PEEP_SIZE) { nextY = GAME_HEIGHT - PEEP_SIZE; direction.y *= -1; }
        
        const peepBox = { x: nextX, y: nextY, width: PEEP_SIZE, height: PEEP_SIZE };
        if (peepBox.x < TV_COLLISION_BOX.x + TV_COLLISION_BOX.width && peepBox.x + peepBox.width > TV_COLLISION_BOX.x && peepBox.y < TV_COLLISION_BOX.y + TV_COLLISION_BOX.height && peepBox.y + peepBox.height > TV_COLLISION_BOX.y) {
            direction.x *= -1;
            direction.y *= -1;
             nextX = x + direction.x * speed;
             nextY = y + direction.y * speed;
        }

        return { ...peep, x: nextX, y: nextY, direction };
      });

      return nextPeeps;
    });

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [setPeeps]);

  useEffect(() => {
    if (animationPhase === 'IDLE') {
        animationFrameId.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if(animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameLoop, animationPhase]);

  const gameContainerStyle = {
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      transform: ['ZOOM_IN', 'SHOWING_NEWS'].includes(animationPhase) ? 'scale(3)' : 'scale(1)',
      transition: 'transform 1s ease-in-out',
      transformOrigin: '50% 50%',
  };

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <div
            ref={gameAreaRef}
            className="relative z-10 cursor-none bg-[#EAEAEA] overflow-hidden"
            style={gameContainerStyle}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
        >
            {animationPhase === 'SHUTTER' && (
                <div 
                    className="absolute inset-0 bg-white z-50"
                    style={{ animation: 'shutter-flash 150ms ease-in-out' }}
                ></div>
            )}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22%23d8d8d8%22%20fill-opacity%3D%220.4%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M0%2040L40%200H20L0%2020M40%2040V20L20%2040%22/%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
            <NewsTV post={latestPost} showInstruction={showInstruction} />
            {peeps.map(peep => (
                <Peep key={peep.id} peep={peep} peeps={peeps} />
            ))}
            {animationPhase === 'IDLE' && <CameraViewfinder mousePos={mousePos} />}
        </div>
        {animationPhase === 'IDLE' && <HintBox text={getHintText(currentStage)} />}
        <style>{`
            @keyframes shutter-flash {
                0% { opacity: 0; }
                50% { opacity: 0.9; }
                100% { opacity: 0; }
            }
            @keyframes shake-angry {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
                20%, 40%, 60%, 80% { transform: translateX(2px); }
            }
            @keyframes shake-scared {
                0%, 100% { transform: translate(0, 0); }
                25% { transform: translate(1px, 1px); }
                50% { transform: translate(-1px, -1px); }
                75% { transform: translate(1px, -1px); }
            }
            @keyframes walk-bob {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-3px); }
            }
            .animate-walk {
                animation: walk-bob 0.5s infinite ease-in-out;
            }
            .animate-shake-angry {
                animation: shake-angry 0.4s infinite;
            }
            .animate-shake-scared {
                animation: shake-scared 0.2s infinite;
            }
            .fallen {
                transform: rotate(90deg) !important;
                transition: transform 0.3s ease-in-out;
            }
        `}</style>
    </div>
  );
};