import React, { useRef, useEffect, useState } from 'react';
import { 
  GAME_WIDTH, GAME_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_Y, 
  BALL_RADIUS, BRICK_GAP, BRICK_HEIGHT, BRICK_OFFSET_LEFT, BRICK_OFFSET_TOP, 
  LEVEL_CONFIGS 
} from '../constants';
import { Ball, Brick, Paddle, Vector2D } from '../types';

interface GameBoardProps {
  setScore: React.Dispatch<React.SetStateAction<number>>;
  lives: number;
  setLives: React.Dispatch<React.SetStateAction<number>>;
  level: number;
  onGameOver: (score: number) => void;
  onLevelComplete: (score: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  setScore, lives, setLives, level, onGameOver, onLevelComplete 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const scoreRef = useRef(0);
  
  // Game state refs (using refs for loop performance)
  const paddleRef = useRef<Paddle>({ x: GAME_WIDTH / 2 - PADDLE_WIDTH / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT });
  const ballRef = useRef<Ball>({ 
    position: { x: GAME_WIDTH / 2, y: PADDLE_Y - 20 }, 
    velocity: { x: 3, y: -3 }, 
    radius: BALL_RADIUS 
  });
  const bricksRef = useRef<Brick[]>([]);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Initialize Level
  useEffect(() => {
    scoreRef.current = 0; // Reset score ref on level change
    setScore(0);
    const config = LEVEL_CONFIGS[(level - 1) % LEVEL_CONFIGS.length];
    
    // Initialize Ball Speed
    const speed = config.ballSpeed;
    ballRef.current = {
      position: { x: GAME_WIDTH / 2, y: PADDLE_Y - 20 },
      velocity: { x: speed * (Math.random() > 0.5 ? 1 : -1), y: -speed },
      radius: BALL_RADIUS
    };

    // Initialize Paddle
    paddleRef.current = { x: GAME_WIDTH / 2 - PADDLE_WIDTH / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT };

    // Initialize Bricks
    const newBricks: Brick[] = [];
    const { rows, cols } = config.brickLayout;
    const totalGap = (cols - 1) * BRICK_GAP;
    const availableWidth = GAME_WIDTH - (BRICK_OFFSET_LEFT * 2) - totalGap;
    const brickWidth = availableWidth / cols;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const colorInfo = config.colors[r % config.colors.length];
        newBricks.push({
          x: BRICK_OFFSET_LEFT + c * (brickWidth + BRICK_GAP),
          y: BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_GAP),
          width: brickWidth,
          height: BRICK_HEIGHT,
          active: true,
          color: colorInfo.color,
          points: colorInfo.points
        });
      }
    }
    bricksRef.current = newBricks;

  }, [level, setScore]);

  // Input listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysPressed.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const update = () => {
      // 1. Move Paddle
      if (keysPressed.current['ArrowLeft']) {
        paddleRef.current.x -= 8;
        if (paddleRef.current.x < 0) paddleRef.current.x = 0;
      }
      if (keysPressed.current['ArrowRight']) {
        paddleRef.current.x += 8;
        if (paddleRef.current.x + PADDLE_WIDTH > GAME_WIDTH) paddleRef.current.x = GAME_WIDTH - PADDLE_WIDTH;
      }

      // 2. Move Ball
      const ball = ballRef.current;
      ball.position.x += ball.velocity.x;
      ball.position.y += ball.velocity.y;

      // 3. Wall Collisions
      if (ball.position.x + ball.radius > GAME_WIDTH || ball.position.x - ball.radius < 0) {
        ball.velocity.x *= -1;
      }
      if (ball.position.y - ball.radius < 0) {
        ball.velocity.y *= -1;
      }

      // 4. Paddle Collision
      const paddle = paddleRef.current;
      if (
        ball.position.y + ball.radius > PADDLE_Y &&
        ball.position.y - ball.radius < PADDLE_Y + PADDLE_HEIGHT &&
        ball.position.x > paddle.x &&
        ball.position.x < paddle.x + paddle.width
      ) {
         let collidePoint = ball.position.x - (paddle.x + paddle.width / 2);
         collidePoint = collidePoint / (paddle.width / 2);
         const angle = collidePoint * (Math.PI / 3);
         const speed = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y);
         ball.velocity.x = speed * Math.sin(angle);
         ball.velocity.y = -speed * Math.cos(angle);
      }

      // 5. Bottom Collision (Lose Life)
      if (ball.position.y - ball.radius > GAME_HEIGHT) {
         setLives(prev => {
           const newLives = prev - 1;
           if (newLives <= 0) {
             onGameOver(scoreRef.current);
             return 0;
           }
           ball.position = { x: GAME_WIDTH / 2, y: PADDLE_Y - 20 };
           const speed = LEVEL_CONFIGS[(level - 1) % LEVEL_CONFIGS.length].ballSpeed;
           ball.velocity = { x: speed * (Math.random() > 0.5 ? 1 : -1), y: -speed };
           return newLives;
         });
      }

      // 6. Brick Collision
      let activeBricksCount = 0;
      bricksRef.current.forEach(brick => {
        if (brick.active) {
          if (
            ball.position.x + ball.radius > brick.x &&
            ball.position.x - ball.radius < brick.x + brick.width &&
            ball.position.y + ball.radius > brick.y &&
            ball.position.y - ball.radius < brick.y + brick.height
          ) {
            brick.active = false;
            ball.velocity.y *= -1;
            scoreRef.current += brick.points;
            setScore(scoreRef.current);
          } else {
            activeBricksCount++;
          }
        }
      });

      if (activeBricksCount === 0 && bricksRef.current.length > 0) {
        onLevelComplete(scoreRef.current);
      }

      // Draw
      draw(ctx);
      requestRef.current = requestAnimationFrame(update);
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
      // Clear with background color
      ctx.fillStyle = '#d1d5db'; // gray-300
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Draw Paddle
      ctx.fillStyle = '#4b5563'; // gray-600
      ctx.fillRect(paddleRef.current.x, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT);
      
      // Draw Ball
      ctx.beginPath();
      ctx.arc(ballRef.current.position.x, ballRef.current.position.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#111827'; // gray-900
      ctx.fill();
      ctx.closePath();

      // Draw Bricks
      bricksRef.current.forEach(brick => {
        if (brick.active) {
            ctx.fillStyle = brick.color;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            ctx.strokeStyle = '#d1d5db'; // background color for separation
            ctx.lineWidth = 2;
            ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
        }
      });
    };

    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [level, setLives, onGameOver, onLevelComplete, setScore]);

  return (
    <canvas 
        ref={canvasRef} 
        width={GAME_WIDTH} 
        height={GAME_HEIGHT}
        className="block"
    />
  );
};

export default GameBoard;