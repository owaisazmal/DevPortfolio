"use client";

import { useCallback, useEffect, useState } from "react";
import { FiArrowUpRight } from "react-icons/fi";

import { contactEmail, moreProjects, projects, techLabel } from "@/data";
import { cn } from "@/utils/cn";

import { Dialog } from "./ui/Dialog";

type Name = "about" | "bomb";

const konami = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const bombMap = [
  ".............*..",
  "...........#*.*.",
  "..........#.....",
  ".........#......",
  "......###.......",
  ".....#####......",
  "....##o####.....",
  "...###o#####....",
  "...#########....",
  "...#########....",
  "...#########....",
  "....#######.....",
  ".....#####......",
  "......###.......",
];

const fills: Record<string, string> = {
  "#": "currentColor",
  o: "rgb(var(--paper))",
  "*": "rgb(var(--steel))",
};

const Bomb = () => (
  <svg viewBox="0 0 16 16" width="72" height="72" shapeRendering="crispEdges" aria-hidden className="shrink-0">
    {bombMap.flatMap((row, y) =>
      row.split("").map((ch, x) =>
        fills[ch] ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={fills[ch]} /> : null,
      ),
    )}
  </svg>
);

const all = [...projects, ...moreProjects];

const tally = new Map<string, number>();
all.forEach((project) =>
  project.iconLists.forEach((icon) => {
    const label = techLabel(icon);
    tally.set(label, (tally.get(label) ?? 0) + 1);
  }),
);
const memory = Array.from(tally.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([label]) => label)
  .join(", ");

const platforms = ["iOS", "Android", "Web"].map((name) => ({
  name,
  count: all.filter((project) => project.kind.includes(name)).length,
}));

const SystemDialogs = () => {
  const [open, setOpen] = useState<Name | null>(null);
  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    const onDialog = (event: Event) => setOpen((event as CustomEvent<{ name: Name }>).detail.name);

    let progress = 0;
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      progress = key === konami[progress] ? progress + 1 : key === konami[0] ? 1 : 0;
      if (progress < konami.length) return;
      progress = 0;
      setOpen("bomb");
    };

    window.addEventListener("portfolio:dialog", onDialog);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("portfolio:dialog", onDialog);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const restart = () => {
    close();
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    window.dispatchEvent(new Event("portfolio:restart"));
  };

  return (
    <>
      <Dialog open={open === "about"} onClose={close} title="About This Portfolio">
        <div className="flex items-center gap-5">
          <img
            src="./avatar.jpg"
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 border-2 border-ink object-cover"
          />
          <div>
            <p className="font-serif text-3xl leading-none">Owais Khan</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              Mobile Developer &middot; Los Angeles
            </p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 font-mono text-xs">
          <dt className="text-ink-soft">System Software</dt>
          <dd>Next.js 14, Tailwind CSS</dd>
          <dt className="text-ink-soft">Built-in Memory</dt>
          <dd>{memory}</dd>
          <dt className="text-ink-soft">Apps Shipped</dt>
          <dd>{all.length}</dd>
          <dt className="text-ink-soft">Largest Unused Block</dt>
          <dd>Weekends</dd>
        </dl>

        <ul className="mt-6 space-y-2 border-t-2 border-dotted border-ash pt-5">
          {platforms.map((platform) => (
            <li key={platform.name} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 font-mono text-xs">
              <span>{platform.name}</span>
              <span aria-hidden className="flex gap-[3px]">
                {all.map((project, i) => (
                  <span
                    key={project.id}
                    className={cn("h-3 flex-1 border border-ink", i < platform.count ? "bg-ink" : "bg-paper")}
                  />
                ))}
              </span>
              <span className="tabular-nums text-ink-soft">
                {platform.count}/{all.length}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={close} className="btn-retro btn-ink">
            OK
          </button>
        </div>
      </Dialog>

      <Dialog open={open === "bomb"} onClose={close} title="System Error">
        <div className="flex items-start gap-5">
          <Bomb />
          <div className="space-y-3">
            <p className="font-serif text-2xl leading-tight">Sorry, a system error occurred.</p>
            <p className="leading-relaxed text-ink-soft">
              &ldquo;Portfolio&rdquo; has unexpectedly quit because you found the secret. You clearly
              enjoy pressing buttons, and I happen to need people like that.
            </p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              ID = 01 &middot; Beta testers wanted
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={restart} className="btn-retro btn-paper">
            Restart
          </button>
          <a
            href={`mailto:${contactEmail}?subject=${encodeURIComponent("I found the bomb")}`}
            className="btn-retro btn-ink"
          >
            Report bug <FiArrowUpRight aria-hidden />
          </a>
        </div>
      </Dialog>
    </>
  );
};

export default SystemDialogs;
