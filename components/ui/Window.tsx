"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/utils/cn";
import { play } from "@/utils/sound";
import { centerBox, reducedMotion, zoomRects } from "@/utils/zoomRects";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const tones = {
  white: "bg-surface",
  paper: "bg-paper",
  steel: "bg-steel-wash",
};

type Shade = "open" | "closing" | "closed" | "opening";

type WindowProps = {
  title: string;
  titleAs?: "span" | "h3";
  tone?: keyof typeof tones;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
};

export const Window = ({
  title,
  titleAs: Title = "span",
  tone = "white",
  className,
  bodyClassName,
  children,
}: WindowProps) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<Shade>("open");
  const [shade, setShadeState] = useState<Shade>("open");
  const [zoomed, setZoomed] = useState(false);
  const [generation, setGeneration] = useState(0);
  const zoomFrom = useRef<DOMRect | null>(null);
  const bodyId = useId();

  const setShade = useCallback((next: Shade) => {
    shadeRef.current = next;
    setShadeState(next);
  }, []);

  const toggle = useCallback(() => {
    const expanded = shadeRef.current === "open" || shadeRef.current === "opening";
    play("shade");
    if (reducedMotion()) setShade(expanded ? "closed" : "open");
    else setShade(expanded ? "closing" : "opening");
  }, [setShade]);

  const toggleZoom = useCallback(() => {
    zoomFrom.current = frameRef.current?.getBoundingClientRect() ?? null;
    setZoomed((value) => {
      play(value ? "close" : "open");
      return !value;
    });
  }, []);

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    const from = zoomFrom.current;
    if (!frame || !from) return;
    zoomFrom.current = null;
    const to = frame.getBoundingClientRect();
    if (to.top < 56) frame.scrollIntoView({ block: "start" });
    zoomRects(from, frame.getBoundingClientRect());
  }, [zoomed]);

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    const outer = outerRef.current;
    const bar = barRef.current;
    if (!frame || !outer || !bar) return;

    const barHeight = bar.offsetHeight + 4;
    if (shade === "closing") {
      frame.style.height = `${frame.offsetHeight}px`;
      void frame.offsetHeight;
      frame.style.height = `${barHeight}px`;
    } else if (shade === "opening") {
      frame.style.height = "auto";
      const natural = frame.offsetHeight;
      frame.style.height = `${barHeight}px`;
      void frame.offsetHeight;
      frame.style.height = `${Math.max(natural, outer.clientHeight)}px`;
    } else {
      frame.style.height = "";
    }

    if (shade !== "closing" && shade !== "opening") return;
    const settle = window.setTimeout(() => setShade(shade === "closing" ? "closed" : "open"), 340);
    return () => window.clearTimeout(settle);
  }, [shade, setShade]);

  useEffect(() => {
    const outer = outerRef.current;
    const frame = frameRef.current;
    if (!outer || !frame || reducedMotion()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const box = frame.getBoundingClientRect();
        frame.style.visibility = "hidden";
        zoomRects(centerBox(box), box).finally(() => {
          frame.style.visibility = "";
        });
      },
      { threshold: 0.12 },
    );
    observer.observe(outer);

    return () => {
      observer.disconnect();
      frame.style.visibility = "";
    };
  }, [generation]);

  useEffect(() => {
    const restart = () => setGeneration((value) => value + 1);
    const shadeAll = (event: Event) => {
      const collapse = (event as CustomEvent<boolean>).detail;
      const expanded = shadeRef.current === "open" || shadeRef.current === "opening";
      if (collapse === expanded) toggle();
    };
    window.addEventListener("portfolio:restart", restart);
    window.addEventListener("portfolio:shade", shadeAll);
    return () => {
      window.removeEventListener("portfolio:restart", restart);
      window.removeEventListener("portfolio:shade", shadeAll);
    };
  }, [toggle]);

  const expanded = shade === "open" || shade === "opening";

  return (
    <div ref={outerRef} className={cn("relative min-w-0", className, zoomed && "md:!col-span-full")}>
      <div
        ref={frameRef}
        className={cn(
          "flex min-w-0 flex-col border-2 border-ink shadow-retro",
          tones[tone],
          shade === "open" ? "h-full" : "shade h-auto overflow-hidden",
        )}
      >
        <div
          ref={barRef}
          onDoubleClick={toggle}
          className={cn(
            "flex select-none items-center gap-2.5 bg-paper px-2 py-1.5",
            shade !== "closed" && "border-b-2 border-ink",
          )}
        >
          <button
            type="button"
            onClick={toggleZoom}
            onDoubleClick={(event) => event.stopPropagation()}
            aria-pressed={zoomed}
            aria-label={`${zoomed ? "Restore" : "Zoom"} ${title}`}
            className="relative hidden h-3.5 w-3.5 shrink-0 border-2 border-ink bg-paper transition-colors after:absolute after:left-[1px] after:top-[1px] after:h-[5px] after:w-[5px] after:border-b-2 after:border-r-2 after:border-ink hover:bg-steel-wash md:block"
          />
          <span aria-hidden className="h-3.5 w-3.5 shrink-0 border-2 border-ink bg-paper md:hidden" />
          <span aria-hidden className="titlebar-stripes h-2.5 min-w-3 flex-1" />
          <Title className="max-w-[75%] truncate font-mono text-[11px] font-semibold uppercase tracking-[0.15em]">
            {title}
          </Title>
          <span aria-hidden className="titlebar-stripes h-2.5 min-w-3 flex-1" />
          <button
            type="button"
            onClick={toggle}
            onDoubleClick={(event) => event.stopPropagation()}
            aria-expanded={expanded}
            aria-controls={bodyId}
            aria-label={`${expanded ? "Collapse" : "Expand"} ${title}`}
            className="relative h-3.5 w-3.5 shrink-0 border-2 border-ink bg-paper transition-colors after:absolute after:inset-x-[1px] after:top-1/2 after:h-[2px] after:-translate-y-1/2 after:bg-ink hover:bg-steel-wash"
          />
        </div>
        <div
          id={bodyId}
          style={shade === "closed" ? { display: "none" } : undefined}
          className={cn("min-h-0 flex-1", bodyClassName)}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
