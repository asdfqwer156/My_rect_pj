export interface Vector2D {
  x: number;
  y: number;
}

export interface Paddle {
  x: number;
  width: number;
  height: number;
}

export interface Ball {
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
}

export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  color: string;
  points: number;
}

export enum GameState {
  START,
  PLAYING,
  LEVEL_COMPLETE,
  GAME_OVER,
}