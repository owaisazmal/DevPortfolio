"use client";

import { useEffect, useId, useState } from "react";
import { FiArrowUpRight, FiCheck, FiCopy } from "react-icons/fi";

import { contactEmail } from "@/data";
import { cn } from "@/utils/cn";
import { play } from "@/utils/sound";

import { PixelIcon } from "./ui/PixelIcon";

const stopMap = [
  "....########....",
  "...#oooooooo#...",
  "..#oooooooooo#..",
  ".#oooooooooooo#.",
  "#oooooo##oooooo#",
  "#oooooo##oooooo#",
  "#oooooo##oooooo#",
  "#oooooo##oooooo#",
  "#oooooo##oooooo#",
  "#oooooooooooooo#",
  "#oooooo##oooooo#",
  "#oooooo##oooooo#",
  ".#oooooooooooo#.",
  "..#oooooooooo#..",
  "...#oooooooo#...",
  "....########....",
];

const fills = { "#": "currentColor", o: "rgb(var(--paper))" };

type Topic = { label: string; subject: string; dialog?: "pitch" | "beta" };

const topics: Topic[] = [
  { label: "Freelance build", subject: "Let's build something together" },
  { label: "Beta testing", subject: "Sign me up for the beta", dialog: "beta" },
  { label: "App idea", subject: "I have an app idea for you", dialog: "pitch" },
  { label: "Just saying hi", subject: "Just saying hi" },
];

const ContactAlert = ({ className }: { className?: string }) => {
  const [copied, setCopied] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [topic, setTopic] = useState(0);
  const selectId = useId();

  useEffect(() => {
    if (!copied && !cancelled) return;
    const id = window.setTimeout(() => {
      setCopied(false);
      setCancelled(false);
    }, 2600);
    return () => window.clearTimeout(id);
  }, [copied, cancelled]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${contactEmail}`;
    }
  };

  const current = topics[topic];
  const href = `mailto:${contactEmail}?subject=${encodeURIComponent(current.subject)}`;

  const note = cancelled
    ? "No worries. The offer stays open."
    : copied
      ? "Email address copied. Talk soon."
      : current.dialog
        ? `OK opens the ${current.dialog === "pitch" ? "pitch pad" : "beta installer"}. Cancel does nothing, as usual.`
        : `OK opens an email to ${contactEmail}. Cancel does nothing, as usual.`;

  const ok = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!current.dialog) return;
    event.preventDefault();
    window.dispatchEvent(
      new CustomEvent("portfolio:dialog", {
        detail: { name: current.dialog, from: event.currentTarget.getBoundingClientRect() },
      }),
    );
  };

  return (
    <div
      role="group"
      aria-labelledby="contact-alert-title"
      className={cn("border-2 border-ink bg-paper p-1 shadow-retro", className)}
    >
      <div className="flex h-full flex-col border border-ink p-6 md:p-8">
        <div className="flex items-start gap-5">
          <PixelIcon map={stopMap} fills={fills} size={56} className="shrink-0 text-ink" />
          <div className="min-w-0">
            <h3 id="contact-alert-title" className="font-serif text-[2rem] leading-[1.12] md:text-[2.4rem]">
              Do you want to start a project together?
            </h3>
            <p className="mt-4 font-mono text-xs leading-relaxed text-ink-soft" aria-live="polite">
              {note}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label htmlFor={selectId} className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">
            Regarding:
          </label>
          <span className="relative inline-block">
            <select
              id={selectId}
              value={topic}
              onChange={(event) => {
                play("click");
                setTopic(Number(event.target.value));
              }}
              className="appearance-none border-2 border-ink bg-paper py-1.5 pl-3 pr-7 font-mono text-base uppercase tracking-wider text-ink shadow-retro-sm sm:text-xs"
            >
              {topics.map((item, index) => (
                <option key={item.label} value={index}>
                  {item.label}
                </option>
              ))}
            </select>
            <span
              aria-hidden
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm leading-none"
            >
              ▾
            </span>
          </span>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-end gap-3 md:mt-auto md:pt-8">
          <button type="button" onClick={copy} className="btn-retro btn-paper">
            {copied ? <FiCheck aria-hidden /> : <FiCopy aria-hidden />}
            {copied ? "Copied" : "Copy email"}
          </button>
          <button type="button" onClick={() => setCancelled(true)} className="btn-retro btn-paper">
            Cancel
          </button>
          <a href={href} onClick={ok} className="btn-retro btn-ink btn-default">
            OK <FiArrowUpRight aria-hidden />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactAlert;
