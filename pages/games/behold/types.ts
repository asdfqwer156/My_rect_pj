
export enum CharacterType {
  NORMAL = 'NORMAL',
  ANGRY = 'ANGRY',
  SCARED = 'SCARED',
  FALLEN = 'FALLEN',
}

export interface GameEvent {
    type: 'cricket' | 'anger' | 'hat_hate' | 'violence' | 'square_anger' | 'mass_violence';
    payload?: any;
}

export interface Character {
  id: number;
  x: number;
  y: number;
  type: CharacterType;
  shape: 'circle' | 'square';
  direction: { x: number; y: number };
  isEventTarget: boolean;
  event: GameEvent | null;
  hasHat: boolean;
  fallenTimestamp?: number;
  isAttackingTimestamp?: number;
  isFrozen?: boolean;
}

export interface CapturedPeep {
    type: CharacterType;
    shape: 'circle' | 'square';
    hasHat?: boolean;
}

export interface NewsPost {
  id: number;
  headline: string;
  capturedPeeps: CapturedPeep[];
  capturedImage: string | null;
}

export type GamePhase = 'TITLE' | 'PLAYING' | 'ENDING' | 'FINAL_MESSAGE';

export type GameStage = 
  | 'START' 
  | 'AWAIT_CRICKET' 
  | 'AWAIT_HAT_HATE' 
  | 'AWAIT_VIOLENCE' 
  | 'AWAIT_SQUARE_ANGER'
  | 'AWAIT_MASS_VIOLENCE'
  | 'END';
