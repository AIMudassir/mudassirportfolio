
import React, { useRef, useEffect, useState } from 'react';

export const CameraHUD: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
        setError(null);
      }
    } catch (err) {
      setError("Camera access denied or not available.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsActive(false);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl shadow-blue-900/20">
      {/* HUD Overlays */}
      {isActive && (
        <div className="absolute inset-0 z-10 pointer-events-none border-[20px] border-transparent">
          {/* Scanning lines */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500/30 animate-[scan_3s_linear_infinite]" />
          
          {/* Corner accents */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-blue-500 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-blue-500 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-blue-500 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-blue-500 rounded-br-lg" />

          {/* Dynamic Data Labels */}
          <div className="absolute top-8 left-20 bg-black/60 backdrop-blur px-3 py-1 rounded border border-blue-500/50 text-[10px] font-mono text-blue-400">
            SYSTEM_STATE: ANALYSIS_ACTIVE
          </div>
          <div className="absolute bottom-10 right-20 bg-black/60 backdrop-blur px-3 py-1 rounded border border-blue-500/50 text-[10px] font-mono text-blue-400">
            BIOMETRIC_ID: SMM_USR_01
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-48 h-48 border border-blue-500/20 rounded-full animate-ping opacity-20" />
          </div>
        </div>
      )}

      {/* Camera Video Feed */}
      <div className="aspect-video bg-zinc-900 relative flex items-center justify-center">
        {!isActive && (
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
              <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-medium">Activate Biometric Vision</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2">Initialize the Neural Network interface to enable real-time biometric tracking simulation.</p>
          </div>
        )}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className={`w-full h-full object-cover grayscale opacity-80 ${!isActive ? 'hidden' : 'block'}`}
        />
        {error && <p className="absolute bottom-4 text-red-500 text-xs">{error}</p>}
      </div>

      {/* Controls */}
      <div className="p-4 bg-zinc-900/50 backdrop-blur-xl border-t border-white/5 flex justify-between items-center">
        <div className="flex gap-2 items-center">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">Neural Stream</span>
        </div>
        {!isActive ? (
          <button 
            onClick={startCamera}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all transform hover:scale-105"
          >
            INIT_INTERFACE
          </button>
        ) : (
          <button 
            onClick={stopCamera}
            className="px-6 py-2 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 rounded-full text-xs font-bold transition-all"
          >
            TERMINATE_SESSION
          </button>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
