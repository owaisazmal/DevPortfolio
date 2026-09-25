"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { chime } from "@/utils/sound";
import { reducedMotion } from "@/utils/zoomRects";

import { PixelIcon } from "./ui/PixelIcon";

const inits = [
  { src: "./swift.svg", name: "Swift" },
  { src: "./re.svg", name: "React Native" },
  { src: "./ts.svg", name: "TypeScript" },
  { src: "./expo.svg", name: "Expo" },
  { src: "./kotlin.svg", name: "Kotlin" },
  { src: "./firebase.svg", name: "Firebase" },
  { src: "./xcode.svg", name: "Xcode" },
  { src: "./git.svg", name: "Git" },
];

const HAPPY = 420;
const ZOOM = 880;
const WELCOME = 1060;
const PARADE = 1180;
const STEP = 110;
const READY = PARADE + inits.length * STEP;

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

const slots = [
  { text: "Starting up…", at: WELCOME, until: PARADE },
  ...inits.map((init, i) => ({
    text: `Loading ${init.name}…`,
    at: PARADE + i * STEP,
    until: PARADE + (i + 1) * STEP,
  })),
];

const started = (el: Element | null) =>
  el?.getAnimations?.().find((animation) => {
    const css = animation as CSSAnimation;
    return css.animationName === "boot-dissolve" && css.effect?.getComputedTiming().progress != null;
  });

const BootScreen = () => {
  const [run, setRun] = useState(0);
  const [on, setOn] = useState(true);
  const [skip, setSkip] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const revealed = useRef(false);

  const reveal = useCallback(() => {
    if (revealed.current) return;
    revealed.current = true;
    window.dispatchEvent(new Event("portfolio:restart"));
  }, []);

  const start = useCallback(() => {
    if (reducedMotion()) {
      window.dispatchEvent(new Event("portfolio:restart"));
      return;
    }
    revealed.current = false;
    setSkip(false);
    setOn(true);
    setRun((value) => value + 1);
    chime();
  }, []);

  useEffect(() => {
    window.addEventListener("portfolio:boot", start);
    return () => window.removeEventListener("portfolio:boot", start);
  }, [start]);

  useEffect(() => {
    if (!on) return;
    if (reducedMotion()) {
      setOn(false);
      return;
    }

    const root = rootRef.current;
    const late = started(root) ?? started(root?.firstElementChild ?? null);
    if (late) {
      reveal();
      if (late.playState === "finished") {
        setOn(false);
        return;
      }
    }

    const skipNow = () => {
      if (!revealed.current) setSkip(true);
    };
    const onKey = (event: KeyboardEvent) => {
      event.stopPropagation();
      if (event.key === "Tab") event.preventDefault();
      skipNow();
    };
    const fallback = window.setTimeout(() => {
      reveal();
      setOn(false);
    }, 4000);

    window.addEventListener("keydown", onKey, true);
    window.addEventListener("pointerdown", skipNow);
    window.addEventListener("touchstart", skipNow, { passive: true });
    window.addEventListener("wheel", skipNow, { passive: true });
    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("pointerdown", skipNow);
      window.removeEventListener("touchstart", skipNow);
      window.removeEventListener("wheel", skipNow);
    };
  }, [on, run, reveal]);

  if (!on) return null;

  const year = new Date().getFullYear();

  return (
    <div
      key={run}
      ref={rootRef}
      aria-busy="true"
      data-skip={skip || undefined}
      className="boot"
      onAnimationStart={(event) => {
        if (event.animationName === "boot-dissolve") reveal();
      }}
      onAnimationEnd={(event) => {
        if (event.animationName === "boot-dissolve") setOn(false);
      }}
    >
      <div className="boot-inner">
        <span role="status" className="sr-only">
          Starting up
        </span>

        <div aria-hidden className="boot-screen">
          <div className="relative grid place-items-center">
            <span
              className="boot-later absolute text-ink"
              style={{ animation: `boot-pop 540ms steps(3, end) ${HAPPY}ms` }}
            >
              <PixelIcon map={phoneMap} fills={fills} size={72} />
            </span>

            <div className="boot-zoom absolute inset-0">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} style={{ animationDelay: `${ZOOM + i * 40}ms` }} />
              ))}
            </div>

            <div
              className="boot-later w-[min(22rem,calc(100vw-2rem))] border-2 border-ink bg-surface shadow-retro-lg"
              style={{ animation: `boot-on 1ms ${WELCOME}ms forwards` }}
            >
              <div className="m-1 border border-ink">
                <div className="flex flex-col items-center px-6 pb-4 pt-6 sm:px-8">
                  <PixelIcon map={phoneMap} fills={fills} size={56} className="text-ink" />
                  <p className="mt-3 font-serif text-[2rem] leading-none">Welcome to Owais.</p>

                  <div className="mt-6 h-4 w-full border-2 border-ink bg-paper p-[2px]">
                    <div className="boot-bar h-full bg-graphite" />
                  </div>

                  <p className="relative mt-2 h-4 w-full text-center font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                    {slots.map((slot) => (
                      <span
                        key={slot.text}
                        className="boot-later absolute inset-0"
                        style={{ animation: `boot-on ${slot.until - slot.at}ms ${slot.at}ms` }}
                      >
                        {slot.text}
                      </span>
                    ))}
                    <span
                      className="boot-later absolute inset-0 text-ink"
                      style={{ animation: `boot-on 1ms ${READY}ms forwards` }}
                    >
                      Ready.
                    </span>
                  </p>
                </div>
                <p className="border-t border-dotted border-ash px-3 py-2 text-center font-mono text-[9px] tracking-wider text-ink-soft">
                  Copyright &copy; {year} Owais Khan. All rights reserved.
                </p>
              </div>
            </div>

            <p
              className="boot-later absolute top-full mt-6 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft"
              style={{ animation: `boot-on 1ms ${WELCOME + 200}ms forwards` }}
            >
              <span className="[@media(hover:none)]:hidden">Press any key to skip</span>
              <span className="hidden [@media(hover:none)]:inline">Tap to skip</span>
            </p>
          </div>

          <ul className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 sm:pb-[max(1rem,env(safe-area-inset-bottom))]">
            {inits.map((init, i) => (
              <li
                key={init.src}
                className="boot-init boot-later"
                style={{ animation: `boot-rise 180ms steps(2, end) ${PARADE + i * STEP}ms forwards` }}
              >
                <img src={init.src} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BootScreen;
