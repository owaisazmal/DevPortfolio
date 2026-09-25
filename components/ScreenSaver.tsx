"use client";

import { useEffect, useRef, useState } from "react";

import { play } from "@/utils/sound";
import { reducedMotion } from "@/utils/zoomRects";

const idleMs = 120_000;
const flapMs = 250;
const graceMs = 700;
const jitterPx = 12;

const body = [
  ".######.",
  "#......#",
  "#..##..#",
  "#......#",
  "#.####.#",
  "#.#.##.#",
  "#.####.#",
  "#.##.#.#",
  "#.####.#",
  "#.#.##.#",
  "#.####.#",
  "#.####.#",
  "#......#",
  "#..##..#",
  "#......#",
  ".######.",
];

const wingUp = [
  "#......",
  "##.....",
  "#.#....",
  ".###...",
  "..###..",
  "..####.",
  "...####",
  "....###",
  ".....##",
  ".......",
  ".......",
  ".......",
  ".......",
  ".......",
  ".......",
  ".......",
];

const wingDown = [
  ".......",
  ".......",
  ".......",
  ".......",
  ".......",
  ".......",
  ".....##",
  "....###",
  "...####",
  "..####.",
  "..###..",
  ".###...",
  "#.#....",
  "##.....",
  "#......",
  ".......",
];

const toast = [
  ".###...###.",
  "#####.#####",
  "##.#.#.#.##",
  "#.#.#.#.#.#",
  ".##.#.#.##.",
  ".#.#.#.#.#.",
  ".##.#.#.##.",
  ".#.#.#.#.#.",
  ".##.#.#.##.",
  ".#########.",
  "..#######..",
];

const flip = (row: string) => row.split("").reverse().join("");
const winged = (wing: string[]) => body.map((row, y) => wing[y] + row + flip(wing[y]));

type Kind = "phone" | "toast";

const frames: Record<Kind, string[][]> = {
  phone: [winged(wingUp), winged(wingDown)],
  toast: [toast],
};

type Sprite = {
  kind: Kind;
  scale: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  offset: number;
};

const random = (min: number, max: number) => min + Math.random() * (max - min);

const spawn = (width: number, height: number, anywhere: boolean, toastOk: boolean): Sprite => {
  const kind: Kind = toastOk && Math.random() < 0.3 ? "toast" : "phone";
  const scale = Math.random() < 0.6 ? 3 : 4;
  const w = frames[kind][0][0].length * scale;
  const h = frames[kind][0].length * scale;
  const speed = random(30, 58) * (scale / 3);
  const angle = (random(36, 52) * Math.PI) / 180;
  const fromTop = Math.random() * (width + height) < width;
  return {
    kind,
    scale,
    x: anywhere ? random(-w, width) : fromTop ? random(0, width) : width,
    y: anywhere ? random(-h, height) : fromTop ? -h : random(-h, height * 0.7),
    vx: -Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    offset: random(0, flapMs * 2),
  };
};

const readRgb = (name: string, fallback: string) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return `rgb(${/^\d+\s+\d+\s+\d+$/.test(value) ? value : fallback})`;
};

const stamp = (map: string[], px: number, color: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = map[0].length * px;
  canvas.height = map.length * px;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = color;
    map.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        if (row[x] === "#") ctx.fillRect(x * px, y * px, px, px);
      }
    });
  }
  return canvas;
};

const stop = (event: React.SyntheticEvent<HTMLDivElement>) => event.stopPropagation();

const ScreenSaver = () => {
  const [active, setActive] = useState(false);
  const [still, setStill] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const layerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (active) return;

    let timer = 0;
    let last = performance.now();

    const canSleep = () => !document.hidden && !document.querySelector("dialog[open]");

    const sleep = (quiet: boolean) => {
      window.clearTimeout(timer);
      setElapsed(0);
      setStill(quiet);
      setActive(true);
    };

    const check = () => {
      const remaining = idleMs - (performance.now() - last);
      if (remaining > 0) {
        timer = window.setTimeout(check, remaining);
      } else if (canSleep() && !reducedMotion() && window.matchMedia("(pointer: fine)").matches) {
        sleep(false);
      } else {
        last = performance.now();
        timer = window.setTimeout(check, idleMs);
      }
    };

    const touch = () => {
      last = performance.now();
    };

    const onDialog = (event: Event) => {
      if ((event as CustomEvent<{ name: string }>).detail.name !== "sleep" || !canSleep()) return;
      play("close");
      sleep(reducedMotion());
    };

    const onVisibility = () => {
      if (!document.hidden) touch();
    };

    const activity = ["pointermove", "pointerdown", "keydown", "wheel", "scroll", "touchstart"] as const;
    activity.forEach((name) => window.addEventListener(name, touch, { passive: true }));
    window.addEventListener("portfolio:dialog", onDialog);
    document.addEventListener("visibilitychange", onVisibility);
    timer = window.setTimeout(check, idleMs);

    return () => {
      window.clearTimeout(timer);
      activity.forEach((name) => window.removeEventListener(name, touch));
      window.removeEventListener("portfolio:dialog", onDialog);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active]);

  useEffect(() => {
    const layer = layerRef.current;
    const canvas = canvasRef.current;
    if (!active || !layer || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const startedAt = Date.now();
    const armedAt = performance.now();
    let frame = 0;
    let prev = 0;
    let waking = 0;
    let dpr = 1;
    let width = 0;
    let height = 0;
    let paper = "rgb(255 255 227)";
    const sprites: Sprite[] = [];
    const stamps = new Map<string, HTMLCanvasElement>();

    const image = (kind: Kind, index: number, scale: number) => {
      const px = Math.max(1, Math.round(scale * dpr));
      const key = `${kind}:${index}:${px}`;
      let hit = stamps.get(key);
      if (!hit) {
        hit = stamp(frames[kind][index], px, paper);
        stamps.set(key, hit);
      }
      return hit;
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;
      for (const sprite of sprites) {
        const count = frames[sprite.kind].length;
        const index = still ? 0 : Math.floor((now + sprite.offset) / flapMs) % count;
        ctx.drawImage(
          image(sprite.kind, index, sprite.scale),
          Math.round(sprite.x * dpr),
          Math.round(sprite.y * dpr),
        );
      }
    };

    const toastOk = (ignore?: Sprite) =>
      sprites.filter((sprite) => sprite.kind === "toast" && sprite !== ignore).length <
      Math.max(1, Math.floor(sprites.length / 6));

    const step = (dt: number) => {
      for (let i = 0; i < sprites.length; i++) {
        const sprite = sprites[i];
        sprite.x += sprite.vx * dt;
        sprite.y += sprite.vy * dt;
        const w = frames[sprite.kind][0][0].length * sprite.scale;
        if (sprite.x < -w || sprite.y > height) sprites[i] = spawn(width, height, false, toastOk(sprite));
      }
    };

    const fit = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 3);
      width = layer.clientWidth;
      height = layer.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      stamps.clear();
      const target = Math.min(16, Math.max(5, Math.round((width * height) / 80_000)));
      sprites.length = Math.min(sprites.length, target);
      while (sprites.length < target) sprites.push(spawn(width, height, true, toastOk()));
      sprites.sort((a, b) => a.scale - b.scale);
      draw(performance.now());
    };

    const loop = (now: number) => {
      const dt = prev ? Math.min((now - prev) / 1000, 0.1) : 0;
      prev = now;
      step(dt);
      draw(now);
      frame = window.requestAnimationFrame(loop);
    };

    const run = () => {
      if (still || frame || document.hidden) return;
      prev = 0;
      frame = window.requestAnimationFrame(loop);
    };

    const halt = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
    };

    let origin: { x: number; y: number } | null = null;

    const wake = (event: Event) => {
      if (event instanceof KeyboardEvent) {
        event.stopPropagation();
        if (event.key === "Tab") event.preventDefault();
      }
      if (event.type === "pointermove" && event instanceof PointerEvent && event.pointerType === "mouse") {
        origin ??= { x: event.clientX, y: event.clientY };
        if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) < jitterPx) return;
      }
      if (waking || performance.now() - armedAt < graceMs) return;
      play("open");
      layer.style.transitionDuration = "300ms";
      layer.style.opacity = "0";
      waking = window.setTimeout(() => setActive(false), 320);
    };

    const onVisibility = () => (document.hidden ? halt() : run());
    const prevent = (event: Event) => event.preventDefault();
    const theme = new MutationObserver(() => {
      paper = readRgb("--paper", "255 255 227");
      stamps.clear();
      draw(performance.now());
    });
    const wakers = ["pointermove", "pointerdown", "keydown", "touchstart", "wheel"] as const;

    wakers.forEach((name) => window.addEventListener(name, wake, { capture: true, passive: name !== "keydown" }));
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", fit);
    layer.addEventListener("wheel", prevent, { passive: false });
    layer.addEventListener("touchmove", prevent, { passive: false });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const tick = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);

    paper = readRgb("--paper", "255 255 227");
    document.documentElement.style.overflow = "hidden";
    fit();
    void layer.offsetHeight;
    layer.style.opacity = "1";
    run();

    return () => {
      halt();
      if (!document.querySelector("dialog[open]")) document.documentElement.style.overflow = "";
      window.clearTimeout(waking);
      window.clearInterval(tick);
      wakers.forEach((name) => window.removeEventListener(name, wake, true));
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", fit);
      layer.removeEventListener("wheel", prevent);
      layer.removeEventListener("touchmove", prevent);
      theme.disconnect();
    };
  }, [active, still]);

  if (!active) return null;

  const minutes = Math.floor(elapsed / 60);
  const seconds = String(elapsed % 60).padStart(2, "0");

  return (
    <div
      ref={layerRef}
      onPointerDown={stop}
      onPointerUp={stop}
      onClick={stop}
      onTouchStart={stop}
      onTouchEnd={stop}
      className="fixed inset-0 z-[9995] cursor-none bg-ink opacity-0 transition-opacity duration-[600ms] ease-out"
    >
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
      <p
        aria-live="polite"
        className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 font-mono text-[11px] uppercase tracking-wider text-paper"
      >
        Sleeping. Move the mouse to wake.
      </p>
      <p
        aria-hidden
        className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 font-mono text-[11px] uppercase tracking-wider text-paper tabular-nums"
      >
        {minutes}:{seconds}
      </p>
    </div>
  );
};

export default ScreenSaver;
