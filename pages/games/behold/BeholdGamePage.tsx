

import React, { useState, useCallback, useEffect } from 'react';
import { GameScreen } from './components/GameScreen';
// FIX: Import GamePhase type to resolve type errors.
import type { Character, NewsPost, GameEvent, GameStage, GamePhase } from './types';
import { CharacterType } from './types';
import { GAME_WIDTH, GAME_HEIGHT, NUM_PEEPS, TV_COLLISION_BOX, PEEP_SIZE } from './constants';
import { generateHeadline } from './services/geminiService';
import { ApiErrorNotification } from './components/ApiErrorNotification';

type AnimationPhase = 'IDLE' | 'SHUTTER' | 'ZOOM_IN' | 'SHOWING_NEWS' | 'ZOOM_OUT';

const createInitialPeeps = (): Character[] => {
  const peeps: Character[] = [];
  while (peeps.length < NUM_PEEPS) {
    const x = Math.random() * (GAME_WIDTH - PEEP_SIZE);
    const y = Math.random() * (GAME_HEIGHT - PEEP_SIZE);

    const isCollidingWithTV =
      x < TV_COLLISION_BOX.x + TV_COLLISION_BOX.width &&
      x + PEEP_SIZE > TV_COLLISION_BOX.x &&
      y < TV_COLLISION_BOX.y + TV_COLLISION_BOX.height &&
      y + PEEP_SIZE > TV_COLLISION_BOX.y;

    if (!isCollidingWithTV) {
      peeps.push({
        id: Date.now() + peeps.length,
        x,
        y,
        type: CharacterType.NORMAL,
        shape: Math.random() > 0.5 ? 'circle' : 'square',
        direction: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },
        isEventTarget: false,
        event: null,
        hasHat: false,
      });
    }
  }
  return peeps;
};

const TitleScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-50 text-white font-mono">
    <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-pulse">우리가 보는 것이</h1>
    <h2 className="text-5xl md:text-7xl font-bold mb-12 animate-pulse">곧 우리 자신이 된다</h2>
    <p className="text-xl mb-8 text-center max-w-2xl">작은 차이를 괴물로 만드는 미디어에 대한 5분짜리 게임입니다.<br/>화면의 순간을 포착하여 세상이 어떻게 변하는지 지켜보세요.</p>
    <button
      onClick={onStart}
      className="bg-white text-black px-8 py-4 rounded-lg text-2xl font-bold hover:bg-yellow-300 transition-colors duration-300"
    >
      시작하기
    </button>
  </div>
);

const EndScreen: React.FC<{ title: string; message: string; onRestart: () => void }> = ({ title, message, onRestart }) => (
    <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col justify-center items-center z-50 text-white font-mono text-center">
        <h1 className="text-6xl font-bold mb-8">{title}</h1>
        <p className="text-2xl mb-12">{message}</p>
        <button
            onClick={onRestart}
            className="bg-white text-black px-8 py-4 rounded-lg text-2xl font-bold hover:bg-yellow-300 transition-colors duration-300"
        >
            다시하기
        </button>
    </div>
);

const FinalMessageScreen: React.FC<{ onAcknowledge: () => void }> = ({ onAcknowledge }) => {
    useEffect(() => {
        const timer = setTimeout(onAcknowledge, 4000);
        return () => clearTimeout(timer);
    }, [onAcknowledge]);

    return (
        <div className="absolute inset-0 bg-black flex flex-col justify-center items-center z-50 text-white font-mono text-center">
            <h1 className="text-4xl animate-pulse">우리가 보는 것이</h1>
            <h2 className="text-4xl animate-pulse">곧 우리 자신이 된다</h2>
        </div>
    );
};


const BeholdGamePage: React.FC = () => {
  const [peeps, setPeeps] = useState<Character[]>(createInitialPeeps);
  const [newsFeed, setNewsFeed] = useState<NewsPost[]>([]);
  // FIX: The `gamePhase` state was incorrectly typed as `GameStage`. It's now correctly typed as `GamePhase` to manage the overall game state (TITLE, PLAYING, etc.).
  const [gamePhase, setGamePhase] = useState<GamePhase>('TITLE');
  const [currentStage, setCurrentStage] = useState<GameStage>('START');
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('IDLE');
  const [postToShowOnTV, setPostToShowOnTV] = useState<NewsPost | undefined>();
  const [apiError, setApiError] = useState<string | null>(null);
  const [peepUpdateQueue, setPeepUpdateQueue] = useState<(() => void) | null>(null);


  const showFinalMessage = () => {
    setGamePhase('FINAL_MESSAGE');
  };

  const resetGame = useCallback(() => {
    setPeeps(createInitialPeeps());
    setNewsFeed([]);
    setGamePhase('PLAYING');
    setCurrentStage('START');
    setAnimationPhase('IDLE');
    setPostToShowOnTV(undefined);
    setApiError(null);
  }, []);

  const handleCapture = useCallback(async (capturedPeeps: Character[], imageDataUrl: string) => {
    const eventPeep = capturedPeeps.find(p => p.isEventTarget && p.event);
    const eventPeepId = eventPeep?.id;

    const stageAtCapture = currentStage;
    let prompt = '';
    let nextStage: GameStage = currentStage;
    let effect: 'anger' | 'mass_anger' | 'anger_and_hat' | null = null;
    let nextEventDetails: { type: GameEvent['type'] } | null = null;
    let isValidCapture = false;

    switch (stageAtCapture) {
      case 'START':
        if (capturedPeeps.length === 0) {
            prompt = "조용한 저녁에 귀뚜라미가 울고 있습니다. 이 사소한 사건에 대해 약간 지루하지만 클릭을 유도하는 뉴스 헤드라인을 만들어 주세요. 반드시 한국어로만 응답해 주세요.";
            nextStage = 'AWAIT_CRICKET';
            nextEventDetails = { type: 'cricket' };
            isValidCapture = true;
        }
        break;
      case 'AWAIT_CRICKET':
        if (eventPeep?.event?.type === 'cricket') {
            prompt = "귀뚜라미 소리에 대한 분노가 사람들을 분열시키기 시작합니다. 작은 갈등이 커지는 것에 대한 자극적인 헤드라인을 만들어 주세요.";
            nextStage = 'AWAIT_HAT_HATE';
            effect = 'anger_and_hat';
            nextEventDetails = { type: 'hat_hate' };
            isValidCapture = true;
        }
        break;
      case 'AWAIT_HAT_HATE':
        if (eventPeep?.event?.type === 'hat_hate') {
            prompt = "동그라미 사람이 모자를 쓴 네모난 사람에게 화를 내고 있습니다. 이 패션 갈등에 대한 짧고 분열을 조장하는 뉴스 헤드라인을 만들어 주세요.";
            nextStage = 'AWAIT_VIOLENCE';
            effect = 'anger';
            nextEventDetails = { type: 'violence' };
            isValidCapture = true;
        }
        break;
      case 'AWAIT_VIOLENCE':
        if (capturedPeeps.some(p => p.type === CharacterType.FALLEN)) {
            prompt = "결국 폭력이 시작되었습니다. 동그라미가 네모를 공격하는 장면에 대한 충격적이고 자극적인 헤드라인을 만드세요.";
            nextStage = 'AWAIT_SQUARE_ANGER';
            effect = 'anger';
            nextEventDetails = { type: 'square_anger' };
            isValidCapture = true;
        }
        break;
       case 'AWAIT_SQUARE_ANGER':
        if (capturedPeeps.some(p => p.type === CharacterType.FALLEN)) {
            prompt = "보복의 시간입니다. 모자를 쓴 네모가 동그라미에게 분노를 표출합니다. 이 갈등의 심화에 대한 편파적인 헤드라인을 만드세요.";
            nextStage = 'AWAIT_MASS_VIOLENCE';
            effect = 'mass_anger';
            isValidCapture = true;
        }
        break;
      case 'AWAIT_MASS_VIOLENCE':
          if(capturedPeeps.some(p => p.type === CharacterType.ANGRY)) {
            prompt = "증오가 세상을 집어삼켰습니다. 모두가 서로 싸우는 대혼란에 대한 종말론적인 헤드라인을 만드세요.";
            nextStage = 'END';
            effect = 'mass_anger';
            setTimeout(() => setGamePhase('ENDING'), 4000);
            isValidCapture = true;
          }
        break;
    }

    if (!isValidCapture) return;
    
    setAnimationPhase('SHUTTER');
    
    const result = await generateHeadline(prompt, stageAtCapture);

    if (result.error) setApiError(result.error);
    
    setNewsFeed(prev => [{
      id: Date.now() + Math.random(),
      headline: result.headline,
      capturedPeeps: capturedPeeps.map(p => ({type: p.type, hasHat: p.hasHat, shape: p.shape})),
      capturedImage: imageDataUrl,
    }, ...prev]);

    setCurrentStage(nextStage);

    const applyPeepChanges = () => {
        setPeeps(prevPeeps => {
            let newPeeps: Character[] = [...prevPeeps].map(p => ({ 
                ...p, 
                isEventTarget: false, 
                event: null, 
                type: p.type === CharacterType.SCARED ? CharacterType.NORMAL : p.type,
                isFrozen: false 
            }));

            if (stageAtCapture === 'AWAIT_VIOLENCE' || stageAtCapture === 'AWAIT_SQUARE_ANGER') {
                newPeeps = newPeeps.filter(p => p.type !== CharacterType.FALLEN);
            }

            const eventTargetIds = new Set<number>();

            if (effect === 'anger') {
                if (eventPeepId) {
                    const originalAngryPeep = newPeeps.find(p => p.id === eventPeepId);
                    if (originalAngryPeep) originalAngryPeep.type = CharacterType.ANGRY;
                }
                const normalPeepsToAffect = newPeeps.filter(p => p.type === CharacterType.NORMAL && !eventTargetIds.has(p.id));
                const numToChange = Math.ceil(normalPeepsToAffect.length * 0.2);
                normalPeepsToAffect.slice(0, numToChange).forEach(p => p.type = CharacterType.ANGRY);
            } else if (effect === 'anger_and_hat') {
                 if (eventPeepId) {
                    const originalAngryPeep = newPeeps.find(p => p.id === eventPeepId);
                    if (originalAngryPeep) originalAngryPeep.type = CharacterType.ANGRY;
                }
                const normalPeepsToAffect = newPeeps.filter(p => p.type === CharacterType.NORMAL);
                const numToChange = Math.ceil(normalPeepsToAffect.length * 0.2);
                normalPeepsToAffect.slice(0, numToChange).forEach(p => p.type = CharacterType.ANGRY);
                const squareToGetHat = newPeeps.find(p => p.shape === 'square' && p.type === CharacterType.NORMAL);
                if (squareToGetHat) {
                    squareToGetHat.hasHat = true;
                }
            } else if (effect === 'mass_anger') {
                newPeeps.forEach(p => {
                    if (!eventTargetIds.has(p.id)) {
                        p.type = CharacterType.ANGRY; p.event = { type: 'mass_violence' };
                    }
                });
            }

            if (nextEventDetails) {
                const { type } = nextEventDetails;
                if (type === 'cricket') {
                    const target = newPeeps.find(p => p.type === CharacterType.NORMAL);
                    if(target) {
                        target.isEventTarget = true; target.event = { type: 'cricket' }; eventTargetIds.add(target.id);
                    }
                } else if (type === 'hat_hate') {
                    const circle = newPeeps.find(p => p.shape === 'circle' && p.type !== CharacterType.ANGRY);
                    const hattedSquare = newPeeps.find(p => p.shape === 'square' && p.hasHat);
                    if (circle && hattedSquare) {
                        circle.type = CharacterType.ANGRY; circle.isEventTarget = true; circle.event = { type: 'hat_hate', payload: { targetId: hattedSquare.id } };
                        hattedSquare.isEventTarget = true;
                        eventTargetIds.add(circle.id); eventTargetIds.add(hattedSquare.id);
                    }
                } else if (type === 'violence') {
                    const attacker = newPeeps.find(p => p.type === CharacterType.ANGRY && p.shape === 'circle');
                    const target = newPeeps.find(p => p.hasHat && p.shape === 'square');
                    if (attacker && target) {
                        attacker.isEventTarget = true; attacker.event = { type: 'violence', payload: { targetId: target.id } };
                        target.isEventTarget = true;
                        eventTargetIds.add(attacker.id); eventTargetIds.add(target.id);
                    }
                } else if (type === 'square_anger') {
                    const attacker = newPeeps.find(p => p.shape === 'square' && p.hasHat);
                    const target = newPeeps.find(p => p.shape === 'circle' && p.type !== CharacterType.ANGRY);
                    if (attacker && target) {
                        attacker.type = CharacterType.ANGRY; attacker.isEventTarget = true; attacker.event = { type: 'square_anger', payload: { targetId: target.id } };
                        target.isEventTarget = true;
                        eventTargetIds.add(attacker.id); eventTargetIds.add(target.id);
                    }
                }
            }

            return newPeeps;
        });
    };
    
    setPeepUpdateQueue(() => applyPeepChanges);

  }, [currentStage]);

  useEffect(() => {
    let timer: number;
    if (animationPhase === 'SHUTTER') {
      timer = window.setTimeout(() => setAnimationPhase('ZOOM_IN'), 150);
    } else if (animationPhase === 'ZOOM_IN') {
      timer = window.setTimeout(() => { setPostToShowOnTV(newsFeed[0]); setAnimationPhase('SHOWING_NEWS'); }, 1000);
    } else if (animationPhase === 'SHOWING_NEWS') {
      timer = window.setTimeout(() => setAnimationPhase('ZOOM_OUT'), 2500);
    } else if (animationPhase === 'ZOOM_OUT') {
      timer = window.setTimeout(() => {
        if (peepUpdateQueue) {
          peepUpdateQueue();
          setPeepUpdateQueue(null);
        }
        setAnimationPhase('IDLE');
      }, 1000);
    }
    return () => window.clearTimeout(timer);
  }, [animationPhase, newsFeed, peepUpdateQueue]);
  
  const startGame = () => setGamePhase('PLAYING');
  
  return (
    <div className="w-screen h-screen bg-[#EAEAEA] font-mono select-none overflow-hidden relative">
        {gamePhase === 'PLAYING' &&
            <GameScreen 
                peeps={peeps}
                setPeeps={setPeeps}
                onCapture={handleCapture} 
                latestPost={postToShowOnTV}
                showInstruction={newsFeed.length === 0}
                animationPhase={animationPhase}
                currentStage={currentStage}
            />
        }
        {apiError && <ApiErrorNotification message={apiError} onClose={() => setApiError(null)} />}
        {gamePhase === 'TITLE' && <TitleScreen onStart={startGame} />}
        {gamePhase === 'ENDING' && <EndScreen title="증오가 세상을 삼켰다" message="당신의 선택이 폭력의 악순환을 만들었습니다." onRestart={showFinalMessage} />}
        {gamePhase === 'FINAL_MESSAGE' && <FinalMessageScreen onAcknowledge={resetGame} />}
    </div>
  );
};

export default BeholdGamePage;
