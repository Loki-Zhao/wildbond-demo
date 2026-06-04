import { useEffect, useRef } from "react";

export type PixelIconName =
  | "archive"
  | "book"
  | "chevronUp"
  | "circle"
  | "footprints"
  | "heart"
  | "heartPulse"
  | "home"
  | "info"
  | "languages"
  | "map"
  | "mapPin"
  | "paw"
  | "rotate"
  | "save"
  | "shield"
  | "shieldPlus"
  | "shuffle"
  | "sparkles"
  | "swords"
  | "trash"
  | "x";

const ICON_SIZE = 64;

const displaySize = (size?: number): number => {
  if (!size || size <= 20) return 16;
  if (size <= 40) return 32;
  return 64;
};

const rect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color = "#24302d") => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
};

const line = (ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color = "#24302d", thickness = 4) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
};

const diamond = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color = "#24302d") => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r, cy);
  ctx.closePath();
  ctx.fill();
};

const circle = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color = "#24302d") => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
};

const drawIcon = (ctx: CanvasRenderingContext2D, name: PixelIconName) => {
  ctx.clearRect(0, 0, ICON_SIZE, ICON_SIZE);

  switch (name) {
    case "archive":
      rect(ctx, 12, 16, 40, 8);
      rect(ctx, 16, 24, 32, 28);
      rect(ctx, 24, 32, 16, 4, "#fffaf0");
      break;
    case "book":
      rect(ctx, 14, 12, 16, 40);
      rect(ctx, 34, 12, 16, 40);
      rect(ctx, 30, 16, 4, 36);
      rect(ctx, 18, 18, 8, 4, "#fffaf0");
      break;
    case "chevronUp":
      line(ctx, 16, 40, 32, 24, undefined, 8);
      line(ctx, 32, 24, 48, 40, undefined, 8);
      break;
    case "circle":
      circle(ctx, 32, 32, 18);
      circle(ctx, 32, 32, 10, "#fffaf0");
      break;
    case "footprints":
      circle(ctx, 22, 22, 7);
      rect(ctx, 17, 30, 10, 16);
      circle(ctx, 42, 34, 7);
      rect(ctx, 37, 42, 10, 16);
      break;
    case "heart":
    case "heartPulse":
      rect(ctx, 18, 18, 10, 10);
      rect(ctx, 36, 18, 10, 10);
      rect(ctx, 14, 26, 36, 12);
      rect(ctx, 20, 38, 24, 8);
      rect(ctx, 28, 46, 8, 6);
      if (name === "heartPulse") {
        rect(ctx, 12, 32, 12, 4, "#fffaf0");
        rect(ctx, 26, 28, 4, 8, "#fffaf0");
        rect(ctx, 30, 36, 8, 4, "#fffaf0");
        rect(ctx, 40, 30, 4, 10, "#fffaf0");
      }
      break;
    case "home":
      rect(ctx, 18, 30, 28, 24);
      line(ctx, 14, 32, 32, 14, undefined, 8);
      line(ctx, 32, 14, 50, 32, undefined, 8);
      rect(ctx, 29, 42, 8, 12, "#fffaf0");
      break;
    case "info":
      circle(ctx, 32, 32, 22);
      rect(ctx, 30, 28, 5, 20, "#fffaf0");
      rect(ctx, 30, 18, 5, 5, "#fffaf0");
      break;
    case "languages":
      rect(ctx, 10, 14, 22, 28);
      rect(ctx, 32, 22, 22, 28);
      rect(ctx, 16, 24, 10, 4, "#fffaf0");
      rect(ctx, 20, 18, 4, 20, "#fffaf0");
      rect(ctx, 38, 32, 10, 4, "#fffaf0");
      break;
    case "map":
      rect(ctx, 10, 14, 14, 38);
      rect(ctx, 26, 10, 14, 38);
      rect(ctx, 42, 14, 12, 38);
      rect(ctx, 24, 14, 2, 36, "#fffaf0");
      rect(ctx, 40, 14, 2, 36, "#fffaf0");
      break;
    case "mapPin":
      circle(ctx, 32, 24, 16);
      rect(ctx, 28, 36, 8, 12);
      diamond(ctx, 32, 50, 8);
      circle(ctx, 32, 24, 6, "#fffaf0");
      break;
    case "paw":
      circle(ctx, 32, 38, 13);
      circle(ctx, 18, 24, 6);
      circle(ctx, 28, 18, 6);
      circle(ctx, 40, 18, 6);
      circle(ctx, 50, 24, 6);
      break;
    case "rotate":
      line(ctx, 18, 20, 42, 20, undefined, 6);
      line(ctx, 42, 20, 50, 28, undefined, 6);
      line(ctx, 50, 28, 42, 36, undefined, 6);
      line(ctx, 46, 44, 22, 44, undefined, 6);
      line(ctx, 22, 44, 14, 36, undefined, 6);
      break;
    case "save":
      rect(ctx, 14, 10, 36, 44);
      rect(ctx, 20, 14, 22, 12, "#fffaf0");
      rect(ctx, 22, 38, 20, 12, "#fffaf0");
      rect(ctx, 38, 16, 6, 8);
      break;
    case "shield":
    case "shieldPlus":
      rect(ctx, 18, 12, 28, 8);
      rect(ctx, 14, 20, 36, 16);
      rect(ctx, 20, 36, 24, 10);
      rect(ctx, 28, 46, 8, 8);
      if (name === "shieldPlus") {
        rect(ctx, 29, 24, 6, 18, "#fffaf0");
        rect(ctx, 23, 30, 18, 6, "#fffaf0");
      }
      break;
    case "shuffle":
      line(ctx, 12, 22, 28, 22, undefined, 6);
      line(ctx, 28, 22, 42, 40, undefined, 6);
      line(ctx, 12, 42, 28, 42, undefined, 6);
      line(ctx, 28, 42, 42, 24, undefined, 6);
      rect(ctx, 42, 18, 10, 10);
      rect(ctx, 42, 36, 10, 10);
      break;
    case "sparkles":
      diamond(ctx, 32, 20, 11);
      diamond(ctx, 20, 42, 7);
      diamond(ctx, 45, 44, 6);
      break;
    case "swords":
      line(ctx, 16, 48, 48, 16, undefined, 6);
      line(ctx, 48, 48, 16, 16, undefined, 6);
      rect(ctx, 12, 44, 12, 8);
      rect(ctx, 40, 44, 12, 8);
      break;
    case "trash":
      rect(ctx, 18, 22, 28, 30);
      rect(ctx, 14, 16, 36, 6);
      rect(ctx, 24, 10, 16, 6);
      rect(ctx, 26, 28, 4, 18, "#fffaf0");
      rect(ctx, 36, 28, 4, 18, "#fffaf0");
      break;
    case "x":
      line(ctx, 18, 18, 46, 46, undefined, 8);
      line(ctx, 46, 18, 18, 46, undefined, 8);
      break;
    default:
      break;
  }
};

export function PixelIcon({ name, size, className = "" }: { name: PixelIconName; size?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const renderedSize = displaySize(size);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    (ctx as CanvasRenderingContext2D & { webkitImageSmoothingEnabled?: boolean }).webkitImageSmoothingEnabled = false;
    (ctx as CanvasRenderingContext2D & { mozImageSmoothingEnabled?: boolean }).mozImageSmoothingEnabled = false;
    drawIcon(ctx, name);
  }, [name]);

  return <canvas ref={ref} className={`pixel-icon ${className}`} width={ICON_SIZE} height={ICON_SIZE} style={{ width: renderedSize, height: renderedSize }} aria-hidden="true" />;
}
