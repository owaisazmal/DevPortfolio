"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { moreProjects, navItems, projects, workExperience } from "@/data";
import { cn } from "@/utils/cn";
import { play } from "@/utils/sound";

import { Dialog } from "./ui/Dialog";
import { PixelIcon } from "./ui/PixelIcon";

const glyphs = {
  folder: [
    "............",
    ".#####......",
    "#.....#.....",
    "############",
    "#..........#",
    "#..........#",
    "#..........#",
    "#..........#",
    "#..........#",
    "#..........#",
    "############",
    "............",
  ],
  phone: [
    "...######...",
    "...#....#...",
    "...#....#...",
    "...#....#...",
    "...#....#...",
    "...#....#...",
    "...#....#...",
    "...#....#...",
    "...#....#...",
    "...######...",
    "...#.##.#...",
    "...######...",
  ],
  document: [
    "..#######...",
    "..#.....##..",
    "..#.....#.#.",
    "..#.....####",
    "..#........#",
    "..#.######.#",
    "..#........#",
    "..#.######.#",
    "..#........#",
    "..#.####...#",
    "..#........#",
    "..##########",
  ],
  gear: [
    "....####....",
    "..#.####.#..",
    ".###....###.",
    ".##......##.",
    "##..####..##",
    "##.##..##.##",
    "##.##..##.##",
    "##..####..##",
    ".##......##.",
    ".###....###.",
    "..#.####.#..",
    "....####....",
  ],
};

const fills: Record<string, string> = { "#": "currentColor" };

type Item = {
  id: string;
  name: string;
  kind: string;
  where: string;
  glyph: keyof typeof glyphs;
  instant?: boolean;
  run: () => void;
};

const emit = (name: string, detail?: unknown) =>
  window.dispatchEvent(new CustomEvent(name, { detail }));

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ block: "start" });

const commands: [label: string, action: string][] = [
  ["Night Mode", "night"],
  ["Sound Effects", "sound"],
  ["Show Balloons", "balloons"],
  ["Restart", "restart"],
  ["About This Portfolio", "about"],
  ["Shut Down", "bomb"],
  ["Sleep", "sleep"],
  ["Puzzle", "puzzle"],
  ["Weather", "weather"],
  ["Desktop Pattern", "pattern"],
  ["Pitch an idea", "pitch"],
  ["Join the beta", "beta"],
  ["Copy Email", "copy"],
  ["Collapse All Windows", "collapse"],
  ["Expand All Windows", "expand"],
  ["Open Résumé", "resume"],
  ["Open GitHub", "github"],
  ["Open LinkedIn", "linkedin"],
  ["Open LeetCode", "leetcode"],
  ["Email Owais", "email"],
];

// These need the user's click to stay live (window.open, AudioContext), so they run before the dialog closes
const instant = new Set(["night", "sound", "copy", "resume", "github", "linkedin", "leetcode", "email"]);

const index: Item[] = [
  ...navItems.map(
    (item): Item => ({
      id: `section:${item.link}`,
      name: item.name,
      kind: "Section",
      where: "This page",
      glyph: "folder",
      run: () => scrollTo(item.link.slice(1)),
    }),
  ),
  ...[...projects, ...moreProjects].map(
    (project): Item => ({
      id: `project:${project.id}`,
      name: project.title,
      kind: project.kind,
      where: "Projects",
      glyph: "phone",
      run: () => emit("portfolio:project", project.id),
    }),
  ),
  ...workExperience.map(
    (job): Item => ({
      id: `job:${job.id}`,
      name: job.org,
      kind: job.role,
      where: "Experience",
      glyph: "document",
      run: () => scrollTo("workExperience"),
    }),
  ),
  ...commands.map(
    ([name, action]): Item => ({
      id: `command:${action}`,
      name,
      kind: "Command",
      where: "Menu",
      glyph: "gear",
      instant: instant.has(action),
      run: () => emit("portfolio:action", action),
    }),
  ),
];

const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const search = (query: string) => {
  const q = fold(query.trim());
  if (!q) return index;
  return index
    .map((item) => {
      const name = fold(item.name);
      const rank = name.startsWith(q) ? 0 : name.includes(q) ? 1 : fold(item.kind).includes(q) ? 2 : 3;
      return { item, rank };
    })
    .filter((entry) => entry.rank < 3)
    .sort((a, b) => a.rank - b.rank)
    .map((entry) => entry.item);
};

const editing = (element: Element | null) =>
  element instanceof HTMLElement &&
  (element.matches("input, textarea, select") || element.isContentEditable);

const columns = "grid-cols-[0.75rem_1fr] md:grid-cols-[0.75rem_1fr_10rem_6.5rem]";

const FindFile = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pending = useRef<(() => void) | null>(null);
  const baseId = useId();
  const listId = `${baseId}-list`;

  const results = useMemo(() => search(query), [query]);

  const show = useCallback(() => {
    setQuery("");
    setActive(0);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    const run = pending.current;
    pending.current = null;
    run?.();
  }, []);

  useEffect(() => {
    const onDialog = (event: Event) => {
      if ((event as CustomEvent<{ name: string }>).detail.name === "find") show();
    };
    const onKey = (event: KeyboardEvent) => {
      const slash = event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey;
      const palette =
        event.key.toLowerCase() === "k" &&
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey;
      if (!slash && !palette) return;
      if (document.querySelector("dialog[open]")) return;
      if (slash && editing(document.activeElement)) return;
      event.preventDefault();
      show();
    };
    window.addEventListener("portfolio:dialog", onDialog);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("portfolio:dialog", onDialog);
      window.removeEventListener("keydown", onKey);
    };
  }, [show]);

  useEffect(() => {
    const input = inputRef.current;
    if (!open || !input) return;
    const deadline = performance.now() + 1500;
    let frame = 0;
    const focus = () => {
      if (document.activeElement === input) return;
      input.focus({ preventScroll: true });
      if (document.activeElement !== input && performance.now() < deadline) {
        frame = requestAnimationFrame(focus);
      }
    };
    focus();
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const activate = (item: Item) => {
    play("click");
    if (item.instant) item.run();
    else pending.current = item.run;
    setOpen(false);
  };

  const move = (offset: number) => {
    if (!results.length) return;
    const next = (active + offset + results.length) % results.length;
    setActive(next);
    listRef.current
      ?.querySelectorAll<HTMLElement>('[role="option"]')
      [next]?.scrollIntoView({ block: "nearest" });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") move(1);
    else if (event.key === "ArrowUp") move(-1);
    else return;
    event.preventDefault();
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const item = results[active];
    if (item) activate(item);
    else play("error");
  };

  const count = results.length;

  return (
    <Dialog open={open} onClose={close} title="Find File" className="w-[min(92vw,40rem)]">
      <form onSubmit={onSubmit}>
        <label
          htmlFor={`${baseId}-query`}
          className="block font-mono text-[11px] uppercase tracking-wider text-ink-soft"
        >
          Find items whose name contains:
        </label>
        <input
          ref={inputRef}
          id={`${baseId}-query`}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={count ? `${baseId}-${active}` : undefined}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
          placeholder="e.g. Rin, iOS, Night Mode"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            if (listRef.current) listRef.current.scrollTop = 0;
          }}
          onKeyDown={onKeyDown}
          className="mt-2 w-full appearance-none rounded-none border-2 border-ink bg-surface px-3 py-2 font-mono text-base placeholder:text-ash md:text-sm"
        />
      </form>

      <div className="mt-4 border-2 border-ink bg-surface">
        <div
          aria-hidden
          className={cn(
            "grid gap-x-3 border-b-2 border-ink bg-paper px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-soft",
            columns,
          )}
        >
          <span />
          <span>Name</span>
          <span className="hidden md:block">Kind</span>
          <span className="hidden md:block">Where</span>
        </div>

        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Items found"
          className="max-h-[40vh] overflow-y-auto"
        >
          {count ? (
            results.map((item, i) => {
              const selected = i === active;
              const meta = cn(
                "truncate font-mono text-[11px] uppercase tracking-wider",
                selected ? "text-paper/70" : "text-ink-soft",
              );
              return (
                <button
                  key={item.id}
                  id={`${baseId}-${i}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  tabIndex={-1}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseMove={() => {
                    if (!selected) setActive(i);
                  }}
                  onClick={() => activate(item)}
                  className={cn(
                    "grid w-full items-center gap-x-3 px-3 py-2 text-left text-sm",
                    columns,
                    selected && "bg-ink text-paper",
                  )}
                >
                  <PixelIcon map={glyphs[item.glyph]} fills={fills} size={12} className="shrink-0" />
                  <span className="min-w-0">
                    <span className="block truncate">{item.name}</span>
                    <span className={cn("block md:hidden", meta)}>
                      {item.kind} &middot; {item.where}
                    </span>
                  </span>
                  <span className={cn("hidden md:block", meta)}>{item.kind}</span>
                  <span className={cn("hidden md:block", meta)}>{item.where}</span>
                </button>
              );
            })
          ) : (
            <p className="px-3 py-8 text-center font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              No items match &ldquo;{query.trim()}&rdquo;
            </p>
          )}
        </div>
      </div>

      <p className="mt-3 flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
        <span aria-live="polite">
          {count} item{count === 1 ? "" : "s"} found
        </span>
        <span aria-hidden className="hidden md:inline">
          &uarr;&darr; move &middot; &crarr; open &middot; esc close
        </span>
      </p>
    </Dialog>
  );
};

export default FindFile;
