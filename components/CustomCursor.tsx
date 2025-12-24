
import React, { useEffect, useRef, useState, memo } from 'react';

export const CustomCursor: React.FC = memo(() => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
      if (cursorRef.current) {
        // Dot follows cursor exactly for responsiveness
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const handleHoverStart = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = target.closest('button, a, .cursor-pointer');
      setIsHovering(!!isClickable);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', handleHoverStart);

    let animationFrameId: number;
    const render = () => {
      // Adjusted lerp factor for weighted trailing effect
      const lerpFactor = 0.08;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * lerpFactor;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * lerpFactor;
      
      if (ringRef.current) {
        // Hardware accelerated ring tracking
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', handleHoverStart);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        body { cursor: none; }
        a, button, .cursor-pointer { cursor: none !important; }
        @media (max-width: 1024px) {
          body { cursor: auto; }
          .custom-cursor-container { display: none; }
        }
      `}</style>
      <div className="custom-cursor-container fixed inset-0 pointer-events-none z-[999] overflow-hidden">
        {/* Ring with thicker border and softer glow for prominent trail */}
        <div 
          ref={ringRef} 
          className={`fixed top-0 left-0 w-10 h-10 border-[4px] border-cyan-500/30 shadow-[0_0_45px_rgba(6,182,212,0.2)] rounded-full transition-all duration-300 ease-out flex items-center justify-center ${isHovering ? 'scale-[2.4] bg-cyan-500/10 border-cyan-400' : 'scale-100'}`} 
          style={{ mixBlendMode: 'screen' }}
        >
          {isHovering && <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />}
        </div>
        
        {/* Core Dot */}
        <div 
          ref={cursorRef} 
          className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_white]" 
          style={{ mixBlendMode: 'difference' }} 
        />
      </div>
    </>
  );
});
