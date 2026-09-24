"use client";

import { useEffect, useRef, useState } from "react";

import { navItems } from "@/data";
import { cn } from "@/utils/cn";

type Mark = { id: string; name: string; top: number };

const ScrollRuler = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [docHeight, setDocHeight] = useState(1);
  const [trackHeight, setTrackHeight] = useState(0);
  const [view, setView] = useState({ top: 0, height: 0 });

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      setDocHeight(document.documentElement.scrollHeight);
      setTrackHeight(trackRef.current?.clientHeight ?? 0);
      setMarks(
        navItems.flatMap((item) => {
          const el = document.querySelector<HTMLElement>(item.link);
          return el
            ? [{ id: item.link.slice(1), name: item.name, top: el.getBoundingClientRect().top + window.scrollY }]
            : [];
        }),
      );
    };

    const track = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setView({ top: window.scrollY, height: window.innerHeight });
      });
    };

    measure();
    track();
    const observer = new ResizeObserver(() => {
      measure();
      track();
    });
    observer.observe(document.body);
    window.addEventListener("scroll", track, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", track);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const scale = trackHeight / Math.max(docHeight, 1);
  const probe = view.top + view.height * 0.35;
  const active = marks.reduce<string | null>((current, mark) => (mark.top <= probe ? mark.id : current), null);

  return (
    <nav
      aria-label="Page ruler"
      className="fixed bottom-0 left-0 top-12 z-40 hidden w-10 border-r-2 border-ink bg-paper xl:block"
    >
      <div ref={trackRef} className="ruler-ticks absolute inset-x-0 bottom-3 top-3">
        <div
          aria-hidden
          className="absolute inset-x-0 border-y-2 border-ink bg-ink/10"
          style={{ top: view.top * scale, height: Math.max(8, view.height * scale) }}
        />
        {marks.map((mark) => (
          <a
            key={mark.id}
            href={`#${mark.id}`}
            aria-current={active === mark.id ? "location" : undefined}
            className="absolute left-0 w-full"
            style={{ top: mark.top * scale }}
          >
            <span aria-hidden className="block h-[2px] w-full bg-ink" />
            <span
              className={cn(
                "ml-1 mt-1 inline-block px-[3px] py-1 font-mono text-[9px] uppercase tracking-[0.2em] [writing-mode:vertical-rl]",
                active === mark.id ? "bg-ink text-paper" : "text-ink-soft",
              )}
            >
              {mark.name}
            </span>
          </a>
        ))}
      </div>
    </nav>
  );
};

export default ScrollRuler;
