import { useEffect, useRef } from "react";

const BASE_PALETTE: [number, number, number][] = [
  [252, 36,  0],  [236, 118, 39], [226, 67,  50],  [252, 72,  170],
  [238, 55,  27], [233, 147, 236],[244, 77,  105],  [240, 95,  60],
  [248, 54,  120],[220, 90,  140],[250, 110, 200],  [228, 130, 210],
];

const COLORS = {
  TL: "#fc2400", TR: "#ec7627", C: "#e24332",
  BL: "#ee371b", BR: "#fc48aa", base: "#e993ec",
};

type Frame = [number, number, number, number];
type FrameConfig = { tl: Frame; tr: Frame; tr2: Frame; c: Frame; bl: Frame; br: Frame };

const FRAME_CONFIGS: FrameConfig[] = [
  { tl:[8,30,0.8,1.0],   tr:[88,5,0.5,0.4],   tr2:[75,12,0.4,0.35], c:[55,45,0.5,0.55], bl:[15,82,0.7,0.65],  br:[88,88,0.5,0.6]  },
  { tl:[9,32,0.78,0.98], tr:[85,7,0.52,0.42],  tr2:[78,10,0.42,0.37],c:[52,47,0.52,0.57],bl:[17,80,0.68,0.63], br:[85,85,0.52,0.62] },
  { tl:[10,35,0.75,0.95],tr:[82,9,0.55,0.45],  tr2:[80,15,0.45,0.4], c:[50,50,0.6,0.62], bl:[18,78,0.65,0.6],  br:[82,82,0.58,0.65] },
  { tl:[11,38,0.73,0.92],tr:[80,11,0.53,0.43], tr2:[78,18,0.47,0.42],c:[52,52,0.62,0.64],bl:[20,80,0.63,0.62], br:[84,84,0.56,0.63] },
  { tl:[12,40,0.70,0.90],tr:[78,8,0.58,0.5],   tr2:[82,20,0.5,0.45], c:[50,55,0.65,0.68],bl:[22,82,0.60,0.65], br:[86,80,0.60,0.68] },
  { tl:[9,33,0.76,0.96], tr:[86,6,0.51,0.41],  tr2:[76,13,0.43,0.38],c:[53,48,0.53,0.58],bl:[16,81,0.69,0.64], br:[87,86,0.51,0.61] },
  { tl:[8,31,0.79,0.99], tr:[89,4,0.49,0.39],  tr2:[74,11,0.41,0.36],c:[56,46,0.51,0.56],bl:[14,83,0.71,0.66], br:[89,89,0.49,0.59] },
  { tl:[10,36,0.74,0.93],tr:[83,10,0.54,0.44], tr2:[79,16,0.46,0.41],c:[51,51,0.61,0.63],bl:[19,79,0.64,0.61], br:[83,83,0.57,0.64] },
];

function buildGradient(cfg: FrameConfig): string {
  const { tl, tr, tr2, c, bl, br } = cfg;
  return [
    `radial-gradient(ellipse ${Math.round(tl[2]*100)}% ${Math.round(tl[3]*100)}% at ${tl[0]}% ${tl[1]}%, ${COLORS.TL} 0%, transparent 58%)`,
    `radial-gradient(ellipse ${Math.round(tr[2]*100)}% ${Math.round(tr[3]*100)}% at ${tr[0]}% ${tr[1]}%, ${COLORS.TR} 0%, transparent 45%)`,
    `radial-gradient(ellipse ${Math.round(tr2[2]*100)}% ${Math.round(tr2[3]*100)}% at ${tr2[0]}% ${tr2[1]}%, ${COLORS.TR} 0%, transparent 50%)`,
    `radial-gradient(ellipse ${Math.round(c[2]*100)}% ${Math.round(c[3]*100)}% at ${c[0]}% ${c[1]}%, ${COLORS.C} 0%, transparent 55%)`,
    `radial-gradient(ellipse ${Math.round(bl[2]*100)}% ${Math.round(bl[3]*100)}% at ${bl[0]}% ${bl[1]}%, ${COLORS.BL} 0%, transparent 55%)`,
    `radial-gradient(ellipse ${Math.round(br[2]*100)}% ${Math.round(br[3]*100)}% at ${br[0]}% ${br[1]}%, ${COLORS.BR} 0%, transparent 52%)`,
  ].join(",");
}

function hexToRgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}

type GrainParticle = { r: number; g: number; b: number; phase: number; speed: number; base: number; amp: number };

// Grain en pixels larges → moins de cellules à calculer
const PIXEL        = 3;
const DENSITY      = 0.85;
const INTENSITY    = 0.85;
const GRAIN_SPEED  = 0.04;
const FRAME_MS     = 250;
const GRAIN_MS     = 50;   // grain à ~20fps, pas 60fps

export function HeroCanvas() {
  const wrapRef   = useRef<HTMLDivElement>(null);
  const bgRef     = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap   = wrapRef.current;
    const bgEl   = bgRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !bgEl || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let fi = 0, t = 0, lastSwitch = 0, lastGrain = 0, rafId = 0;
    let cols = 0, rows = 0;
    let grainData: GrainParticle[] = [];
    let imgData: ImageData | null = null;

    function rebuildGrain() {
      cols = Math.ceil(canvas!.width  / PIXEL);
      rows = Math.ceil(canvas!.height / PIXEL);
      const userRgbs = [COLORS.TL, COLORS.TR, COLORS.C, COLORS.BL, COLORS.BR, COLORS.base].map(hexToRgb);
      const palette  = [...BASE_PALETTE, ...userRgbs];
      grainData = Array.from({ length: cols * rows }, () => {
        const c = palette[Math.floor(Math.random() * palette.length)];
        return {
          r: c[0], g: c[1], b: c[2],
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 2.0,
          base:  0.15 + Math.random() * 0.5,
          amp:   0.06 + Math.random() * 0.28,
        };
      });
      // Réalloue ImageData seulement quand les dimensions changent
      imgData = ctx!.createImageData(canvas!.width, canvas!.height);
    }

    function resize() {
      canvas!.width  = wrap!.offsetWidth;
      canvas!.height = wrap!.offsetHeight;
      rebuildGrain();
    }

    function applyBg() {
      bgEl!.style.cssText =
        `position:absolute;inset:-35%;width:170%;height:170%;` +
        `filter:blur(52px) contrast(1.2);` +
        `background:${buildGradient(FRAME_CONFIGS[fi])};` +
        `background-color:${COLORS.base}`;
    }

    function loop(ts: number) {
      // Gradient : 4fps (250ms)
      if (ts - lastSwitch >= FRAME_MS) {
        fi = (fi + 1) % FRAME_CONFIGS.length;
        applyBg();
        lastSwitch = ts;
      }

      // Grain : 20fps (50ms) — ImageData au lieu de fillRect × N
      if (ts - lastGrain >= GRAIN_MS && imgData) {
        t += GRAIN_SPEED;
        const data = imgData.data;
        data.fill(0); // clear en une opération native

        for (let i = 0; i < grainData.length; i++) {
          if (Math.random() > DENSITY) continue;
          const g = grainData[i];
          const a = Math.max(0, Math.min(1,
            (g.base + Math.sin(t * g.speed + g.phase) * g.amp) * INTENSITY
          ));
          if (a < 0.05) continue;
          const alpha = Math.round(a * 255);
          const px = (i % cols) * PIXEL;
          const py = Math.floor(i / cols) * PIXEL;
          for (let dy = 0; dy < PIXEL; dy++) {
            const row = (py + dy) * canvas!.width;
            for (let dx = 0; dx < PIXEL; dx++) {
              const idx = (row + px + dx) * 4;
              data[idx]     = g.r;
              data[idx + 1] = g.g;
              data[idx + 2] = g.b;
              data[idx + 3] = alpha;
            }
          }
        }
        ctx!.putImageData(imgData, 0, 0);
        lastGrain = ts;
      }

      rafId = requestAnimationFrame(loop);
    }

    resize();
    applyBg();
    rafId = requestAnimationFrame(loop);

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "absolute", inset: 0 }}>
      <div ref={bgRef} />
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay" }} />
    </div>
  );
}
