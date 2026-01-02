import React, { useRef, useEffect, useState } from 'react';
import { 
  GAME_WIDTH, GAME_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_Y, 
  BALL_RADIUS, BRICK_GAP, BRICK_HEIGHT, BRICK_OFFSET_LEFT, BRICK_OFFSET_TOP, 
  LEVEL_CONFIGS 
} from '../constants';
import { Ball, Brick, Paddle, Vector2D } from '../types';

interface GameBoardProps {
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  lives: number;
  setLives: React.Dispatch<React.SetStateAction<number>>;
  level: number;
  onGameOver: (score: number) => void;
  onLevelComplete: (score: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  score, setScore, lives, setLives, level, onGameOver, onLevelComplete 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
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
    // Calculate dynamic brick width based on cols
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

  }, [level]);

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
        paddleRef.current.x -= 7;
        if (paddleRef.current.x < 0) paddleRef.current.x = 0;
      }
      if (keysPressed.current['ArrowRight']) {
        paddleRef.current.x += 7;
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
         // Simple physics: angle changes based on where it hit the paddle
         let collidePoint = ball.position.x - (paddle.x + paddle.width / 2);
         collidePoint = collidePoint / (paddle.width / 2);
         
         const angle = collidePoint * (Math.PI / 3); // Max 60 degrees
         const speed = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y);
         
         ball.velocity.x = speed * Math.sin(angle);
         ball.velocity.y = -speed * Math.cos(angle);
      }

      // 5. Bottom Collision (Lose Life)
      if (ball.position.y - ball.radius > GAME_HEIGHT) {
         setLives(prev => {
           const newLives = prev - 1;
           if (newLives <= 0) {
             onGameOver(score);
             return 0;
           }
           // Reset Ball
           ball.position = { x: GAME_WIDTH / 2, y: PADDLE_Y - 20 };
           ball.velocity = { x: 4 * (Math.random() > 0.5 ? 1 : -1), y: -4 };
           return newLives;
         });
      }

      // 6. Brick Collision
      let activeBricksCount = 0;
      bricksRef.current.forEach(brick => {
        if (brick.active) {
          if (
            ball.position.x > brick.x &&
            ball.position.x < brick.x + brick.width &&
            ball.position.y > brick.y &&
            ball.position.y < brick.y + brick.height
          ) {
            brick.active = false;
            ball.velocity.y *= -1;
            setScore(prev => prev + brick.points);
          } else {
            activeBricksCount++;
          }
        }
      });

      if (activeBricksCount === 0) {
        onLevelComplete(score);
      }

      // Draw
      draw(ctx);
      requestRef.current = requestAnimationFrame(update);
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
      // Clear
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Draw Paddle
      ctx.fillStyle = '#06b6d4'; // cyan-500
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.fillRect(paddleRef.current.x, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.shadowBlur = 0;

      // Draw Ball
      ctx.beginPath();
      ctx.arc(ballRef.current.position.x, ballRef.current.position.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.closePath();

      // Draw Bricks
      bricksRef.current.forEach(brick => {
        if (brick.active) {
            // Mapping Tailwind colors to approximate hex for canvas
            let color = '#ffffff';
            if (brick.color.includes('red')) color = '#ef4444';
            else if (brick.color.includes('orange')) color = '#f97316';
            else if (brick.color.includes('yellow')) color = '#eab308';
            else if (brick.color.includes('green')) color = '#22c55e';
            else if (brick.color.includes('blue')) color = '#3b82f6';
            else if (brick.color.includes('purple')) color = '#9333ea';
            else if (brick.color.includes('pink')) color = '#ec4899';
            else if (brick.color.includes('gray')) color = '#9ca3af';

            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 5;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            ctx.shadowBlur = 0;
        }
      });
    };

    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [lives, level, onGameOver, onLevelComplete, score, setLives, setScore]); // Dependencies for loop

  return (
    <div className="relative">
        <div className="absolute top-4 left-4 text-white text-xl font-bold">
            SCORE: {score}
        </div>
        <div className="absolute top-4 right-4 text-white text-xl font-bold">
            LIVES: {lives}
        </div>
        <canvas 
            ref={canvasRef} 
            width={GAME_WIDTH} 
            height={GAME_HEIGHT}
            className="block"
        />
    </div>
  );
};

export default GameBoard;