// Game board
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// Paddle
export const PADDLE_WIDTH = 120;
export const PADDLE_HEIGHT = 20;
export const PADDLE_Y = GAME_HEIGHT - PADDLE_HEIGHT - 10;

// Ball
export const BALL_RADIUS = 10;
export const INITIAL_BALL_SPEED = 5;

// Bricks
export const BRICK_ROWS = 5;
export const BRICK_COLS = 10;
export const BRICK_HEIGHT = 25;
export const BRICK_GAP = 5;
export const BRICK_OFFSET_TOP = 50;
export const BRICK_OFFSET_LEFT = 30;

// Game
export const INITIAL_LIVES = 3;

// Brick colors and points for different levels
export const LEVEL_CONFIGS = [
  // Level 1
  {
    ballSpeed: 5,
    brickLayout: {
      rows: 5,
      cols: 10,
    },
    colors: [
      { color: "bg-red-500", points: 50 },
      { color: "bg-orange-500", points: 40 },
      { color: "bg-yellow-500", points: 30 },
      { color: "bg-green-500", points: 20 },
      { color: "bg-blue-500", points: 10 },
    ]
  },
  // Level 2
  {
    ballSpeed: 6,
    brickLayout: {
      rows: 6,
      cols: 11,
    },
    colors: [
      { color: "bg-purple-600", points: 60 },
      { color: "bg-pink-500", points: 50 },
      { color: "bg-red-500", points: 40 },
      { color: "bg-orange-500", points: 30 },
      { color: "bg-yellow-500", points: 20 },
      { color: "bg-green-500", points: 10 },
    ]
  },
   // Level 3
  {
    ballSpeed: 7,
    brickLayout: {
      rows: 7,
      cols: 12,
    },
    colors: [
      { color: "bg-gray-400", points: 100 },
      { color: "bg-purple-600", points: 80 },
      { color: "bg-pink-500", points: 70 },
      { color: "bg-red-500", points: 60 },
      { color: "bg-orange-500", points: 50 },
      { color: "bg-yellow-500", points: 40 },
      { color: "bg-green-500", points: 30 },
    ]
  }
];