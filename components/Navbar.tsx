
import React, { useState } from 'react';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Projects', href: '#projects' },
    { name: 'Core_Matrix', href: '#skills' },
    { name: 'Interface', href: '#contact' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    
    if (element) {
      const offset = 80; // Approximate height of the fixed navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 md:px-12 py-5 md:py-6 flex justify-between items-center backdrop-blur-xl border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-2 h-2 bg-cyan-500 shadow-[0_0_10px_#00f2ff]" />
          <span className="font-heading font-black text-lg md:text-xl tracking-tighter">SMM.TECH</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-12 text-[10px] font-mono font-bold tracking-[0.3em] uppercase text-zinc-500">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              onClick={(e) => handleLinkClick(e, link.href)}
              className="hover:text-cyan-400 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={toggleMenu}
          className="md:hidden flex flex-col gap-1.5 p-2 focus:outline-none z-[110]"
          aria-label="Toggle Menu"
        >
          <div className={`w-6 h-[1px] bg-white transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <div className={`w-6 h-[1px] bg-white transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
          <div className={`w-6 h-[1px] bg-white transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[90] bg-black/95 backdrop-blur-2xl transition-transform duration-500 md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col items-center justify-center h-full gap-12 text-center">
          <div className="text-[10px] font-mono text-cyan-500 tracking-[0.5em] uppercase mb-4 opacity-50">Navigation_Access</div>
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              onClick={(e) => handleLinkClick(e, link.href)}
              className="text-4xl font-heading font-black tracking-tighter hover:text-cyan-400 transition-colors"
            >
              {link.name.replace('_', ' ')}
            </a>
          ))}
          <div className="mt-12 text-[8px] font-mono text-zinc-600 tracking-[0.2em] uppercase">
            EST. 2025 // PARIS_FRANCE
          </div>
        </div>
      </div>
    </>
  );
};
