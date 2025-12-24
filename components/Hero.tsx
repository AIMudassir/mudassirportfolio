
import React, { memo } from 'react';

export const Hero: React.FC = memo(() => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-20">
      <style>{`
        @keyframes scan-move {
          0% { transform: translate(-50%, -100%); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translate(-50%, 200%); opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-move 4s linear infinite;
          will-change: transform;
        }
        .reveal-text {
          animation: reveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(20px);
          will-change: transform, opacity;
        }
        @keyframes reveal {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="max-w-6xl relative w-full">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1px] h-64 bg-gradient-to-b from-transparent via-cyan-500 to-transparent animate-scan-line" style={{ backgroundColor: 'var(--theme-accent)' }} />
        
        <h2 className="text-cyan-500 font-mono text-[8px] md:text-[10px] tracking-[0.4em] md:tracking-[0.6em] uppercase mb-6 md:mb-8 opacity-60 reveal-text" style={{ animationDelay: '0.1s', color: 'var(--theme-accent)' }}>
          Neural Interface Engineering
        </h2>
        
        <h1 className="text-5xl md:text-9xl font-heading font-black tracking-tighter leading-[0.9] md:leading-[0.8] mb-8 md:mb-10 reveal-text" style={{ animationDelay: '0.2s' }}>
          SYED<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">MUDASSIR</span>
        </h1>
        
        <p className="text-base md:text-2xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed mb-12 md:text-xl md:mb-16 tracking-tight reveal-text px-4" style={{ animationDelay: '0.3s' }}>
          Pioneering <span className="text-white font-medium">Synthetic Face Analysis</span> and AI Biometrics at Université Paris-Est Créteil.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 items-center justify-center reveal-text" style={{ animationDelay: '0.4s' }}>
            <a 
              href="mailto:mudassirfrance@gmail.com" 
              className="w-full sm:w-auto px-10 py-4 md:py-5 bg-white text-black font-heading font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] rounded-full hover:bg-cyan-500 hover:text-white transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Email Signal
            </a>
            <a 
              href="https://www.linkedin.com/in/syed-muhammad-mudassir-b81314211/?skipRedirect=true" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-10 py-4 md:py-5 bg-transparent border border-white/20 text-white font-heading font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] rounded-full hover:bg-white/10 transition-all"
            >
              LinkedIn Auth
            </a>
        </div>
      </div>
    </section>
  );
});
