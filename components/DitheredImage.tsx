"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/utils/cn";

type Props = {
  src: string;
  alt?: string;
  className?: string;
};

const readRgb = (name: string, fallback: number[]) => {
  const parts = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
    .split(/\s+/)
    .map(Number);
  return parts.length === 3 && parts.every(Number.isFinite) ? parts : fallback;
};

const toBits = (source: HTMLImageElement, width: number, height: number) => {
  const off = document.createElement("canvas");
  off.width = width;
  off.height = height;
  const ctx = off.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  const scale = Math.max(width / source.naturalWidth, height / source.naturalHeight);
  const drawWidth = source.naturalWidth * scale;
  ctx.drawImage(source, (width - drawWidth) / 2, 0, drawWidth, source.naturalHeight * scale);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, width, height).data;
  } catch {
    return null;
  }

  const total = width * height;
  const gray = new Float32Array(total);
  const histogram = new Uint32Array(256);
  for (let i = 0; i < total; i++) {
    const luma = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
    gray[i] = luma;
    histogram[luma | 0]++;
  }

  const percentile = (fraction: number) => {
    let seen = 0;
    for (let value = 0; value < 256; value++) {
      seen += histogram[value];
      if (seen >= total * fraction) return value;
    }
    return 255;
  };
  const low = percentile(0.02);
  const high = Math.max(percentile(0.98), low + 1);
  for (let i = 0; i < total; i++) {
    const t = Math.min(1, Math.max(0, (gray[i] - low) / (high - low)));
    gray[i] = Math.pow(t, 0.8) * 255;
  }

  const bits = new Uint8Array(total);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const old = gray[i];
      const next = old < 128 ? 0 : 255;
      bits[i] = next ? 0 : 1;
      const err = (old - next) / 8;
      if (x + 1 < width) gray[i + 1] += err;
      if (x + 2 < width) gray[i + 2] += err;
      if (y + 1 < height) {
        if (x > 0) gray[i + width - 1] += err;
        gray[i + width] += err;
        if (x + 1 < width) gray[i + width + 1] += err;
      }
      if (y + 2 < height) gray[i + width * 2] += err;
    }
  }
  return bits;
};

const paint = (canvas: HTMLCanvasElement, bits: Uint8Array, width: number, height: number) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  const ink = readRgb("--ink", [43, 43, 43]);
  const paper = readRgb("--paper", [255, 255, 227]);
  canvas.width = width;
  canvas.height = height;
  const image = ctx.createImageData(width, height);
  const out = image.data;
  for (let i = 0; i < bits.length; i++) {
    const color = bits[i] ? ink : paper;
    out[i * 4] = color[0];
    out[i * 4 + 1] = color[1];
    out[i * 4 + 2] = color[2];
    out[i * 4 + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  return true;
};

const DitheredImage = ({ src, alt = "", className }: Props) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let source: HTMLImageElement | null = null;
    let bits: Uint8Array | null = null;
    let size = { w: 0, h: 0 };
    let timer = 0;
    let disposed = false;

    const render = () => {
      if (!source || disposed) return;
      const rect = wrap.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (!w || !h) return;
      if (!bits || w !== size.w || h !== size.h) {
        bits = toBits(source, w, h);
        size = { w, h };
      }
      wrap.dataset.state = bits && paint(canvas, bits, w, h) ? "ready" : "failed";
    };

    const load = () => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        source = img;
        render();
      };
      img.onerror = () => {
        wrap.dataset.state = "failed";
      };
      img.src = src;
    };

    const near = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        near.disconnect();
        load();
      },
      { rootMargin: "300px" },
    );
    near.observe(wrap);

    const resize = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(render, 150);
    });
    resize.observe(wrap);

    const theme = new MutationObserver(() => {
      if (bits) paint(canvas, bits, size.w, size.h);
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    let reveal: IntersectionObserver | null = null;
    if (window.matchMedia("(hover: none)").matches) {
      reveal = new IntersectionObserver(
        ([entry]) => {
          wrap.dataset.reveal = String(entry.isIntersecting);
        },
        { threshold: 0.6 },
      );
      reveal.observe(wrap);
    }

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      near.disconnect();
      resize.disconnect();
      theme.disconnect();
      reveal?.disconnect();
    };
  }, [src]);

  return (
    <div
      ref={wrapRef}
      data-state="loading"
      className={cn("dither relative overflow-hidden bg-paper", className)}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover object-top"
      />
      <canvas ref={canvasRef} aria-hidden />
    </div>
  );
};

export default DitheredImage;
