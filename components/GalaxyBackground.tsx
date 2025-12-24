
import React, { useRef, useEffect } from 'react';

export type GalaxyTheme = 'CYBER' | 'NOVA' | 'VOID' | 'NEBULA';

interface ThemeConfig {
  starColors: string[];
  planetPalettes: { main: string; glow: string }[];
  nebulaColors: string[];
  cometColor: string;
  densityFactor: number;
  speedFactor: number;
}

const THEMES: Record<GalaxyTheme, ThemeConfig> = {
  CYBER: {
    starColors: ['#00f2ff', '#ffffff', '#7000ff', '#4d4dff'],
    planetPalettes: [
      { main: '#1a1a2e', glow: '#00f2ff' },
      { main: '#16213e', glow: '#7000ff' },
      { main: '#0f3460', glow: '#0066ff' }
    ],
    nebulaColors: ['rgba(0, 102, 255, 0.08)', 'rgba(112, 0, 255, 0.08)', 'rgba(0, 242, 255, 0.05)'],
    cometColor: '0, 242, 255',
    densityFactor: 1.0,
    speedFactor: 1.0,
  },
  NOVA: {
    starColors: ['#ff4d4d', '#ffaa00', '#ffffff', '#ff0055'],
    planetPalettes: [
      { main: '#2e1a1a', glow: '#ff4d4d' },
      { main: '#3e2116', glow: '#ffaa00' },
      { main: '#600f0f', glow: '#ff0055' }
    ],
    nebulaColors: ['rgba(255, 50, 50, 0.08)', 'rgba(255, 150, 0, 0.06)', 'rgba(255, 0, 80, 0.05)'],
    cometColor: '255, 80, 0',
    densityFactor: 1.1,
    speedFactor: 1.3,
  },
  VOID: {
    starColors: ['#444444', '#888888', '#222222', '#ffffff'],
    planetPalettes: [
      { main: '#0a0a0a', glow: '#444444' },
      { main: '#111111', glow: '#666666' },
      { main: '#050505', glow: '#222222' }
    ],
    nebulaColors: ['rgba(100, 100, 100, 0.04)', 'rgba(50, 50, 50, 0.03)', 'rgba(150, 150, 150, 0.02)'],
    cometColor: '200, 200, 200',
    densityFactor: 0.7,
    speedFactor: 0.6,
  },
  NEBULA: {
    starColors: ['#ff00ff', '#00ffaa', '#ffffff', '#aa00ff'],
    planetPalettes: [
      { main: '#2e1a2e', glow: '#ff00ff' },
      { main: '#163e3e', glow: '#00ffaa' },
      { main: '#340f60', glow: '#aa00ff' }
    ],
    nebulaColors: ['rgba(255, 0, 255, 0.08)', 'rgba(0, 255, 170, 0.07)', 'rgba(170, 0, 255, 0.06)'],
    cometColor: '255, 0, 170',
    densityFactor: 1.3,
    speedFactor: 0.9,
  }
};

interface Props {
  targetX: number;
  targetY: number;
  activeTheme?: GalaxyTheme;
  densityFactor?: number;
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
};

const parseRGBA = (rgba: string) => {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (!match) return [0, 0, 0, 0];
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), parseFloat(match[4])];
};

const easeInOutExpo = (t: number) => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;

export const GalaxyBackground: React.FC<Props> = ({ 
  targetX, 
  targetY, 
  activeTheme = 'CYBER',
  densityFactor = 1.0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const virtualPointerX = useRef(targetX);
  const virtualPointerY = useRef(targetY);
  const scrollY = useRef(window.scrollY);
  const velocityX = useRef(0);
  const velocityY = useRef(0);
  const smoothedSpeedMult = useRef(1);
  const lastTarget = useRef({ x: targetX, y: targetY });
  const currentDensity = useRef(densityFactor);
  
  const themeRef = useRef<ThemeConfig>(THEMES[activeTheme]);
  const prevThemeRef = useRef<ThemeConfig>(THEMES[activeTheme]);
  const transitionStartTime = useRef(0);
  const transitionDuration = 5000; 

  useEffect(() => {
    prevThemeRef.current = themeRef.current;
    themeRef.current = THEMES[activeTheme];
    transitionStartTime.current = performance.now();
  }, [activeTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    let planets: Planet[] = [];
    let nebulae: Nebula[] = [];

    const isMobile = window.innerWidth < 768;
    const maxDensityMultiplier = 3.5;
    const baseStarCount = isMobile ? 120 : 350;
    const basePlanetCount = isMobile ? 1 : 4;

    const handleScroll = () => {
      scrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    class Star {
      x: number;
      y: number;
      vx: number = 0;
      vy: number = 0;
      size: number;
      displaySize: number;
      baseX: number;
      baseY: number;
      friction: number;
      density: number;
      colorRgb: { r: number, g: number, b: number } = { r: 255, g: 255, b: 255 };
      colorIndex: number;
      parallaxFactor: number;
      noiseOffset: number;
      currentDistance: number = 0;
      poolIndex: number;
      twinkleOffset: number;
      twinkleSpeed: number;

      constructor(index: number) {
        this.poolIndex = index;
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = 0.5 + Math.random() * 1.8;
        this.displaySize = this.size;
        this.density = (Math.random() * 8) + 8;
        this.friction = 0.93 + Math.random() * 0.04; 
        this.parallaxFactor = this.size * 0.06;
        this.colorIndex = Math.floor(Math.random() * 4);
        this.noiseOffset = Math.random() * 1000;
        this.twinkleOffset = Math.random() * Math.PI * 2;
        this.twinkleSpeed = 0.001 + Math.random() * 0.003;
      }

      updateInterpolatedColor(t: number) {
        const c1 = hexToRgb(prevThemeRef.current.starColors[this.colorIndex % prevThemeRef.current.starColors.length]);
        const c2 = hexToRgb(themeRef.current.starColors[this.colorIndex % themeRef.current.starColors.length]);
        this.colorRgb = {
          r: Math.round(c1.r + (c2.r - c1.r) * t),
          g: Math.round(c1.g + (c2.g - c1.g) * t),
          b: Math.round(c1.b + (c2.b - c1.b) * t)
        };
      }

      draw(globalVX: number, globalVY: number, t: number, currentSmoothDensity: number) {
        if (!ctx) return;
        
        const threshold = this.poolIndex / baseStarCount;
        let densityAlpha = 0;
        if (threshold <= currentSmoothDensity) {
          densityAlpha = Math.min(1, (currentSmoothDensity - threshold) * 8);
        }
        if (densityAlpha <= 0) return;

        // Enhanced 3D Parallax with easing
        const scrollParallax = scrollY.current * this.parallaxFactor;
        const centerXOffset = (virtualPointerX.current - canvas!.width / 2) * (this.parallaxFactor * 0.3);
        const centerYOffset = (virtualPointerY.current - canvas!.height / 2) * (this.parallaxFactor * 0.2);
        
        const drawX = this.x - centerXOffset;
        const drawY = this.y - scrollParallax - centerYOffset;
        
        const wrappedX = ((drawX % canvas!.width) + canvas!.width) % canvas!.width;
        const wrappedY = ((drawY % canvas!.height) + canvas!.height) % canvas!.height;

        this.updateInterpolatedColor(t);
        const { r, g, b } = this.colorRgb;

        // Twinkle Logic
        const twinkle = 0.7 + Math.sin(performance.now() * this.twinkleSpeed + this.twinkleOffset) * 0.3;
        
        const localSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        // Motion Blur Streaks: Longer tails at high speed
        const stretchFactor = 3.2;
        const stretch = localSpeed * stretchFactor + Math.sqrt(globalVX * globalVX + globalVY * globalVY) * 0.4;
        const angle = Math.atan2(this.vy + globalVY * 0.12, this.vx + globalVX * 0.12);

        const influenceRadius = 700;
        const proximity = Math.max(0, 1 - (this.currentDistance / influenceRadius));
        const dynamicAlpha = (0.3 + (proximity * 0.5) + Math.min(localSpeed * 0.2, 0.2)) * densityAlpha * twinkle;

        ctx.save();
        ctx.translate(wrappedX, wrappedY);
        ctx.rotate(angle);
        
        // streak rendering
        const gradient = ctx.createLinearGradient(-stretch, 0, this.displaySize, 0);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${dynamicAlpha * 0.1})`);
        gradient.addColorStop(0.8, `rgba(${r}, ${g}, ${b}, ${dynamicAlpha * 0.8})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${densityAlpha})`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        // Streaks are thinner at high speed to look more 'laser-like'
        const tailThickness = this.displaySize * (1 - Math.min(localSpeed * 0.12, 0.5));
        ctx.ellipse(0, 0, this.displaySize + stretch, tailThickness, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Add core for closer stars or high motion
        if (proximity > 0.75 || localSpeed > 3) {
          ctx.shadowBlur = 4 + (proximity * 12);
          ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
          ctx.fillStyle = `rgba(255, 255, 255, ${densityAlpha * twinkle})`;
          ctx.beginPath();
          ctx.arc(0, 0, this.displaySize * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      update(tx: number, ty: number, speedMult: number) {
        let dx = tx - this.x;
        let dy = ty - this.y;
        this.currentDistance = Math.sqrt(dx * dx + dy * dy);
        let maxRange = 650;
        
        if (this.currentDistance < maxRange) {
          // Gravitational Lens effect logic: particles are pulled towards cursor
          // but also swirl around it (Vortex physics)
          let force = Math.pow((maxRange - this.currentDistance) / maxRange, 2.5);
          this.vx += (dx / this.currentDistance) * force * this.density * 0.05 * speedMult;
          this.vy += (dy / this.currentDistance) * force * this.density * 0.05 * speedMult;
          
          const swirlFactor = force * 0.07 * speedMult;
          this.vx += (ty - this.y) * swirlFactor;
          this.vy -= (tx - this.x) * swirlFactor;
        }

        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // Return to base position with subtle organic oscillation
        this.x += (this.baseX - this.x) * 0.004 + this.vx;
        this.y += (this.baseY - this.y) * 0.004 + this.vy;
        
        this.displaySize = this.size * (0.9 + Math.sin(performance.now() * 0.0015 + this.noiseOffset) * 0.1);
      }
    }

    class Nebula {
      x: number;
      y: number;
      radius: number;
      colorIndex: number;
      vx: number;
      vy: number;
      parallaxFactor: number;
      poolIndex: number;
      rotation: number;
      rotationSpeed: number;

      constructor(index: number) {
        this.poolIndex = index;
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.radius = 900 + Math.random() * 700;
        this.parallaxFactor = 0.006;
        this.colorIndex = index % 3;
        const speed = themeRef.current.speedFactor * 0.03;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.0005;
      }

      draw(t: number, currentSmoothDensity: number) {
        if (!ctx) return;
        
        const threshold = this.poolIndex / 3;
        let densityAlpha = 0;
        if (threshold <= currentSmoothDensity) {
          densityAlpha = Math.min(1, (currentSmoothDensity - threshold) * 5);
        }
        if (densityAlpha <= 0) return;

        const drawY = this.y - (scrollY.current * this.parallaxFactor);
        const wrappedY = ((drawY % canvas!.height) + canvas!.height) % canvas!.height;

        const cCurrent = parseRGBA(themeRef.current.nebulaColors[this.colorIndex]);
        const cPrev = parseRGBA(prevThemeRef.current.nebulaColors[this.colorIndex]);
        
        const r = Math.round(cPrev[0] + (cCurrent[0] - cPrev[0]) * t);
        const g = Math.round(cPrev[1] + (cCurrent[1] - cPrev[1]) * t);
        const b = Math.round(cPrev[2] + (cCurrent[2] - cPrev[2]) * t);
        const a = (cPrev[3] + (cCurrent[3] - cPrev[3]) * t) * densityAlpha;

        // Multi-layered radial gradient for volumetric look
        const gradient = ctx.createRadialGradient(this.x, wrappedY, 0, this.x, wrappedY, this.radius);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a * 1.2})`);
        gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${a * 0.5})`);
        gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${a * 0.1})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.save();
        ctx.translate(this.x, wrappedY);
        ctx.rotate(this.rotation);
        ctx.translate(-this.x, -wrappedY);
        
        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = 'screen';
        ctx.fillRect(0, 0, canvas!.width, canvas!.height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        if (this.x < -this.radius) this.x = canvas!.width + this.radius;
        if (this.x > canvas!.width + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = canvas!.height + this.radius;
        if (this.y > canvas!.height + this.radius) this.y = -this.radius;
      }
    }

    class Planet {
        x: number;
        y: number;
        radius: number;
        displayRadius: number;
        paletteIndex: number;
        baseX: number;
        baseY: number;
        parallaxFactor: number;
        poolIndex: number;
        atmosphereGlow: number;

        constructor(index: number) {
            this.poolIndex = index;
            this.radius = 40 + Math.random() * 60;
            this.displayRadius = this.radius;
            this.x = Math.random() * canvas!.width;
            this.y = Math.random() * canvas!.height;
            this.baseX = this.x;
            this.baseY = this.y;
            this.parallaxFactor = (this.radius / 100) * 0.15;
            this.paletteIndex = index % 3;
            this.atmosphereGlow = 0.5 + Math.random() * 0.5;
        }

        draw(t: number, currentSmoothDensity: number) {
            if (!ctx) return;
            
            const threshold = this.poolIndex / basePlanetCount;
            let densityAlpha = 0;
            if (threshold <= currentSmoothDensity) {
              densityAlpha = Math.min(1, (currentSmoothDensity - threshold) * 5);
            }
            if (densityAlpha <= 0) return;

            const drawY = this.y - (scrollY.current * this.parallaxFactor);
            const wrappedY = ((drawY % canvas!.height) + canvas!.height) % canvas!.height;

            const pPrev = prevThemeRef.current.planetPalettes[this.paletteIndex % prevThemeRef.current.planetPalettes.length];
            const pCurr = themeRef.current.planetPalettes[this.paletteIndex % themeRef.current.planetPalettes.length];
            
            const rgbPrev = hexToRgb(pPrev.glow);
            const rgbCurr = hexToRgb(pCurr.glow);
            const r = Math.round(rgbPrev.r + (rgbCurr.r - rgbPrev.r) * t);
            const g = Math.round(rgbPrev.g + (rgbCurr.g - rgbPrev.g) * t);
            const b = Math.round(rgbPrev.b + (rgbCurr.b - rgbPrev.b) * t);
            const glowColor = `rgba(${r}, ${g}, ${b}, ${densityAlpha})`;

            const mainPrev = hexToRgb(pPrev.main);
            const mainCurr = hexToRgb(pCurr.main);
            const mr = Math.round(mainPrev.r + (mainCurr.r - mainPrev.r) * t);
            const mg = Math.round(mainPrev.g + (mainCurr.g - mainPrev.g) * t);
            const mb = Math.round(mainPrev.b + (mainCurr.b - mainPrev.b) * t);
            const mainColor = `rgba(${mr}, ${mg}, ${mb}, ${densityAlpha})`;

            ctx.save();
            // Atmospheric Glow Layer
            const glowRadius = this.displayRadius * (3.5 + Math.sin(performance.now() * 0.001) * 0.5);
            const gradient = ctx.createRadialGradient(this.x, wrappedY, 0, this.x, wrappedY, glowRadius);
            gradient.addColorStop(0, glowColor.replace('rgba', 'rgba').replace(', 1)', `, ${0.12 * densityAlpha})`));
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, wrappedY, glowRadius, 0, Math.PI * 2);
            ctx.fill();

            // Core Planet
            ctx.shadowBlur = 20;
            ctx.shadowColor = glowColor;
            ctx.fillStyle = mainColor;
            ctx.beginPath();
            ctx.arc(this.x, wrappedY, this.displayRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Atmospheric Ring / Reflection
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.3 * densityAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, wrappedY, this.displayRadius * 1.05, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        }

        update(tx: number, ty: number, speedMult: number) {
            let dx = tx - this.x;
            let dy = ty - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let maxDist = 1000;

            if (distance < maxDist) {
                let force = Math.pow((maxDist - distance) / maxDist, 2.5);
                this.x += (dx / distance) * force * 2.2 * speedMult;
                this.y += (dy / distance) * force * 2.2 * speedMult;
            } else {
                this.x += (this.baseX - this.x) * 0.003;
                this.y += (this.baseY - this.y) * 0.003;
            }

            const hoverRange = 450;
            const targetZoom = distance < hoverRange ? this.radius * 1.25 : this.radius;
            this.displayRadius += (targetZoom - this.displayRadius) * 0.02;
        }
    }

    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      stars = Array.from({ length: Math.floor(baseStarCount * maxDensityMultiplier) }, (_, i) => new Star(i));
      planets = Array.from({ length: Math.floor(basePlanetCount * maxDensityMultiplier) }, (_, i) => new Planet(i));
      nebulae = Array.from({ length: Math.floor(3 * maxDensityMultiplier) }, (_, i) => new Nebula(i));
    };

    const animate = () => {
      // Cinematic motion trail with lower alpha for persistent streaks
      ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const now = performance.now();
      const rawT = Math.min((now - transitionStartTime.current) / transitionDuration, 1);
      const easedT = easeInOutExpo(rawT);
      
      currentDensity.current += (densityFactor - currentDensity.current) * 0.03;
      
      const dx = targetX - lastTarget.current.x;
      const dy = targetY - lastTarget.current.y;
      
      // momentum logic
      velocityX.current = velocityX.current * 0.9 + dx * 0.1;
      velocityY.current = velocityY.current * 0.9 + dy * 0.1;
      
      const interactionSpeed = Math.sqrt(velocityX.current * velocityX.current + velocityY.current * velocityY.current);
      const targetSpeedMult = (1 + Math.min(interactionSpeed / 10, 3.0)) * themeRef.current.speedFactor;
      
      smoothedSpeedMult.current += (targetSpeedMult - smoothedSpeedMult.current) * 0.08;
      
      lastTarget.current = { x: targetX, y: targetY };
      
      const damping = 0.05;
      virtualPointerX.current += (targetX - virtualPointerX.current) * damping;
      virtualPointerY.current += (targetY - virtualPointerY.current) * damping;

      nebulae.forEach(n => { n.update(); n.draw(easedT, currentDensity.current); });
      stars.forEach(s => { 
        s.update(virtualPointerX.current, virtualPointerY.current, smoothedSpeedMult.current); 
        s.draw(velocityX.current, velocityY.current, easedT, currentDensity.current); 
      });
      planets.forEach(p => { 
        p.update(virtualPointerX.current, virtualPointerY.current, smoothedSpeedMult.current); 
        p.draw(easedT, currentDensity.current); 
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', init);
    init();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', init);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [targetX, targetY, activeTheme, densityFactor]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 bg-black pointer-events-none transition-opacity duration-1000"
    />
  );
};
