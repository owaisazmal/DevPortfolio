"use client";

import { useCallback, useEffect, useState } from "react";

import { cn } from "@/utils/cn";
import { play } from "@/utils/sound";
import { reducedMotion } from "@/utils/zoomRects";

import { PixelIcon } from "./ui/PixelIcon";

type Phase = "idle" | "on" | "fading";

const inits = [
  "./swift.svg",
  "./re.svg",
  "./ts.svg",
  "./expo.svg",
  "./kotlin.svg",
  "./firebase.svg",
  "./xcode.svg",
  "./git.svg",
];

const phoneMap = [
  "...##########...",
  "..#..........#..",
  ".#............#.",
  ".#....####....#.",
  ".#............#.",
  ".#.##########.#.",
  ".#.#oooooooo#.#.",
  ".#.#oooooooo#.#.",
  ".#.#oo#oo#oo#.#.",
  ".#.#oo#oo#oo#.#.",
  ".#.#oooooooo#.#.",
  ".#.#o#oooo#o#.#.",
  ".#.#oo#oo#oo#.#.",
  ".#.#ooo##ooo#.#.",
  ".#.#oooooooo#.#.",
  ".#.##########.#.",
  ".#............#.",
  ".#.....##.....#.",
  ".#.....##.....#.",
  ".#............#.",
  "..#..........#..",
  "...##########...",
];

const fills: Record<string, string> = {
  "#": "currentColor",
  o: "rgb(var(--paper))",
};

const BootScreen = () => {
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [loaded, setLoaded] = useState(0);

  const start = useCallback(() => {
    if (reducedMotion()) window.dispatchEvent(new Event("portfolio:restart"));
    else setRun((value) => value + 1);
  }, []);

  useEffect(() => {
    window.addEventListener("portfolio:boot", start);
    return () => window.removeEventListener("portfolio:boot", start);
  }, [start]);

  useEffect(() => {
    if (run === 0) return;
    setPhase("on");
    setLoaded(0);
    play("open");

    const timers: number[] = [];
    const after = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const clear = () => timers.forEach((id) => window.clearTimeout(id));
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      unlisten();
      clear();
      setPhase("fading");
      window.dispatchEvent(new Event("portfolio:restart"));
      after(250, () => setPhase("idle"));
    };
    const onKey = (event: KeyboardEvent) => {
      event.stopPropagation();
      if (event.key === "Tab") event.preventDefault();
      finish();
    };
    const unlisten = () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("pointerdown", finish);
      window.removeEventListener("touchstart", finish);
    };

    inits.forEach((_, i) => after(520 + i * 110, () => setLoaded(i + 1)));
    after(1900, finish);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("pointerdown", finish);
    window.addEventListener("touchstart", finish, { passive: true });

    return () => {
      unlisten();
      clear();
    };
  }, [run]);

  if (phase === "idle") return null;

  return (
    <div
      aria-busy="true"
      className={cn(
        "fixed inset-0 z-[9995] touch-none select-none bg-paper transition-opacity duration-[250ms] ease-linear",
        phase === "fading" && "opacity-0",
      )}
    >
      <span role="status" className="sr-only">
        Starting up
      </span>

      <div aria-hidden className="absolute inset-0 grid place-items-center p-4">
        <div className="h-[180px] w-[min(320px,100%)] border-2 border-ink bg-surface shadow-retro-lg">
          <div className="m-1 flex h-[calc(100%-0.5rem)] flex-col items-center justify-center gap-4 border border-ink">
            <PixelIcon map={phoneMap} fills={fills} size={66} className="text-ink" />
            <p className="font-serif text-3xl leading-none">Welcome to Owais.</p>
          </div>
        </div>
      </div>

      <ul aria-hidden className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1.5 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:gap-2 sm:p-4 sm:pb-[max(1rem,env(safe-area-inset-bottom))]">
        {inits.map((src, i) => (
          <li
            key={src}
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center border-2 border-ink bg-black",
              i >= loaded && "invisible",
            )}
          >
            <img src={src} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BootScreen;
