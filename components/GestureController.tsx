
import React, { useRef, useEffect, useState } from 'react';

interface Props {
  onMotion: (x: number, y: number) => void;
}

export const GestureController: React.FC<Props> = ({ onMotion }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const lastFrame = useRef<ImageData | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
      }
    } catch (err) {
      console.error("Camera failed", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
      setIsActive(false);
    }
  };

  useEffect(() => {
    if (!isActive) return;

    const detectMotion = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if (lastFrame.current) {
        let sumX = 0;
        let sumY = 0;
        let count = 0;

        for (let i = 0; i < currentFrame.data.length; i += 4) {
          const rDiff = Math.abs(currentFrame.data[i] - lastFrame.current.data[i]);
          if (rDiff > 50) { // Motion threshold
            const pixelIndex = i / 4;
            sumX += pixelIndex % canvas.width;
            sumY += Math.floor(pixelIndex / canvas.width);
            count++;
          }
        }

        if (count > 20) {
          const avgX = (sumX / count) / canvas.width * window.innerWidth;
          const avgY = (sumY / count) / canvas.height * window.innerHeight;
          onMotion(avgX, avgY);
        }
      }

      lastFrame.current = currentFrame;
      if (isActive) requestAnimationFrame(detectMotion);
    };

    detectMotion();
  }, [isActive, onMotion]);

  return (
    <div className="fixed bottom-8 right-8 z-[100] group">
      <div className={`relative transition-all duration-500 overflow-hidden rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl ${isActive ? 'w-48 h-36 opacity-100' : 'w-0 h-0 opacity-0'}`}>
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale brightness-125" />
        <canvas ref={canvasRef} width="64" height="48" className="hidden" />
        {/* HUD Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-cyan-400/50 animate-pulse" style={{top: '50%'}} />
          <div className="absolute top-2 left-2 text-[8px] font-mono text-cyan-400">BIOMETRIC_LINK: ACTIVE</div>
        </div>
      </div>
      
      <button
        onClick={isActive ? stopCamera : startCamera}
        className={`mt-4 px-6 py-3 rounded-full font-heading text-[10px] font-bold tracking-[0.2em] uppercase transition-all flex items-center gap-3 ${isActive ? 'bg-red-500/20 text-red-500 border border-red-500/40' : 'bg-cyan-500 text-black'}`}
      >
        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500' : 'bg-black animate-ping'}`} />
        {isActive ? 'Terminate Link' : 'Initialize Neural Link'}
      </button>
    </div>
  );
};
