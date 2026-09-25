"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { FiArrowUpRight } from "react-icons/fi";

import { betaSeats, contactEmail, projects } from "@/data";
import { play } from "@/utils/sound";
import { Box } from "@/utils/zoomRects";

import { Dialog } from "./ui/Dialog";
import { PixelIcon } from "./ui/PixelIcon";

type Detail = { name: string; from?: Box };

const platforms = ["iOS", "Android", "Both"] as const;
type Platform = (typeof platforms)[number];

const subject = "Sign me up for the beta";

const testable = projects.filter((project) => project.icon);
const remaining = Math.max(0, betaSeats.total - betaSeats.taken);

const diskMap = [
  "################",
  "#oo##########oo#",
  "#oo#oooooooo#oo#",
  "#oo#oo####oo#oo#",
  "#oo#oo####oo#oo#",
  "#oo#oooooooo#oo#",
  "#oo##########oo#",
  "#oooooooooooooo#",
  "#o############o#",
  "#o#oooooooooo#o#",
  "#o#o###o####o#o#",
  "#o#oooooooooo#o#",
  "#o#o######ooo#o#",
  "#o#oooooooooo#o#",
  "#o############o#",
  "################",
];

const fills = { "#": "currentColor", o: "rgb(var(--paper))" };

const box = "h-4 w-4 shrink-0 appearance-none border-2 border-ink bg-paper transition-colors checked:bg-ink";
const checkbox = `${box} checked:shadow-[inset_0_0_0_2px_rgb(var(--paper))]`;
const radio = `${box} rounded-full checked:shadow-[inset_0_0_0_3px_rgb(var(--paper))]`;

const BetaDialog = () => {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState<Box | null>(null);
  const [chosen, setChosen] = useState<number[]>(() => testable.map((project) => project.id));
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [phone, setPhone] = useState("");
  const group = useId();
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onDialog = (event: Event) => {
      const detail = (event as CustomEvent<Detail>).detail;
      if (detail.name === "beta") setFrom(detail.from ?? null);
      setOpen(detail.name === "beta");
    };
    window.addEventListener("portfolio:dialog", onDialog);
    return () => window.removeEventListener("portfolio:dialog", onDialog);
  }, []);

  const toggle = (id: number) => {
    play("click");
    setChosen((value) => (value.includes(id) ? value.filter((item) => item !== id) : [...value, id]));
  };

  const install = () => {
    const apps = testable.filter((project) => chosen.includes(project.id)).map((project) => project.title);
    const body = [
      `Apps: ${apps.length ? apps.join(", ") : "____"}`,
      `Platform: ${platform ?? "____"}`,
      `Phone: ${phone.trim() || "____"}`,
    ].join("\n");
    play("click");
    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    close();
  };

  return (
    <Dialog open={open} onClose={close} from={from} title="Install Beta">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          install();
        }}
      >
        <div className="flex items-start gap-4">
          <PixelIcon map={diskMap} fills={fills} size={48} className="shrink-0 text-ink" />
          <div className="min-w-0">
            <p className="font-serif text-2xl leading-tight">Custom Install</p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              Check the apps you want to break on purpose
            </p>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Apps</legend>
          <ul className="mt-2 divide-y-2 divide-ink border-2 border-ink bg-surface">
            {testable.map((project) => (
              <li key={project.id}>
                <label className="flex items-center gap-3 px-3 py-2.5 transition-colors has-[:checked]:bg-steel-wash">
                  <input
                    type="checkbox"
                    checked={chosen.includes(project.id)}
                    onChange={() => toggle(project.id)}
                    className={checkbox}
                  />
                  <img
                    src={project.icon}
                    alt=""
                    width={24}
                    height={24}
                    className="h-6 w-6 shrink-0 border border-ink object-cover"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">{project.title}</span>
                  <span className="hidden shrink-0 font-mono text-[11px] uppercase tracking-wider text-ink-soft sm:inline">
                    {project.kind}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        <dl className="mt-3 flex flex-wrap justify-between gap-x-5 gap-y-1 font-mono text-xs">
          <div className="flex gap-2">
            <dt className="text-ink-soft">Seats remaining:</dt>
            <dd className="tabular-nums">{remaining}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-ink-soft">Selected:</dt>
            <dd className="tabular-nums">
              {chosen.length} of {testable.length}
            </dd>
          </div>
        </dl>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <fieldset>
            <legend className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Platform</legend>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
              {platforms.map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`${group}-platform`}
                    value={option}
                    checked={platform === option}
                    onChange={() => {
                      play("click");
                      setPlatform(option);
                    }}
                    className={radio}
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Phone model</span>
            <input
              type="text"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="optional"
              autoComplete="off"
              className="mt-2 block w-full border-2 border-ink bg-surface px-3 py-1.5 font-mono text-base text-ink placeholder:text-ash sm:text-sm"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button type="button" onClick={close} className="btn-retro btn-paper">
            Cancel
          </button>
          <button type="submit" className="btn-retro btn-ink btn-default">
            {remaining ? "Install" : "Join waitlist"} <FiArrowUpRight aria-hidden />
          </button>
        </div>
      </form>
    </Dialog>
  );
};

export default BetaDialog;
