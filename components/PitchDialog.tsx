"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { FiArrowUpRight } from "react-icons/fi";

import { contactEmail } from "@/data";
import { cn } from "@/utils/cn";
import { play } from "@/utils/sound";
import { Box } from "@/utils/zoomRects";

import { Dialog } from "./ui/Dialog";
import { PixelIcon } from "./ui/PixelIcon";

type Detail = { name: string; from?: Box };

const platforms = ["iOS", "Android", "both"] as const;
type Platform = (typeof platforms)[number];

const subject = "I have an app idea for you";

const docMap = [
  "..#########.....",
  "..#ooooooo##....",
  "..#ooooooo#o#...",
  "..#ooooooo#oo#..",
  "..#ooooooo####..",
  "..#oooooooooo#..",
  "..#o###o###oo#..",
  "..#oooooooooo#..",
  "..#o######ooo#..",
  "..#oooooooooo#..",
  "..#o####o##oo#..",
  "..#oooooooooo#..",
  "..#o#######oo#..",
  "..#oooooooooo#..",
  "..############..",
  "................",
];

const fills = { "#": "currentColor", o: "rgb(var(--surface))" };

const ruled = {
  backgroundImage: "repeating-linear-gradient(transparent 0 27px, rgb(var(--ink) / 0.08) 27px 28px)",
};

const fill = (value: string) => value.trim() || "____";

type BlankProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
};

const Blank = ({ value, onChange, placeholder, label }: BlankProps) => (
  <input
    type="text"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    placeholder={placeholder}
    aria-label={label}
    autoComplete="off"
    style={{ width: `${Math.max(placeholder.length, value.length) + 2}ch` }}
    className="inline-block h-6 max-w-full border-b-2 border-ink bg-transparent px-1 align-baseline font-mono text-base leading-none text-ink placeholder:text-ash focus:border-steel-deep focus:bg-steel-wash focus:outline-none sm:text-sm"
  />
);

const PitchDialog = () => {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState<Box | null>(null);
  const [what, setWhat] = useState("");
  const [who, setWho] = useState("");
  const [workaround, setWorkaround] = useState("");
  const [problem, setProblem] = useState("");
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [name, setName] = useState("");
  const group = useId();
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onDialog = (event: Event) => {
      const detail = (event as CustomEvent<Detail>).detail;
      if (detail.name === "pitch") setFrom(detail.from ?? null);
      setOpen(detail.name === "pitch");
    };
    window.addEventListener("portfolio:dialog", onDialog);
    return () => window.removeEventListener("portfolio:dialog", onDialog);
  }, []);

  const words = [what, who, workaround, problem].join(" ").split(/\s+/).filter(Boolean).length;

  const send = () => {
    const signature = name.trim() ? ["", `— ${name.trim()}`] : [];
    const body = [
      `I keep wishing there were an app that ${fill(what)} for ${fill(who)}.`,
      `Right now I use ${fill(workaround)} and it ${fill(problem)}.`,
      `It should live on ${platform ?? "____"}.`,
      ...signature,
    ].join("\n");
    play("click");
    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    close();
  };

  return (
    <Dialog open={open} onClose={close} from={from} title="Untitled Pitch" className="w-[min(92vw,40rem)]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <div className="flex items-start gap-4">
          <PixelIcon map={docMap} fills={fills} size={48} className="shrink-0 text-ink" />
          <div className="min-w-0">
            <p className="font-serif text-2xl leading-tight">Fill in the blanks.</p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              Stationery pad &middot; Four blanks, one email
            </p>
          </div>
        </div>

        <div className="mt-5 border-2 border-ink bg-surface shadow-retro-sm">
          <div className="flex items-center justify-between gap-3 border-b-2 border-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
            <span>Untitled</span>
            <span aria-live="polite" className="tabular-nums">
              {words} {words === 1 ? "word" : "words"}
            </span>
          </div>
          <div className="px-4 py-3 font-sans sm:px-5" style={ruled}>
            <p className="text-base leading-7">
              I keep wishing there were an app that{" "}
              <Blank value={what} onChange={setWhat} placeholder="does what" label="What the app does" /> for{" "}
              <Blank value={who} onChange={setWho} placeholder="who" label="Who it is for" />. Right now I use{" "}
              <Blank
                value={workaround}
                onChange={setWorkaround}
                placeholder="current workaround"
                label="Current workaround"
              />{" "}
              and it{" "}
              <Blank value={problem} onChange={setProblem} placeholder="what goes wrong" label="What goes wrong" />.
            </p>
            <div
              role="radiogroup"
              aria-label="Platform"
              className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-3 text-base leading-7"
            >
              <span className="mr-1">It should live on</span>
              {platforms.map((option) => (
                <label
                  key={option}
                  className={cn(
                    "btn-retro px-3 py-1 text-xs has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-[3px] has-[:focus-visible]:outline-steel-deep",
                    platform === option ? "btn-ink" : "btn-paper",
                  )}
                >
                  <input
                    type="radio"
                    name={`${group}-platform`}
                    value={option}
                    checked={platform === option}
                    onChange={() => {
                      play("click");
                      setPlatform(option);
                    }}
                    className="sr-only"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        </div>

        <label className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
          <span>Your name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="optional"
            autoComplete="name"
            className="min-w-[10rem] flex-1 border-b-2 border-ink bg-transparent px-1 font-mono text-base normal-case tracking-normal text-ink placeholder:text-ash focus:border-steel-deep focus:bg-steel-wash focus:outline-none sm:text-sm"
          />
        </label>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button type="button" onClick={close} className="btn-retro btn-paper">
            Cancel
          </button>
          <button type="submit" className="btn-retro btn-ink btn-default">
            Send Pitch <FiArrowUpRight aria-hidden />
          </button>
        </div>
      </form>
    </Dialog>
  );
};

export default PitchDialog;
