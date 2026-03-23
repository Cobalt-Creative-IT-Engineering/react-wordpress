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
  { tl:[10,35,0.75,0.95],tr:[82,9,0.55,0.45],  tr2:[80,15,0.45,0.4], c:[50,50,0.6,0.62], bl:[18,78,0.65,0.6],  br:[82,82,0.58,0.65] },
  { tl:[12,40,0.70,0.90],tr:[78,8,0.58,0.5],   tr2:[82,20,0.5,0.45], c:[50,55,0.65,0.68],bl:[22,82,0.60,0.65], br:[86,80,0.60,0.68] },
  { tl:[10,36,0.74,0.93],tr:[83,10,0.54,0.44], tr2:[79,16,0.46,0.41],c:[51,51,0.61,0.63],bl:[19,79,0.64,0.61], br:[83,83,0.57,0.64] },
];

function buildGradient(cfg: FrameConfig): string {
  const { tl, tr, c, bl, br } = cfg;
  return [
    `radial-gradient(ellipse ${Math.round(tl[2]*100)}% ${Math.round(tl[3]*100)}% at ${tl[0]}% ${tl[1]}%, ${COLORS.TL} 0%, transparent 60%)`,
    `radial-gradient(ellipse ${Math.round(tr[2]*100)}% ${Math.round(tr[3]*100)}% at ${tr[0]}% ${tr[1]}%, ${COLORS.TR} 0%, transparent 50%)`,
    `radial-gradient(ellipse ${Math.round(c[2]*100)}%  ${Math.round(c[3]*100)}%  at ${c[0]}%  ${c[1]}%,  ${COLORS.C}  0%, transparent 55%)`,
    `radial-gradient(ellipse ${Math.round(bl[2]*100)}% ${Math.round(bl[3]*100)}% at ${bl[0]}% ${bl[1]}%, ${COLORS.BL} 0%, transparent 55%)`,
    `radial-gradient(ellipse ${Math.round(br[2]*100)}% ${Math.round(br[3]*100)}% at ${br[0]}% ${br[1]}%, ${COLORS.BR} 0%, transparent 52%)`,
  ].join(",");
}

function hexToRgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}

// Pré-calcule N frames de grain statiques sur un canvas dédié
// Rendu à résolution pleine → drawImage sans scaling (O(1), GPU)
const N_BAKED  = 6;
const PIXEL    = 2;
const DENSITY  = 0.75;
const FRAME_MS = 500;  // gradient toutes les 500ms
const GRAIN_MS = 100;  // grain ~10fps

function prebakeGrainFrames(w: number, h: number): HTMLCanvasElement[] {
  const palette = [...BASE_PALETTE,
    ...[COLORS.TL, COLORS.TR, COLORS.C, COLORS.BL, COLORS.BR, COLORS.base].map(hexToRgb)
  ];
  const cols = Math.ceil(w / PIXEL);
  const rows = Math.ceil(h / PIXEL);

  return Array.from({ length: N_BAKED }, () => {
    const oc    = document.createElement("canvas");
    oc.width    = w;
    oc.height   = h;
    const octx  = oc.getContext("2d")!;
    const img   = octx.createImageData(w, h);
    const data  = img.data;

    for (let i = 0; i < cols * rows; i++) {
      if (Math.random() > DENSITY) continue;
      const c     = palette[Math.floor(Math.random() * palette.length)];
      const alpha = Math.round((0.1 + Math.random() * 0.55) * 255);
      const px    = (i % cols) * PIXEL;
      const py    = Math.floor(i / cols) * PIXEL;
      for (let dy = 0; dy < PIXEL; dy++) {
        const rowOff = (py + dy) * w;
        for (let dx = 0; dx < PIXEL; dx++) {
          const idx = (rowOff + px + dx) * 4;
          if (idx + 3 >= data.length) continue;
          data[idx]     = c[0];
          data[idx + 1] = c[1];
          data[idx + 2] = c[2];
          data[idx + 3] = alpha;
        }
      }
    }
    octx.putImageData(img, 0, 0);
    return oc;
  });
}

export function HeroCanvas() {
  const wrapRef   = useRef<HTMLDivElement>(null);
  const bgRef     = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap   = wrapRef.current;
    const bgEl   = bgRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !bgEl || !canvas) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const ctx = isMobile ? null : canvas.getContext("2d");

    let fi = 0, gfi = 0;
    let lastSwitch = 0, lastGrain = 0, rafId = 0;
    let bakedFrames: HTMLCanvasElement[] = [];

    function applyBg() {
      bgEl!.style.cssText =
        `position:absolute;inset:-30%;width:160%;height:160%;` +
        `filter:blur(30px) contrast(1.15);` +
        `background:${buildGradient(FRAME_CONFIGS[fi])};` +
        `background-color:${COLORS.base}`;
    }

    function rebuild() {
      canvas!.width  = wrap!.offsetWidth;
      canvas!.height = wrap!.offsetHeight;
      if (ctx) bakedFrames = prebakeGrainFrames(canvas!.width, canvas!.height);
    }

    function loop(ts: number) {
      if (ts - lastSwitch >= FRAME_MS) {
        fi = (fi + 1) % FRAME_CONFIGS.length;
        applyBg();
        lastSwitch = ts;
      }

      if (ctx && ts - lastGrain >= GRAIN_MS && bakedFrames.length) {
        gfi = (gfi + 1) % N_BAKED;
        ctx.clearRect(0, 0, canvas!.width, canvas!.height);
        ctx.drawImage(bakedFrames[gfi], 0, 0); // même taille → pas de scaling
        lastGrain = ts;
      }

      rafId = requestAnimationFrame(loop);
    }

    rebuild();
    applyBg();
    rafId = requestAnimationFrame(loop);

    const ro = new ResizeObserver(rebuild);
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
