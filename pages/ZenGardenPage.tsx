import React, { useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../components/IconComponents';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speed: number;
  lineWidth: number;
}

const ZenGardenPage: React.FC = () => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ripples = useRef<Ripple[]>([]);
    const animationFrameId = useRef<number>();

    const createRipple = useCallback((x: number, y: number) => {
        ripples.current.push({
            x,
            y,
            radius: 1,
            opacity: 1,
            speed: 0.5 + Math.random() * 0.5,
            lineWidth: 1 + Math.random() * 1.5
        });
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (Math.random() > 0.9) { // Throttle ripple creation
            createRipple(x, y);
        }
    }, [createRipple]);
    
    const handleClick = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        for(let i = 0; i < 5; i++) {
           setTimeout(() => createRipple(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 60), i * 80);
        }
    }, [createRipple]);

    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        
        ctx.fillStyle = 'rgba(17, 24, 39, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ripples.current = ripples.current.filter(ripple => {
            ripple.radius += ripple.speed;
            ripple.opacity -= 0.01;
            
            if (ripple.opacity <= 0) return false;

            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(203, 213, 225, ${ripple.opacity})`;
            ctx.lineWidth = ripple.lineWidth;
            ctx.stroke();
            
            return true;
        });
        
        animationFrameId.current = requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const parent = canvas.parentElement;
        if (parent) {
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
        }

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('click', handleClick);

        animationFrameId.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('click', handleClick);
        };
    }, [animate, handleMouseMove, handleClick]);

    return (
        <div className="flex flex-col items-center p-4 bg-gray-900 min-h-[calc(100vh-100px)] rounded-xl relative overflow-hidden">
            <div className="w-full flex justify-between items-center mb-4 z-10">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors border border-white/20 text-white"
                >
                    <ArrowLeftIcon />
                    <span>나가기</span>
                </button>
                <h1 className="text-2xl font-bold tracking-wider text-slate-300">고요한 정원</h1>
                <div className="w-24"></div>
            </div>
            <div className="absolute inset-0 w-full h-full">
                 <canvas ref={canvasRef} className="w-full h-full" />
            </div>
            <p className="absolute bottom-10 text-sm text-slate-500 z-10 animate-pulse">마우스를 움직이거나 클릭해보세요</p>
        </div>
    );
};

export default ZenGardenPage;
