import { useRef, useState } from "react";
import type { CSSProperties } from "react";

interface StickerProps {
  src:       string;
  alt?:      string;
  size?:     number;
  rotate?:   number;
  style?:    CSSProperties;
  className?: string;
}

const VARIANTS = ["sticker-float-a", "sticker-float-b", "sticker-float-c", "sticker-float-d"];

export function Sticker({ src, alt = "", size = 120, rotate = 0, style, className }: StickerProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);

  // Animation unique basée sur le numéro du sticker (ex: "Sticker_09" → 9)
  const num      = parseInt(src.match(/Sticker_0*(\d+)/i)?.[1] ?? "1");
  const variant  = VARIANTS[num % VARIANTS.length];
  const duration = `${3.0 + (num % 5) * 0.45}s`;
  const delay    = `${-((num * 1.1) % 5).toFixed(1)}s`;

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    drag.current = { mx: e.clientX, my: e.clientY, ox: pos.x, oy: pos.y };
    const onMove = (ev: MouseEvent) => {
      if (!drag.current) return;
      setPos({ x: drag.current.ox + ev.clientX - drag.current.mx, y: drag.current.oy + ev.clientY - drag.current.my });
    };
    const onUp = () => {
      drag.current = null;
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setDragging(true);
    drag.current = { mx: t.clientX, my: t.clientY, ox: pos.x, oy: pos.y };
    const onMove = (ev: TouchEvent) => {
      if (!drag.current) return;
      ev.preventDefault();
      const touch = ev.touches[0];
      setPos({ x: drag.current.ox + touch.clientX - drag.current.mx, y: drag.current.oy + touch.clientY - drag.current.my });
    };
    const onEnd = () => {
      drag.current = null;
      setDragging(false);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  };

  // On extrait zIndex du style pour que le CSS garde toujours le contrôle
  // du z-index (-1) → sticker toujours derrière le contenu.
  const { zIndex: _z, ...restStyle } = style ?? {};

  return (
    <span
      className={`sticker-wrap${className ? ` ${className}` : ""}`}
      style={{
        ...restStyle,
        animationName: variant,
        animationDuration: duration,
        animationDelay: delay,
        animationPlayState: dragging ? "paused" : undefined,
      }}
      aria-hidden="true"
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        className="sticker"
        style={{ width: size, height: "auto", transform: `translate(${pos.x}px, ${pos.y}px) rotate(${rotate}deg)` }}
      />
    </span>
  );
}
