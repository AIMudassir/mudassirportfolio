
import React, { useRef, useEffect, memo } from 'react';

export type NetworkTheme = 'CYBER' | 'NOVA' | 'VOID' | 'NEBULA';

interface ThemeConfig {
  nodeColor: string;
  edgeColor: string;
  pulseColor: string;
  glowColor: string;
  bgGradient: string[];
}

const THEMES: Record<NetworkTheme, ThemeConfig> = {
  CYBER: {
    nodeColor: '#00f2ff',
    edgeColor: 'rgba(0, 242, 255, 0.12)',
    pulseColor: '#ffffff',
    glowColor: 'rgba(0, 242, 255, 0.4)',
    bgGradient: ['#000000', '#000510']
  },
  NOVA: {
    nodeColor: '#ff4d4d',
    edgeColor: 'rgba(255, 77, 77, 0.12)',
    pulseColor: '#ffaa00',
    glowColor: 'rgba(255, 77, 77, 0.4)',
    bgGradient: ['#000000', '#100500']
  },
  VOID: {
    nodeColor: '#888888',
    edgeColor: 'rgba(255, 255, 255, 0.05)',
    pulseColor: '#ffffff',
    glowColor: 'rgba(255, 255, 255, 0.1)',
    bgGradient: ['#000000', '#050505']
  },
  NEBULA: {
    nodeColor: '#aa00ff',
    edgeColor: 'rgba(170, 0, 255, 0.12)',
    pulseColor: '#00ffaa',
    glowColor: 'rgba(0, 255, 170, 0.4)',
    bgGradient: ['#020005', '#000000']
  }
};

interface Props {
  activeTheme?: NetworkTheme;
  densityFactor?: number;
}

const parseColor = (color: string): [number, number, number, number] => {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return [r, g, b, 1];
  }
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), match[4] ? parseFloat(match[4]) : 1];
  return [0, 0, 0, 1];
};

const lerpColor = (c1: [number, number, number, number], c2: [number, number, number, number], t: number): [number, number, number, number] => [
  c1[0] + (c2[0] - c1[0]) * t,
  c1[1] + (c2[1] - c1[1]) * t,
  c1[2] + (c2[2] - c1[2]) * t,
  c1[3] + (c2[3] - c1[3]) * t,
];

const formatRGBA = (rgba: [number, number, number, number]) => 
  `rgba(${Math.round(rgba[0])}, ${Math.round(rgba[1])}, ${Math.round(rgba[2])}, ${rgba[3]})`;

export const NeuralNetworkBackground: React.FC<Props> = memo(({ 
  activeTheme = 'CYBER',
  densityFactor = 1.0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerX = useRef(window.innerWidth / 2);
  const pointerY = useRef(window.innerHeight / 2);
  const targetPointerX = useRef(window.innerWidth / 2);
  const targetPointerY = useRef(window.innerHeight / 2);
  
  const themeRef = useRef<ThemeConfig>(THEMES[activeTheme]);
  const prevThemeRef = useRef<ThemeConfig>(THEMES[activeTheme]);
  const transitionStartTime = useRef(performance.now());

  useEffect(() => {
    prevThemeRef.current = themeRef.current;
    themeRef.current = THEMES[activeTheme];
    transitionStartTime.current = performance.now();
  }, [activeTheme]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetPointerX.current = e.clientX;
      targetPointerY.current = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let nodes: Node[] = [];
    let signals: Signal[] = [];
    const isMobile = window.innerWidth < 768;
    const connectionDist = 190;
    const connectionDistSq = connectionDist * connectionDist;
    const mouseRadiusSq = 380 * 380;
    const interNodeRepelRadiusSq = 65 * 65;

    // Spatial Partitioning Grid setup
    const cellSize = connectionDist;
    let grid: Node[][] = [];
    let cols = 0;
    let rows = 0;

    class Node {
      x: number; y: number; baseX: number; baseY: number;
      vx: number = 0; vy: number = 0; radius: number;
      driftSpeed: number = 0.15 + Math.random() * 0.25;
      angle: number = Math.random() * Math.PI * 2;
      angleStep: number = (Math.random() - 0.5) * 0.015;
      proximityToMouseSq: number = 0;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.radius = 0.8 + Math.random() * 1.2;
      }

      update() {
        this.angle += this.angleStep;
        this.vx += Math.cos(this.angle) * 0.04 * this.driftSpeed;
        this.vy += Math.sin(this.angle) * 0.04 * this.driftSpeed;

        const dx = pointerX.current - this.x;
        const dy = pointerY.current - this.y;
        const distSq = dx * dx + dy * dy;
        this.proximityToMouseSq = distSq;

        if (distSq < mouseRadiusSq) {
          const dist = Math.sqrt(distSq);
          const force = Math.pow(1 - dist / 380, 2);
          this.vx += (dx / dist) * force * 0.4;
          this.vy += (dy / dist) * force * 0.4;
          this.vx += (dy / dist) * force * 0.15;
          this.vy -= (dx / dist) * force * 0.15;
        }

        this.vx += (this.baseX - this.x) * 0.002;
        this.vy += (this.baseY - this.y) * 0.002;
        this.vx *= 0.94;
        this.vy *= 0.94;
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < -100) this.x = canvas!.width + 100;
        else if (this.x > canvas!.width + 100) this.x = -100;
        if (this.y < -100) this.y = canvas!.height + 100;
        else if (this.y > canvas!.height + 100) this.y = -100;
      }
    }

    class Signal {
      startNode: Node; endNode: Node; progress: number = 0; speed: number;
      constructor(start: Node, end: Node) {
        this.startNode = start; this.endNode = end;
        this.speed = 0.005 + Math.random() * 0.01;
      }
      update() { this.progress += this.speed; return this.progress < 1; }
    }

    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      cols = Math.ceil(w / cellSize) + 1;
      rows = Math.ceil(h / cellSize) + 1;
      grid = Array.from({ length: cols * rows }, () => []);

      const nodeCount = Math.floor((isMobile ? 70 : 160) * densityFactor);
      nodes = Array.from({ length: nodeCount }, () => new Node());
    };

    let animationFrameId: number;
    const animate = () => {
      if (document.visibilityState === 'hidden') {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const now = performance.now();
      const t = Math.min((now - transitionStartTime.current) / 2000, 1);
      const prev = prevThemeRef.current;
      const curr = themeRef.current;

      const iNodeColor = formatRGBA(lerpColor(parseColor(prev.nodeColor), parseColor(curr.nodeColor), t));
      const iEdgeColor = formatRGBA(lerpColor(parseColor(prev.edgeColor), parseColor(curr.edgeColor), t));
      const iPulseColor = formatRGBA(lerpColor(parseColor(prev.pulseColor), parseColor(curr.pulseColor), t));
      const bg0 = formatRGBA(lerpColor(parseColor(prev.bgGradient[0]), parseColor(curr.bgGradient[0]), t));
      const bg1 = formatRGBA(lerpColor(parseColor(prev.bgGradient[1]), parseColor(curr.bgGradient[1]), t));

      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, bg0); grad.addColorStop(1, bg1);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      pointerX.current += (targetPointerX.current - pointerX.current) * 0.045;
      pointerY.current += (targetPointerY.current - pointerY.current) * 0.045;

      // Reset Grid
      for (let i = 0; i < grid.length; i++) grid[i].length = 0;

      // 1. Update Physics & Populate Grid
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];
        nodeA.update();

        // Spatial grid assignment
        const gx = Math.floor(nodeA.x / cellSize);
        const gy = Math.floor(nodeA.y / cellSize);
        if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
          grid[gy * cols + gx].push(nodeA);
        }

        // Repulsion physics (O(N^2) restricted to local area is handled by spatial logic too, but simplified here)
        if (nodeA.proximityToMouseSq < 62500) {
          for (let j = i + 1; j < nodes.length; j++) {
            const nodeB = nodes[j];
            const dxN = nodeA.x - nodeB.x;
            const dyN = nodeA.y - nodeB.y;
            const distSqN = dxN * dxN + dyN * dyN;
            if (distSqN < interNodeRepelRadiusSq) {
              const distN = Math.sqrt(distSqN);
              const repel = (1 - distN / 65) * 0.06;
              nodeA.vx += (dxN / distN) * repel;
              nodeA.vy += (dyN / distN) * repel;
              nodeB.vx -= (dxN / distN) * repel;
              nodeB.vy -= (dyN / distN) * repel;
            }
          }
        }
      }

      // 2. Optimized Batch Draw Connections (Using Grid)
      ctx.beginPath();
      ctx.strokeStyle = iEdgeColor;
      ctx.lineWidth = 0.6;
      
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const cellIdx = gy * cols + gx;
          const currentCellNodes = grid[cellIdx];
          
          // Neighbors to check: self, right, bottom-right, bottom, bottom-left
          const neighborOffsets = [
            [0, 0], [1, 0], [1, 1], [0, 1], [-1, 1]
          ];

          for (const nodeA of currentCellNodes) {
            for (const [ox, oy] of neighborOffsets) {
              const nx = gx + ox;
              const ny = gy + oy;
              if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                const neighborNodes = grid[ny * cols + nx];
                for (const nodeB of neighborNodes) {
                  // Avoid self-comparison
                  if (nodeA === nodeB) continue;
                  
                  const dx = nodeA.x - nodeB.x;
                  const dy = nodeA.y - nodeB.y;
                  const distSq = dx * dx + dy * dy;
                  
                  if (distSq < connectionDistSq) {
                    ctx.moveTo(nodeA.x, nodeA.y);
                    ctx.lineTo(nodeB.x, nodeB.y);
                    if (Math.random() < 0.00008) signals.push(new Signal(nodeA, nodeB));
                  }
                }
              }
            }
          }
        }
      }
      ctx.stroke();

      // 3. Batch Draw Nodes
      ctx.fillStyle = iNodeColor;
      ctx.beginPath();
      for (const node of nodes) {
        ctx.moveTo(node.x + node.radius, node.y);
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      }
      ctx.fill();

      // 4. Draw Signals
      ctx.fillStyle = iPulseColor;
      signals = signals.filter(s => {
        const active = s.update();
        if (active) {
          const x = s.startNode.x + (s.endNode.x - s.startNode.x) * s.progress;
          const y = s.startNode.y + (s.endNode.y - s.startNode.y) * s.progress;
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
        return active;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', init);
    init(); animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [densityFactor]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 bg-black pointer-events-none" style={{ willChange: 'transform' }} />;
});
