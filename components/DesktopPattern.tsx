"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/utils/cn";
import {
  Pattern,
  applyPattern,
  buildPatternUrl,
  presets,
  readInk,
  restorePattern,
  same,
  side,
} from "@/utils/pattern";
import { play } from "@/utils/sound";

import { Dialog } from "./ui/Dialog";
import { PixelIcon } from "./ui/PixelIcon";

const fills: Record<string, string> = { "#": "currentColor" };

const tileMap = (pattern: Pattern) => {
  const rows = Array.from({ length: side }, (_, y) =>
    pattern
      .slice(y * side, y * side + side)
      .map((on) => (on ? "#" : "."))
      .join(""),
  );
  return [...rows, ...rows].map((row) => row + row);
};

const tiles = presets.map((preset) => ({ ...preset, map: tileMap(preset.pattern) }));

const steps: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

const DesktopPattern = () => {
  const [open, setOpen] = useState(false);
  const [editor, setEditor] = useState<Pattern>(presets[0].pattern);
  const [applied, setApplied] = useState<Pattern | null>(null);
  const [ink, setInk] = useState("43 43 43");
  const [cursor, setCursor] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const brush = useRef<boolean | null>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const saved = restorePattern();
    setApplied(saved);
    if (saved) setEditor(saved);
    setInk(readInk());

    const onDialog = (event: Event) => {
      if ((event as CustomEvent<{ name: string }>).detail.name === "pattern") setOpen(true);
    };
    window.addEventListener("portfolio:dialog", onDialog);
    return () => window.removeEventListener("portfolio:dialog", onDialog);
  }, []);

  useEffect(() => {
    const theme = new MutationObserver(() => {
      setInk(readInk());
      if (applied) applyPattern(applied);
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => theme.disconnect();
  }, [applied]);

  const paint = (index: number, on: boolean) =>
    setEditor((current) =>
      current[index] === on ? current : current.map((value, i) => (i === index ? on : value)),
    );

  const cellAt = (event: React.PointerEvent<HTMLDivElement>) => {
    const grid = event.currentTarget;
    const rect = grid.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left - grid.clientLeft) / grid.clientWidth) * side);
    const y = Math.floor(((event.clientY - rect.top - grid.clientTop) / grid.clientHeight) * side);
    return x < 0 || y < 0 || x >= side || y >= side ? -1 : y * side + x;
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const index = cellAt(event);
    if (index < 0) return;
    brush.current = !editor[index];
    play("click");
    paint(index, brush.current);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      brush.current = null;
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (brush.current === null) return;
    const index = cellAt(event);
    if (index >= 0) paint(index, brush.current);
  };

  const endPaint = () => {
    brush.current = null;
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = steps[event.key];
    if (!step) return;
    event.preventDefault();
    const x = Math.min(side - 1, Math.max(0, (cursor % side) + step[0]));
    const y = Math.min(side - 1, Math.max(0, Math.floor(cursor / side) + step[1]));
    const next = y * side + x;
    setCursor(next);
    gridRef.current?.querySelector<HTMLElement>(`[data-index="${next}"]`)?.focus();
  };

  const pick = (pattern: Pattern) => {
    play("click");
    setEditor(pattern);
  };

  const set = () => {
    play("click");
    applyPattern(editor);
    setApplied(editor);
  };

  const reset = () => {
    play("click");
    applyPattern(null);
    setApplied(null);
    setEditor(presets[0].pattern);
  };

  const url = buildPatternUrl(editor, ink);
  const current = applied
    ? presets.find((preset) => same(preset.pattern, applied))?.name ?? "Custom"
    : "Default";

  return (
    <Dialog open={open} onClose={close} title="Desktop Patterns" className="w-[min(92vw,40rem)]">
      <div className="flex flex-wrap gap-6">
        <div>
          <p className="label text-steel-deep">Pattern</p>
          <div
            ref={gridRef}
            role="group"
            aria-label="Pattern editor, 8 by 8 pixels"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endPaint}
            onPointerCancel={endPaint}
            onLostPointerCapture={endPaint}
            onKeyDown={onKeyDown}
            className="mt-2 inline-grid touch-none select-none grid-cols-8 border border-ink bg-paper shadow-retro-sm"
          >
            {editor.map((on, index) => (
              <button
                key={index}
                type="button"
                data-index={index}
                tabIndex={index === cursor ? 0 : -1}
                aria-pressed={on}
                aria-label={`Row ${Math.floor(index / side) + 1}, column ${(index % side) + 1}`}
                onFocus={() => setCursor(index)}
                onClick={(event) => {
                  if (event.detail !== 0) return;
                  play("click");
                  paint(index, !on);
                }}
                className={cn(
                  "relative h-6 w-6 border border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset",
                  on ? "bg-ink focus-visible:ring-paper" : "bg-paper focus-visible:ring-steel-deep",
                )}
              />
            ))}
          </div>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
            Drag to paint &middot; Arrows move, Space toggles
          </p>
        </div>

        <div>
          <p className="label text-steel-deep">Preview</p>
          <div
            aria-hidden
            className="relative mt-2 h-[120px] w-[160px] overflow-hidden border-2 border-ink bg-paper shadow-retro-sm"
            style={{ backgroundImage: `url("${url}")`, backgroundSize: "16px 16px" }}
          >
            <div className="absolute left-6 top-5 w-24 border-2 border-ink bg-surface shadow-retro-sm">
              <div className="flex items-center gap-1.5 border-b-2 border-ink bg-paper px-1 py-1">
                <span className="h-2 w-2 shrink-0 border border-ink" />
                <span className="titlebar-stripes h-1.5 flex-1" />
              </div>
              <div className="h-10" />
            </div>
          </div>
          <p aria-live="polite" className="mt-2 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
            Desktop: {current}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="label text-steel-deep">Presets</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {tiles.map((tile) => {
            const selected = same(tile.pattern, editor);
            return (
              <button
                key={tile.name}
                type="button"
                onClick={() => pick(tile.pattern)}
                aria-pressed={selected}
                className={cn(
                  "flex flex-col items-center gap-1 border-2 border-ink px-1.5 pb-1 pt-1.5 transition-colors",
                  selected ? "bg-ink text-paper" : "bg-paper hover:bg-steel-wash",
                )}
              >
                <PixelIcon map={tile.map} fills={fills} size={32} />
                <span className="font-mono text-[10px] uppercase tracking-wider">{tile.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={close} className="btn-retro btn-paper">
          Close
        </button>
        <button type="button" onClick={reset} className="btn-retro btn-paper">
          Reset
        </button>
        <button type="button" onClick={set} className="btn-retro btn-ink btn-default">
          Set Desktop Pattern
        </button>
      </div>
    </Dialog>
  );
};

export default DesktopPattern;
