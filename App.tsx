
import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { NeuralNetworkBackground, NetworkTheme } from './components/NeuralNetworkBackground';
import { CustomCursor } from './components/CustomCursor';
import { PROJECTS, SKILLS } from './constants';

const THEMES_LIST: NetworkTheme[] = ['CYBER', 'NOVA', 'VOID', 'NEBULA'];

const ProjectCard = memo(({ project, idx, isSelected, onClick, onExpand }: any) => (
  <div 
    onClick={() => onClick(idx)}
    className={`group relative p-8 md:p-10 rounded-[1.5rem] md:rounded-[2rem] bg-zinc-900/60 backdrop-blur-md border border-white/5 hover-card-effect cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
      isSelected ? 'animate-project-glow scale-[1.02] border-cyan-500/50' : 'hover:border-cyan-500/30'
    }`}
  >
    <div className="absolute top-4 right-6 text-[8px] md:text-[10px] font-mono text-zinc-600 tracking-widest">{project.date}</div>
    <div className="flex items-center gap-3 mb-4 md:mb-6">
      {isSelected && <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping" />}
      <h3 className={`text-2xl md:text-3xl font-heading font-bold transition-colors ${isSelected ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`}>
        {project.title}
      </h3>
    </div>
    <p className="text-zinc-400 text-xs md:text-sm leading-relaxed mb-8 opacity-90">{project.description}</p>
    <div className="flex flex-wrap gap-2 mb-8">
      {project.tags.map((tag: string, tIdx: number) => (
        <span key={tIdx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-bold uppercase tracking-widest text-cyan-400/80">
          {tag}
        </span>
      ))}
    </div>
    <button 
      onClick={(e) => { e.stopPropagation(); onExpand(idx); }}
      className="text-[9px] font-mono font-bold tracking-widest text-cyan-500 uppercase flex items-center gap-2 group/btn"
    >
      <span className="w-4 h-[1px] bg-cyan-500 group-hover/btn:w-8 transition-all" /> READ_FULL_REPORT
    </button>
  </div>
));

const App: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [activeTheme, setActiveTheme] = useState<NetworkTheme>('CYBER');
  const [density, setDensity] = useState(1.0);
  const [skillsInView, setSkillsInView] = useState(false);
  
  const skillsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setSkillsInView(true);
    }, { threshold: 0.1 });
    if (skillsRef.current) observer.observe(skillsRef.current);
    return () => observer.disconnect();
  }, []);

  const cycleTheme = useCallback(() => {
    setActiveTheme(prev => {
      const idx = THEMES_LIST.indexOf(prev);
      return THEMES_LIST[(idx + 1) % THEMES_LIST.length];
    });
  }, []);

  const handleOpenModal = useCallback((idx: number) => {
    setExpandedProjectId(idx);
    setIsClosing(false);
    document.body.style.overflow = 'hidden';
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setExpandedProjectId(null);
      setIsClosing(false);
      document.body.style.overflow = 'unset';
    }, 500); 
  }, []);

  return (
    <div className={`min-h-screen text-white selection:bg-cyan-500/30 font-sans transition-colors duration-1000 theme-${activeTheme.toLowerCase()}`}>
      <CustomCursor />
      
      <style>{`
        :root {
          --theme-accent: #06b6d4;
          --theme-accent-glow: rgba(6, 182, 212, 0.4);
          --apple-ease: cubic-bezier(0.16, 1, 0.3, 1);
        }
        .theme-cyber { --theme-accent: #00f2ff; --theme-accent-glow: rgba(0, 242, 255, 0.4); }
        .theme-nova { --theme-accent: #ff4d4d; --theme-accent-glow: rgba(255, 77, 77, 0.4); }
        .theme-void { --theme-accent: #ffffff; --theme-accent-glow: rgba(255, 255, 255, 0.2); }
        .theme-nebula { --theme-accent: #aa00ff; --theme-accent-glow: rgba(170, 0, 255, 0.4); }

        @keyframes pulse-blue-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(6, 182, 212, 0.1); }
          50% { box-shadow: 0 0 35px var(--theme-accent-glow); }
        }
        .animate-project-glow { animation: pulse-blue-glow 2.5s infinite ease-in-out; }
        .modal-overlay { background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(20px); will-change: opacity; }
        .theme-btn-clip { clip-path: polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%); }
        .reveal-node { 
          opacity: 0; 
          transform: translateY(24px); 
          transition: transform 1.2s var(--apple-ease), opacity 1.2s var(--apple-ease); 
          will-change: transform, opacity; 
        }
        .reveal-node.active { opacity: 1; transform: translateY(0); }
        .hover-card-effect { transition: all 0.7s var(--apple-ease); will-change: transform; }
        .hover-card-effect:hover { transform: translateY(-10px); }
        
        input[type=range].density-slider { -webkit-appearance: none; background: transparent; }
        input[type=range].density-slider::-webkit-slider-runnable-track { height: 2px; background: rgba(255, 255, 255, 0.1); }
        input[type=range].density-slider::-webkit-slider-thumb { -webkit-appearance: none; height: 12px; width: 12px; border-radius: 50%; background: var(--theme-accent); margin-top: -5px; box-shadow: 0 0 10px var(--theme-accent); cursor: pointer; }
      `}</style>

      <NeuralNetworkBackground activeTheme={activeTheme} densityFactor={density} />
      <Navbar />

      <div className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-[100] flex flex-col items-start gap-4">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl flex flex-col gap-3 min-w-[200px] will-change-transform shadow-2xl">
          <div className="flex justify-between items-center text-[8px] font-mono tracking-widest text-zinc-500 uppercase">
            <span>Core: <span className="text-cyan-400" style={{ color: 'var(--theme-accent)' }}>{activeTheme}</span></span>
            <span className="opacity-40">STABLE</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[7px] font-mono text-zinc-500 uppercase">
              <span>Synapse_Density</span>
              <span className="text-cyan-400" style={{ color: 'var(--theme-accent)' }}>{density.toFixed(1)}x</span>
            </div>
            <input type="range" min="0.2" max="2.5" step="0.1" value={density} onChange={(e) => setDensity(parseFloat(e.target.value))} className="density-slider w-full" />
          </div>
        </div>

        <button onClick={cycleTheme} className="group relative px-8 py-3 bg-zinc-900/90 border border-white/10 hover:border-cyan-500/50 transition-all duration-500 theme-btn-clip overflow-hidden">
          <div className="absolute inset-0 bg-cyan-500/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ background: 'var(--theme-accent-glow)' }} />
          <span className="relative z-10 font-heading text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2">
            REWIRE_NET
            <svg className="w-3 h-3 group-hover:rotate-180 transition-transform duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </span>
        </button>
      </div>

      <main className="relative z-10" style={{ perspective: '1000px' }}>
        <Hero />

        <section id="projects" className="py-20 md:py-32 px-6 scroll-mt-24">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 md:mb-20">
              <h2 className="text-4xl md:text-7xl font-heading font-black tracking-tighter mb-4">SYSTEM_LOGS</h2>
              <div className="h-1 w-16 md:w-24 bg-cyan-500" style={{ background: 'var(--theme-accent)' }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {PROJECTS.map((project, idx) => (
                <ProjectCard key={idx} project={project} idx={idx} isSelected={selectedProjectId === idx} onClick={setSelectedProjectId} onExpand={handleOpenModal} />
              ))}
            </div>
          </div>
        </section>

        <section ref={skillsRef} id="skills" className="py-20 md:py-32 px-6 scroll-mt-24">
          <div className="max-w-6xl mx-auto">
            <div className={`mb-16 md:mb-24 reveal-node ${skillsInView ? 'active' : ''}`}>
              <h2 className="text-4xl md:text-7xl font-heading font-black tracking-tighter mb-4">CORE_MATRIX</h2>
              <p className="text-cyan-500/70 font-mono text-[10px] uppercase tracking-[0.4em]">Integrated Intelligence Architectures</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {SKILLS.map((cat, idx) => (
                <div key={idx} className={`bg-zinc-900/40 backdrop-blur-md p-8 md:p-10 rounded-[2.5rem] border border-white/5 transition-all duration-700 hover:border-cyan-500/30 reveal-node ${skillsInView ? 'active' : ''}`} style={{ transitionDelay: `${idx * 150}ms` }}>
                  <h4 className="text-white font-heading font-bold text-xl uppercase tracking-widest mb-10 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500 text-[10px]" style={{ background: 'var(--theme-accent-glow)', color: 'var(--theme-accent)' }}>{idx + 1}</span>
                    {cat.category}
                  </h4>
                  <div className="space-y-8">
                    {cat.skills.map((skill, sIdx) => (
                      <div key={sIdx} className="group/skill">
                        <span className="block text-lg font-heading font-bold text-zinc-100 group-hover/skill:text-cyan-400 transition-colors duration-300">{skill.name}</span>
                        <span className="block text-[10px] font-mono text-zinc-400 tracking-tight leading-relaxed opacity-70">{skill.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer id="contact" className="py-20 md:py-32 px-6 text-center border-t border-white/5 relative group/footer">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 blur-[120px] pointer-events-none" />
          <div className="max-w-4xl mx-auto relative z-10">
            <h2 className="text-5xl md:text-8xl font-heading font-black mb-12 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-700 group-hover/footer:to-cyan-400 transition-all duration-1000">LET'S INTERFACE</h2>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-12 mb-20">
              <a href="mailto:mudassirfrance@gmail.com" className="text-lg md:text-2xl font-heading font-bold text-zinc-400 hover:text-white transition-colors duration-300">mudassirfrance@gmail.com</a>
              <a 
                href="https://www.linkedin.com/in/syed-muhammad-mudassir-b81314211/?skipRedirect=true" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-lg md:text-2xl font-heading font-bold text-zinc-400 hover:text-white transition-colors duration-300"
              >
                LinkedIn_Signal
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
